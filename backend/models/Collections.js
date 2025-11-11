const mongoose = require('mongoose');

const collectionsSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true }
}, { timestamps: true });

collectionsSchema.index({ id: 1 }, { unique: true });

module.exports = collectionsSchema;