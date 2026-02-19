require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const ordersRouter = require('./routes/orders');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── HEALTH CHECK ─────────────────────────────────────────────
// Render pings this to check the service is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'restaurant-api', timestamp: new Date() });
});

// ─── ROUTES ───────────────────────────────────────────────────
app.use('/orders', ordersRouter);

// ─── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── START ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🍝 restaurant-api running on port ${PORT}`);
});
