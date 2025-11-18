const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GameModel } = require('./db');

const express = require('express');
const cors = require('cors');

// --- Routes ---
const loginRoutes = require('./routes/login.routes');
const userRoutes = require('./routes/user.routes');
const devRoutes = require('./routes/dev.routes');
const userGamesRoutes = require('./routes/userGames.routes');
const globalGamesRoutes = require('./routes/globalGames.routes');

const app = express();

// --- Middleware & Route Mounting ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', loginRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dev', devRoutes);
app.use('/api/user/games', userGamesRoutes);
app.use('/api/globalgames', globalGamesRoutes);

app.post('/api/import/games', async (req, res) => {
    console.log('[IMPORT] Received request to /api/import/games');
    const { games } = req.body;

    if (!games || !Array.isArray(games) || games.length === 0) {
        return res.status(400).json({ error: 'Body must be an object with a non-empty "games" array.' });
    }

    try {
        const result = await GameModel.insertMany(games, { ordered: false });
        return res.status(201).json({ message: `Successfully inserted ${result.length} new games.` });
    } catch (e) {
        if (e.code === 11000) {
            const insertedCount = e.result?.nInserted ?? 0;
            return res.status(200).json({ message: `Batch received. ${insertedCount} new games were inserted. Duplicates were ignored.` });
        }
        console.error("[IMPORT] Database Insertion Error:", e);
        return res.status(500).json({ error: 'An unexpected error occurred during database insertion.' });
    }
});

app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

app.use((err, _req, res, _next) => {
  console.error('--- UNHANDLED ERROR ---', err);
  res.status(500).json({ message: 'Server error.' });
});

module.exports = app;