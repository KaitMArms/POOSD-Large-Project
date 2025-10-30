const mongoose = require('mongoose');

const usergameSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
    slug: {type: String}
}, { timestamps: true });

usergameSchema.index({ id: 1 }, { unique: true });

module.exports = mongoose.model('Perspective', usergameSchema);