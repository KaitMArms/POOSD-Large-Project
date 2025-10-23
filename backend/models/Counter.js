const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  _id:      { type: String, required: true },
  sequence: { type: Number, default: 0 }
}, { collection: 'counters' });

module.exports = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);
