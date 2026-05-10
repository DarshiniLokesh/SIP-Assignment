-- schema.sql

-- Investors table
CREATE TABLE IF NOT EXISTS investors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mutual Funds table
CREATE TABLE IF NOT EXISTS mutual_funds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amc_name VARCHAR(255) NOT NULL,
    nav NUMERIC(10, 4) NOT NULL, -- Net Asset Value
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolios table
-- We assume an investor can have one or more portfolios. 
-- For simplicity, many systems just have 1 portfolio per investor, but 1-to-many is more flexible.
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    investor_id INT NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'Main Portfolio',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SIP Registrations table
CREATE TABLE IF NOT EXISTS sips (
    id SERIAL PRIMARY KEY,
    investor_id INT NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    portfolio_id INT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    fund_id INT NOT NULL REFERENCES mutual_funds(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    execution_date INT NOT NULL CHECK (execution_date BETWEEN 1 AND 28), -- Day of the month
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investment Transactions table (Lump sum and SIP executions)
CREATE TABLE IF NOT EXISTS investment_transactions (
    id SERIAL PRIMARY KEY,
    sip_id INT REFERENCES sips(id) ON DELETE SET NULL, -- Can be null if it's a lump sum
    portfolio_id INT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    fund_id INT NOT NULL REFERENCES mutual_funds(id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL DEFAULT 'BUY', -- BUY, SELL
    amount NUMERIC(15, 2) NOT NULL,
    units NUMERIC(15, 4) NOT NULL,
    nav_at_transaction NUMERIC(10, 4) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio Holdings table (Aggregated state of current units per fund in a portfolio)
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    fund_id INT NOT NULL REFERENCES mutual_funds(id) ON DELETE CASCADE,
    units NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (portfolio_id, fund_id) -- Ensures 1 record per fund per portfolio
);
