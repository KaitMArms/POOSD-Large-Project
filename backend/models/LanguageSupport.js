const mongoose = require('mongoose');

const languageSupportScheme = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 

    game: { type: Number, required: true, index: true }, 

    language: { type: Number, required: true, index: true }, 

    language_support_type: { type: Number, required: true },

}, { timestamps: true });

languageSupportScheme.index({ id: 1 }, { unique: true });

module.exports = languageSupportScheme;