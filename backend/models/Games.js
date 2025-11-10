const mongoose = require('mongoose');

// Mongoose schema to store the Game schema
const gameSchema = new mongoose.Schema({
    // IGDB game reference id
    id: { type: Number, required: true},
    gameId: { type: Number, unique: true},
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
    userRating: {type : Number, default: 0},
    themes: [ {type: Number}],
    language_supports: [{type: Number}],
    keywords: [{type: Number}],
    game_type:{type: Number},
    player_perspectives:[{type: Number}],
    developers: [{ type: mongoose.Schema.Types.ObjectID, index: true , ref: 'User'}],
    isDev: {type: Boolean, default: false, index: true},
    rating: {type: Number},
    rating_count: {type: Number},
    version_parent: {type: Number},
    parent_game: {type: Number},
    involved_companies: [{type: Number}],
    game_engines: [{type: Number}],
    collections: [{type: Number}],
    first_release_date: {type: Timestamp},
    storyline: {type: String}, 
    summary: {type: String}
}, 
{ 
    timestamps: true 
});

// Requires the IGDB index to be unique
gameSchema.index({id: 1}, {unique: true});

// Creates the Game collection
module.exports = gameSchema;
