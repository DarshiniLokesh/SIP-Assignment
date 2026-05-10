const db = require('../db');

exports.createFund = async (req, res, next) => {
  try {
    const { name, amc_name, nav } = req.body;
    
    const query = `
      INSERT INTO mutual_funds (name, amc_name, nav)
      VALUES ($1, $2, $3) RETURNING *;
    `;
    
    const result = await db.query(query, [name, amc_name, nav]);
    res.status(201).json({ message: 'Fund created successfully', fund: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.getFunds = async (req, res, next) => {
  try {
    const query = `SELECT * FROM mutual_funds ORDER BY name ASC;`;
    const result = await db.query(query);
    res.status(200).json({ funds: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.updateNav = async (req, res, next) => {
  try {
    const { fundId } = req.params;
    const { nav } = req.body;
    
    const query = `
      UPDATE mutual_funds
      SET nav = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *;
    `;
    
    const result = await db.query(query, [nav, fundId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fund not found' });
    }
    
    res.status(200).json({ message: 'NAV updated successfully', fund: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
