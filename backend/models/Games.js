const mongoose = require('mongoose');
const gamesConn = mongoose.createConnection(process.env.MONGO_URI_GAMES, {
  serverSelectionTimeoutMS: 10000,
});

gamesConn.once('open', () => console.log('MongoDB connected: GamesDB'));

const gameSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    name: { type: String, required: true },
    slug: { type: String },
    summary: { type: String },
    first_release_date: { type: Number }, 
    genres: [ {type: Number} ], 
    cover: { type: Number },
    age_ratings: [{type : Number}],
    franchise: {type: Number},
    platforms: [ {type: Number}],
    rating: {type : Number, default: 0}
}, 
{ 
    timestamps: true 
});


module.exports = mongoose.model('Game', gameSchema);
