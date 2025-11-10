const mongoose = require('mongoose');

const usergameSchema = new mongoose.Schema({
    id: { type: Number, required: true}, 
    name: { type: String, required: true },
    status: { type: String, enum: ['completed', 'in-progress', 'on-hold', 'dropped', 'to-play'], default: 'in-progress'},
    isLiked: {type: Boolean, default: false},
    userRating: {type: Number},
    isDeveloperGame: {type: Boolean, default: false},
    review:  { type: String, trim: true, maxlength: 500 }//max 500 chars
}, { timestamps: true });

module.exports = usergameSchema;
