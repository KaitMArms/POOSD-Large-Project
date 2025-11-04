const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');

function required(name) {
  const val = process.env[name];
  if (!val) {
    console.error(`❌ Missing required env var: ${name}. Did .env load? Is path correct?`);
    process.exit(1);
  }
  return val;
}

function createDbConnection(uri, dbName) {
  const conn = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  conn.on('connected', () => console.log(`✅ MongoDB connected: ${dbName}`));
  conn.on('error', (err) => {
    console.error(`❌ MongoDB connection error for ${dbName}:`, err);
    // optional: keep running instead of exiting; for now we exit to be explicit
    process.exit(1);
  });

  return conn;
}

const userConnection = createDbConnection(required('MONGO_URI_USERS'), 'Users');
const gameConnection = createDbConnection(required('MONGO_URI_GAMES'), 'GameDB');

module.exports = { userConnection, gameConnection };
 