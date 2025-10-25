require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// quick health route
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI_USERS, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected: UsersDB');

    // register models that use this default connection
    require('./models/Counter');
    require('./models/Users');

    // mount routes (auth first)
    app.use('/api/auth', require('./routes/auth.routes'));

    // games route will handle its own separate connection
    app.use('/api/games', require('./apiFiles/addgames'));

    const PORT = process.env.PORT || 8080;
    
    app.listen(PORT, '0.0.0.0', () => console.log(`Listening on port ${PORT}`));

  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

start();