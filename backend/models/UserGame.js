const mongoose = require('mongoose');

const usergameSchema = new mongoose.Schema({
  id:      { type: Number, required: true }, // IGDB game id (matches Games.id)
  name:    { type: String, required: true },
  status:  { type: String, enum: ['completed', 'in-progress', 'on-hold', 'dropped', 'to-play'], default: 'in-progress' },
  isLiked: { type: Boolean, default: false },
  rating:  { type: Number, min: 0, max: 10 },
  review:  { type: String, trim: true, maxlength: 500 }//max 500 chars
}, { _id: false, timestamps: true });

module.exports = usergameSchema;
