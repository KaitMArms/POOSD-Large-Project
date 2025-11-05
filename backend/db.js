const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');

function createDbConnection(uri, dbName){
	const db = mongoose.createConnection(uri);

	db.on('connected', () => {
		console.log(`MongoDB connected: ${dbName}`);
	});

	db.on('error', (err) => {
		console.error(`MongoDB connection error for ${dbName}:`, err);
		process.exit(1);
	});

  return db;
}

const userConnection = createDbConnection(process.env.MONGO_URI_USERS, 'UsersDB');
const gameConnection = createDbConnection(process.env.MONGO_URI_GAMES, 'GameDB');

const AgeRatingSchema = require('./models/AgeRating');
const CounterSchema = require('./models/Counter');
const CoverSchema = require('./models/Cover');
const GameModeSchema = require('./models/GameMode');
const GameTypeSchema = require('./models/GameType');
const GameSchema = require('./models/Games');
const GenreSchema = require('./models/Genre');
const LanguageSchema = require('./models/Languages');
const PerspectiveSchema = require('./models/Perspective');
const PlatformSchema = require('./models/Platform');
const ThemeSchema = require('./models/Themes');
const UserSchema = require('./models/Users');
const FranchiseSchema = require('./models/Franchise');
const KeywordSchema = require('./models/KeyWords');

const UserModel = userConnection.models.User || userConnection.model('User', UserSchema);
const CounterModel = userConnection.models.Counter || userConnection.model('Counter', CounterSchema);

const GameModel = gameConnection.models.Game || gameConnection.model('Game', GameSchema);
const PlatformModel = gameConnection.models.Platform || gameConnection.model('Platform', PlatformSchema);
const GenreModel = gameConnection.models.Genre || gameConnection.model('Genre', GenreSchema);
const FranchiseModel = gameConnection.models.Franchise || gameConnection.model('Franchise', FranchiseSchema);
const CoverModel = gameConnection.models.Cover || gameConnection.model('Cover', CoverSchema);
const AgeRatingModel = gameConnection.models.AgeRating || gameConnection.model('AgeRating', AgeRatingSchema);
const GameModeModel = gameConnection.models.GameMode || gameConnection.model('GameMode', GameModeSchema);
const GameTypeModel = gameConnection.models.GameType || gameConnection.model('GameType', GameTypeSchema);
const LanguageModel = gameConnection.models.Language || gameConnection.model('Language', LanguageSchema);
const PerspectiveModel = gameConnection.models.Perspective || gameConnection.model('Perspective', PerspectiveSchema);
const ThemeModel = gameConnection.models.Theme || gameConnection.model('Theme', ThemeSchema);
const KeywordModel = gameConnection.models.Keyword || gameConnection.model('Keyword', KeywordSchema);


const connectionsReady = Promise.all([
	userConnection.asPromise(),
	gameConnection.asPromise()
]).then(() => {
	console.log("--- All database connections are ready ---");
});


module.exports = { 
    userConnection, 
    gameConnection, 
    connectionsReady,

    UserModel,
    CounterModel,
    GameModel,
    PlatformModel,
    GenreModel,
    FranchiseModel,
    CoverModel,
    AgeRatingModel,
    GameModeModel,
    GameTypeModel,
    LanguageModel,
    PerspectiveModel,
    ThemeModel,
    KeywordModel
};
