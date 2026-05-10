# SIP Tracker and Portfolio Valuation System

This project is a backend system to manage Systematic Investment Plans (SIPs) and investor portfolios for a fintech platform.

## Features Supported
- **Investor Management**: Create investors and view their profile, holdings, and net worth.
- **Mutual Fund Management**: Add mutual funds, view all funds, and update NAV values.
- **SIP Management**: Register new SIPs.
- **SIP Processing**: Process SIP installments manually via API, logging transactions and updating investor portfolios within secure Database Transactions (`BEGIN`, `COMMIT`, `ROLLBACK`).
- **Portfolio Valuation**: Real-time computation of holdings and net worth based on current mutual fund NAVs.

## Technology Stack
- Node.js & Express.js (REST API framework)
- PostgreSQL (Database)
- pg (PostgreSQL client for Node.js)

## Prerequisites
- Node.js (v14+)
- PostgreSQL installed and running

## Database Setup
1. Create a database in PostgreSQL:
   ```sql
   CREATE DATABASE sip_tracker;
   ```
2. Set the `DATABASE_URL` environment variable (or let it default to `postgresql://postgres:postgres@localhost:5432/sip_tracker`).
3. Run the schema creation script using psql or a DB UI tool:
   ```bash
   psql -U postgres -d sip_tracker -f db/schema.sql
   ```
4. (Optional) Run the seed script to populate sample mock data:
   ```bash
   psql -U postgres -d sip_tracker -f db/seed.sql
   ```

## Running the Application
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server (development mode):
   ```bash
   npx nodemon server.js
   ```
   Or standard start:
   ```bash
   node server.js
   ```

## Documentation
- **ER Diagram**: View `docs/ER_Diagram.md` for a complete Entity Relationship Diagram covering 3NF design.
- **API Collection**: Import `docs/API_Collection.json` into Postman to test all endpoints.
- **Transactions Example**: Refer to `controllers/sipsController.js` inside the `processSip` function to see exactly how DB transactions are handled (BEGIN TRANSACTION, COMMIT, ROLLBACK).
