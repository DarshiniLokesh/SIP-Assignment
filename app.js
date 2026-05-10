const express = require('express');
const cors = require('cors');

const investorsRoutes = require('./routes/investors');
const fundsRoutes = require('./routes/funds');
const sipsRoutes = require('./routes/sips');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/investors', investorsRoutes);
app.use('/api/funds', fundsRoutes);
app.use('/api/sips', sipsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

module.exports = app;
