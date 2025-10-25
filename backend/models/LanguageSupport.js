const mongoose = require('mongoose');

const languageScheme = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
}, { timestamps: true });

languageScheme.index({ id: 1 }, { unique: true });

module.exports = mongoose.model('Languages', languageScheme);