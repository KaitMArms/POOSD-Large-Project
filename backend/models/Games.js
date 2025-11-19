const mongoose = require('mongoose');

// Mongoose schema to store the Game schema
const gameSchema = new mongoose.Schema(
  {
    // IGDB game reference id (or >= 1e9 for dev games)
    id: { type: Number, required: true },
    gameId: { type: Number, unique: true },
    clusterId: { type: Number, index: true },
    name: { type: String, required: true },
    // url-tag
    slug: { type: String },
    summary: { type: String },
    first_release_date: { type: Number }, // unix seconds
    // IGDB numeric ids
    genres: [{ type: Number }],
    // https://api.igdb.com/v4/covers
    // cover stores the id for the url
    cover: { type: Number },
    age_ratings: [{ type: Number }],
    franchise: { type: Number },
    artworks: [{type: Number}],
    // Stores what platform the game is available on (IGDB numeric ids)
    platforms: [{ type: Number }],

    userRating: { type: Number, default: 0 },
    userRatingCount: {type: Number, default: 0},
    themes: [{ type: Number }],
    language_supports: [{ type: Number }],
    keywords: [{ type: Number }],
    game_type: { type: Number },
    player_perspectives: [{ type: Number }],

    // Developers are User ObjectIds
    developers: [
      { type: mongoose.Schema.Types.ObjectId, index: true, ref: 'User' },
    ],

    // Dev-created game flag
    isDev: { type: Boolean, default: false, index: true },

    rating: { type: Number },
    rating_count: { type: Number },
    version_parent: { type: Number },
    parent_game: { type: Number },
    involved_companies: [{ type: Number }],
    game_engines: [{ type: Number }],
    collections: [{ type: Number }],
    storyline: { type: String },
    dev_cover_url: { type: String },

    // ─────────────────────────────────────────────────────
    // Dev-only friendly fields (what the UI actually uses)
    // ─────────────────────────────────────────────────────
    devPlatformNames: {
      type: [String],
      default: [],
    }, // e.g. ["PC", "PlayStation 5"]

    devGenreNames: {
      type: [String],
      default: [],
    }, // e.g. ["Action", "Turn-Based"]

    devDeveloperUsernames: {
      type: [String],
      default: [],
    }, // e.g. ["kevintto", "otherdev"]

    devStatus: {
      type: String,
      default: 'In Development', // "In Development" | "Released" | "Cancelled"
    },
  },
  {
    timestamps: true,
  }
);

// Requires the IGDB index to be unique
gameSchema.index({ id: 1 }, { unique: true });

// Creates the Game collection
module.exports = gameSchema;
