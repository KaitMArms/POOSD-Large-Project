const mongoose = require('mongoose');
const { gameConnection } = require('../db');


const gameSchema = new mongoose.Schema({
    id: { type: Number, required: true}, 
    name: { type: String, required: true },
    slug: { type: String },
    summary: { type: String },
    first_release_date: { type: Number }, 
    genres: [ {type: Number} ], 
    cover: { type: Number },
    age_ratings: [{type : Number}],
    franchise: {type: Number},
    platforms: [ {type: Number}],
    rating: {type : Number, default: 0},
    themes: [ {type: Number}],
    language_supports: [{type: Number}],
    keywords: [{type: Number}],
    game_modes: [{type: Number}],
    game_type:{type: Number},
    player_perspectives:[{type: Number}]
}, 
{ 
    timestamps: true 
});

gameSchema.index({id: 1}, {unique: true});

module.exports = gameConnection.models.game || gameConnection.model('Game', gameSchema);
