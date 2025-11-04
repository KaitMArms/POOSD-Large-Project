require('dotenv').config();

require('./db');

const express = require('express');
const cors = require('cors');

// --- Routes ---
const loginRoutes = require('./routes/login.routes');
const userRoutes = require('./routes/user.routes');
const devRoutes = require('./routes/dev.routes');
const userGamesRoutes = require('./routes/userGames.routes');
const globalGamesRoures = require('./routes/globalGames.routes');
//const passwordRoutes = require('./routes/password.routes');

const app = express();

// --- Middleware ---
app.use(cors({ origin: true, credentials: true }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', loginRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dev', devRoutes);
app.use('/api/user/games', userGamesRoutes);
app.use('/api/globalgames', globalGamesRoures);
//app.use('/api/password/', passwordRoutes);

app.get('/health', (_req, res) => res.status(200).json({ ok: true }));
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error.' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 API listening on port ${port}`));
