const mongoose = require('mongoose');

const coverSchema = new mongoose.Schema({
    id: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    image_id: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

coverSchema.index({ id: 1 }, { unique: true });

module.exports = coverSchema;