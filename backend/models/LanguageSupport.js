const mongoose = require('mongoose');

const languageSupportScheme = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
}, { timestamps: true });

languageSupportScheme.index({ id: 1 }, { unique: true });

module.exports = languageSupportScheme;
