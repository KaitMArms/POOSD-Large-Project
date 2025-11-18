const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
    id: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    artwork_type: { 
        type: Number, 
        required: true 
    },
    url: {
        type: String,
        required: true
    }
}, { timestamps: true });

artworkSchema.index({ id: 1 }, { unique: true });

module.exports = artworkSchema;