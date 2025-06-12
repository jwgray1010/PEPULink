const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('PEPULink API is running!');
});

// Top Up Card endpoint
app.post('/api/topup', (req, res) => {
  // TODO: Integrate swap logic and card provider API
  res.json({ status: 'success', message: 'Card topped up!' });
});

// Card details endpoint
app.get('/api/card', (req, res) => {
  res.json({
    cardNumber: '4242 4242 4242 4242',
    expiration: '12/30',
    balance: 100,
  });
});

// Transaction history endpoint
app.get('/api/history', (req, res) => {
  res.json([
    { type: 'topup', amount: 50, date: '2025-06-09' },
    { type: 'spend', amount: -20, date: '2025-06-08' },
  ]);
});

// Transaction status endpoint (mock)
app.get('/api/tx/:hash', (req, res) => {
  const { hash } = req.params;
  // TODO: Integrate with blockchain provider for real status
  res.json({ hash, status: 'pending' });
});

app.listen(3000, () => console.log('Backend running on port 3000'));