require('dotenv').config();
require('./db');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const addgamesRouter = require('./apiFiles/addgames');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json( {limit: '50mb'}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', addgamesRouter);

// Health check
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// 404 handler
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

// Global error handler (optional)
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error.' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Listening on port ${port}'));
