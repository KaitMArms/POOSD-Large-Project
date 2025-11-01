const mongoose = require('mongoose');
const { gameConnection } = require('../db');


// Mongoose schema to store the Game schema
const gamemodesModel = new mongoose.Schema({
    // IGDB game reference id
    id: { type: Number, required: true}, 
    clusterId: {type: Number, index: true},
    name: { type: String, required: true },
    // url-tag
    slug: { type: String },
    summary: { type: String },
    first_release_date: { type: Number }, 
    genres: [ {type: Number} ], 
    // https://api.igdb.com/v4/covers
    // cover stores the id for the url
    cover: { type: Number },
    age_ratings: [{type : Number}],
    franchise: {type: Number},
    // Stores what platform the game is available on
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

// Requires the IGDB index to be unique
gameSchema.index({id: 1}, {unique: true});

// Creates the Game collection
module.exports = gamemodesModel;
