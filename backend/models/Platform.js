const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
    slug: { type: String }
}, { timestamps: true });

platformSchema.index({ id: 1 }, { unique: true });

module.exports = mongoose.model('Platform', platformSchema);