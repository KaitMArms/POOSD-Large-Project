// put this in backend/models/GameCounter.js
const mongoose = require('mongoose');
const { gameConnection } = require('../db');

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 },
}, { collection: 'counters' });


module.exports = gameConnection.models.GameCounter
  || gameConnection.model('GameCounter', CounterSchema);
