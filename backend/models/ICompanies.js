const mongoose = require('mongoose');

const involvedComSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    company: { type: Number, required: true }
}, { timestamps: true });

involvedComSchema.index({ id: 1 }, { unique: true });

module.exports = involvedComSchema;