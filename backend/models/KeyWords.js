const mongoose = require('mongoose');

const keywordsModel = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
    slug: { type: String }
}, { timestamps: true });

keywordsModel.index({ id: 1 }, { unique: true });

module.exports = keywordsModel;