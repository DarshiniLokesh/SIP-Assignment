const db = require('../db');

exports.createInvestor = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone } = req.body;
    
    // Begin transaction as we are creating investor and a default portfolio
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      const insertInvestorQuery = `
        INSERT INTO investors (first_name, last_name, email, phone) 
        VALUES ($1, $2, $3, $4) RETURNING *;
      `;
      const investorRes = await client.query(insertInvestorQuery, [first_name, last_name, email, phone]);
      const investor = investorRes.rows[0];
      
      const insertPortfolioQuery = `
        INSERT INTO portfolios (investor_id, name)
        VALUES ($1, $2) RETURNING *;
      `;
      await client.query(insertPortfolioQuery, [investor.id, 'Main Portfolio']);
      
      await client.query('COMMIT');
      res.status(201).json({ message: 'Investor created successfully', investor });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllInvestors = async (req, res, next) => {
  try {
    const query = `
      SELECT i.*, json_agg(p.*) as portfolios 
      FROM investors i 
      LEFT JOIN portfolios p ON i.id = p.investor_id 
      GROUP BY i.id 
      ORDER BY i.id ASC;
    `;
    const result = await db.query(query);
    res.status(200).json({ investors: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.getInvestor = async (req, res, next) => {
  try {
    const { investorId } = req.params;
    const query = `
      SELECT i.*, json_agg(p.*) as portfolios 
      FROM investors i 
      LEFT JOIN portfolios p ON i.id = p.investor_id 
      WHERE i.id = $1
      GROUP BY i.id;
    `;
    const result = await db.query(query, [investorId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    
    // Postgres json_agg returns [null] if there are no matches on LEFT JOIN, let's clean it up
    const investor = result.rows[0];
    if (investor.portfolios.length === 1 && investor.portfolios[0] === null) {
      investor.portfolios = [];
    }
    
    res.status(200).json({ investor });
  } catch (err) {
    next(err);
  }
};

exports.getHoldings = async (req, res, next) => {
  try {
    const { investorId } = req.params;
    
    const query = `
      SELECT 
        mf.name AS fund_name,
        mf.nav AS current_nav,
        ph.units AS units_held,
        (ph.units * mf.nav) AS current_value
      FROM portfolio_holdings ph
      JOIN portfolios p ON ph.portfolio_id = p.id
      JOIN mutual_funds mf ON ph.fund_id = mf.id
      WHERE p.investor_id = $1 AND ph.units > 0;
    `;
    
    const result = await db.query(query, [investorId]);
    res.status(200).json({ holdings: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.getNetworth = async (req, res, next) => {
  try {
    const { investorId } = req.params;
    
    const query = `
      SELECT 
        COALESCE(SUM(ph.units * mf.nav), 0) AS net_worth
      FROM portfolio_holdings ph
      JOIN portfolios p ON ph.portfolio_id = p.id
      JOIN mutual_funds mf ON ph.fund_id = mf.id
      WHERE p.investor_id = $1;
    `;
    
    const result = await db.query(query, [investorId]);
    const net_worth = parseFloat(result.rows[0].net_worth).toFixed(2);
    
    res.status(200).json({ investor_id: investorId, net_worth });
  } catch (err) {
    next(err);
  }
};
