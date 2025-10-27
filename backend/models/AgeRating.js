const mongoose = require('mongoose');

const ageratingSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
    slug: { type: String }
}, { timestamps: true });

ageratingSchema.index({ id: 1 }, { unique: true });

module.exports = mongoose.model('AgeRating', ageratingSchema);