const mongoose = require('mongoose');

const gamemodesModel = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
    slug: { type: String }
}, { timestamps: true });

gamemodesModel.index({ id: 1 }, { unique: true });

module.exports = gamemodesModel;