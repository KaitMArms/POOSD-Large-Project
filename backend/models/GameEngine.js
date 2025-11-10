const mongoose = require('mongoose');

const gameEngineSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true }
}, { timestamps: true });

gameEngineSchema.index({ id: 1 }, { unique: true });

module.exports = gameEngineSchema;