const db = require('../db');

exports.registerSip = async (req, res, next) => {
  try {
    const { investor_id, fund_id, amount, execution_date } = req.body;
    
    // Validate inputs
    if (execution_date < 1 || execution_date > 28) {
      return res.status(400).json({ error: 'Execution date must be between 1 and 28' });
    }
    
    // Get default portfolio for the investor
    const portfolioQuery = `SELECT id FROM portfolios WHERE investor_id = $1 LIMIT 1;`;
    const portfolioRes = await db.query(portfolioQuery, [investor_id]);
    
    if (portfolioRes.rows.length === 0) {
      return res.status(404).json({ error: 'Investor or portfolio not found' });
    }
    
    const portfolio_id = portfolioRes.rows[0].id;
    
    const sipQuery = `
      INSERT INTO sips (investor_id, portfolio_id, fund_id, amount, execution_date)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    
    const sipRes = await db.query(sipQuery, [investor_id, portfolio_id, fund_id, amount, execution_date]);
    
    res.status(201).json({ message: 'SIP registered successfully', sip: sipRes.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.getSip = async (req, res, next) => {
  try {
    const { sipId } = req.params;
    const query = `
      SELECT s.*, mf.name AS fund_name, i.first_name, i.last_name 
      FROM sips s
      JOIN mutual_funds mf ON s.fund_id = mf.id
      JOIN investors i ON s.investor_id = i.id
      WHERE s.id = $1;
    `;
    const result = await db.query(query, [sipId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SIP not found' });
    }
    
    res.status(200).json({ sip: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.processSip = async (req, res, next) => {
  // TRANSACTION REQUIREMENT DEMONSTRATION
  const client = await db.getClient();
  try {
    const { sipId } = req.params;
    
    // 1. Get SIP details
    const sipQuery = `SELECT * FROM sips WHERE id = $1 AND status = 'ACTIVE';`;
    const sipRes = await client.query(sipQuery, [sipId]);
    
    if (sipRes.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Active SIP not found' });
    }
    
    const sip = sipRes.rows[0];
    
    // 2. Get Fund details for current NAV
    const fundQuery = `SELECT * FROM mutual_funds WHERE id = $1;`;
    const fundRes = await client.query(fundQuery, [sip.fund_id]);
    const fund = fundRes.rows[0];
    
    const nav = parseFloat(fund.nav);
    const amount = parseFloat(sip.amount);
    const units = parseFloat((amount / nav).toFixed(4));
    
    // Start Transaction
    await client.query('BEGIN');
    
    // 3. Create Investment Transaction record
    const insertTransactionQuery = `
      INSERT INTO investment_transactions (sip_id, portfolio_id, fund_id, transaction_type, amount, units, nav_at_transaction)
      VALUES ($1, $2, $3, 'BUY', $4, $5, $6) RETURNING *;
    `;
    const txRes = await client.query(insertTransactionQuery, [
      sip.id, sip.portfolio_id, sip.fund_id, amount, units, nav
    ]);
    
    // 4. Update Portfolio Holdings (Upsert equivalent)
    // Check if holding exists
    const checkHoldingQuery = `
      SELECT id FROM portfolio_holdings 
      WHERE portfolio_id = $1 AND fund_id = $2;
    `;
    const holdingRes = await client.query(checkHoldingQuery, [sip.portfolio_id, sip.fund_id]);
    
    if (holdingRes.rows.length > 0) {
      // Update existing
      const updateHoldingQuery = `
        UPDATE portfolio_holdings 
        SET units = units + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
      `;
      await client.query(updateHoldingQuery, [units, holdingRes.rows[0].id]);
    } else {
      // Insert new
      const insertHoldingQuery = `
        INSERT INTO portfolio_holdings (portfolio_id, fund_id, units)
        VALUES ($1, $2, $3);
      `;
      await client.query(insertHoldingQuery, [sip.portfolio_id, sip.fund_id, units]);
    }
    
    // Commit Transaction
    await client.query('COMMIT');
    
    res.status(200).json({ 
      message: 'SIP processed successfully', 
      transaction: txRes.rows[0]
    });
  } catch (err) {
    // Rollback Transaction on error
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.getSipTransactions = async (req, res, next) => {
  try {
    const { sipId } = req.params;
    
    const query = `
      SELECT t.*, mf.name as fund_name 
      FROM investment_transactions t
      JOIN mutual_funds mf ON t.fund_id = mf.id
      WHERE t.sip_id = $1
      ORDER BY t.transaction_date DESC;
    `;
    
    const result = await db.query(query, [sipId]);
    res.status(200).json({ transactions: result.rows });
  } catch (err) {
    next(err);
  }
};
