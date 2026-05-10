-- seed.sql

-- Clear existing data
TRUNCATE TABLE investment_transactions, portfolio_holdings, sips, portfolios, mutual_funds, investors RESTART IDENTITY CASCADE;

-- Insert Investors
INSERT INTO investors (first_name, last_name, email, phone) VALUES
('John', 'Doe', 'john.doe@example.com', '1234567890'),
('Jane', 'Smith', 'jane.smith@example.com', '0987654321');

-- Insert Portfolios (Assuming each investor gets a default portfolio)
INSERT INTO portfolios (investor_id, name) VALUES
(1, 'Main Portfolio'),
(2, 'Main Portfolio');

-- Insert Mutual Funds
INSERT INTO mutual_funds (name, amc_name, nav) VALUES
('HDFC Mid-Cap Opportunities Fund', 'HDFC Mutual Fund', 145.67),
('SBI Small Cap Fund', 'SBI Mutual Fund', 189.20),
('Axis Bluechip Fund', 'Axis Mutual Fund', 55.40);

-- Insert SIPs
-- John Doe starts a SIP of 5000 in Axis Bluechip Fund on the 5th of every month
INSERT INTO sips (investor_id, portfolio_id, fund_id, amount, execution_date) VALUES
(1, 1, 3, 5000.00, 5);

-- Jane Smith starts a SIP of 10000 in HDFC Mid-Cap Fund on the 10th of every month
INSERT INTO sips (investor_id, portfolio_id, fund_id, amount, execution_date) VALUES
(2, 2, 1, 10000.00, 10);

-- Sample Transactions (Simulating past SIP executions)
-- Assume John's SIP was processed once when NAV was 55.00
INSERT INTO investment_transactions (sip_id, portfolio_id, fund_id, transaction_type, amount, units, nav_at_transaction) VALUES
(1, 1, 3, 'BUY', 5000.00, 90.9091, 55.00);

-- Update Portfolio Holdings based on that transaction
INSERT INTO portfolio_holdings (portfolio_id, fund_id, units) VALUES
(1, 3, 90.9091);
