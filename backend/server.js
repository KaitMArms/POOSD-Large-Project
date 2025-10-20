require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// 404 handler
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

// Global error handler (optional)
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error.' });
});

// Mongo + server bootstrap
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log('Mongo connected');

    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`API listening on port ${port}`));
  } catch (err) {
    console.error('Mongo connection error:', err);
    process.exit(1);
  }
}

start();