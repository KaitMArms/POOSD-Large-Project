const mongoose = require('mongoose');

const usergameSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
    status: { type: String, enum: ['completed', 'in-progress', 'on-hold', 'dropped', 'to-play'], default: 'in-progress'},
    isLiked: {type: Boolean, default: false}
}, { timestamps: true });

module.exports = usergameSchema;