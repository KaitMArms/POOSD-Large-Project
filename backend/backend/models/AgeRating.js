const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
    slug: { type: String }
}, { timestamps: true });

genreSchema.index({ id: 1 }, { unique: true });

module.exports = mongoose.model('AgeRating', genreSchema);