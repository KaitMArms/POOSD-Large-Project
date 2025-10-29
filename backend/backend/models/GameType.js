const mongoose = require('mongoose');

const gametypeModel = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    type: { type: String, required: true }
}, { timestamps: true });

gametypeModel.index({ id: 1 }, { unique: true });

module.exports = mongoose.model('GameTypes', gametypeModel);
