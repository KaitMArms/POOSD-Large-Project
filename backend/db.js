const path = require('path');
const mongoose = require('mongoose');

function createDbConnection(uri, dbName){
    if (!uri) {
        throw new Error(`FATAL: MongoDB URI for ${dbName} is undefined. Check .env file.`);
    }
    
    const db = mongoose.createConnection(uri);

    db.on('connected', () => {
        console.log(`MongoDB connected: ${dbName}`);
    });

    db.on('error', (err) => {
        console.error(`MongoDB connection error for ${dbName}:`, err.message);
        process.exit(1); 
    });

    return db;
}

const userConnection = createDbConnection(process.env.MONGO_URI_USERS, 'UsersDB');
const gameConnection = createDbConnection(process.env.MONGO_URI_GAMES, 'GameDB');

const connectionsReady = Promise.all([
    userConnection.asPromise(),
    gameConnection.asPromise()
]).then(() => {
    console.log("--- All database connections are ready ---");
});

const ArtWorkSchema = require('./models/Artwork');
const UserSchema = require('./models/Users');
const CounterSchema = require('./models/Counter');
const GameSchema = require('./models/Games');
const AgeRatingSchema = require('./models/AgeRating');
const CoverSchema = require('./models/Cover');
const GameModeSchema = require('./models/GameMode');
const GameTypeSchema = require('./models/GameType');
const GenreSchema = require('./models/Genre');
const LanguageSchema = require('./models/Languages');
const PerspectiveSchema = require('./models/Perspective');
const PlatformSchema = require('./models/Platform');
const ThemeSchema = require('./models/Themes');
const FranchiseSchema = require('./models/Franchise');
const KeywordSchema = require('./models/KeyWords');
const ICompaniesSchema = require('./models/ICompanies');
const GameEngineSchema = require('./models/GameEngine');
const CollectionsSchema = require('./models/Collections');
const LanguageSupportSchema = require('./models/LanguageSupport');

const UserModel = userConnection.models.User || userConnection.model('User', UserSchema);
const CounterModel = userConnection.models.Counter || userConnection.model('Counter', CounterSchema);

const ArtWorkModel = gameConnection.model('ArtWork', ArtWorkSchema);
const GameModel = gameConnection.model('Game', GameSchema);
const PlatformModel = gameConnection.model('Platform', PlatformSchema);
const GenreModel = gameConnection.model('Genre', GenreSchema);
const FranchiseModel = gameConnection.model('Franchise', FranchiseSchema);
const CoverModel = gameConnection.model('Cover', CoverSchema);
const AgeRatingModel = gameConnection.model('AgeRating', AgeRatingSchema);
const GameModeModel = gameConnection.model('GameMode', GameModeSchema);
const GameTypeModel = gameConnection.model('GameType', GameTypeSchema);
const LanguageModel = gameConnection.model('Language', LanguageSchema);
const PerspectiveModel = gameConnection.model('Perspective', PerspectiveSchema);
const ThemeModel = gameConnection.model('Theme', ThemeSchema);
const KeywordModel = gameConnection.model('Keyword', KeywordSchema);
const ICompaniesModel = gameConnection.model('ICompanies', ICompaniesSchema);
const GameEngineModel = gameConnection.model('GameEngine', GameEngineSchema);
const CollectionsModel = gameConnection.model('Collections', CollectionsSchema);
const LanguageSupportModel = gameConnection.model('LanguageSupports', LanguageSupportSchema);

module.exports = {
    userConnection,
    gameConnection,
    connectionsReady,

    LanguageSupportModel,
    ArtWorkModel,
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
    KeywordModel,
    ICompaniesModel,
    GameEngineModel,
    CollectionsModel
};