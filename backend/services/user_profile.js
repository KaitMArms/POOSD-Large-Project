const UserModel = require('../models/Users'); 
const GameModel = require('../models/Games'); 
// Ensure the path to your recommend/ML service is correct
const { transformToFeatureVector, FEATURE_TO_INDEX_SIZE } = require('./recommend'); 

// Retrieves user's liked game IDs, fetches the data from GameDB, hot-encodes them, and computes Profile Vector
async function buildUserProfileVector(userId) {
    // Get the Liked Games List 
    const userDoc = await UserModel.findById(userId, 'userGames -_id').lean().exec();
    
    if (!userDoc || !userDoc.userGames || userDoc.userGames.length === 0) {
        return new Array(FEATURE_TO_INDEX_SIZE).fill(0);
    }
    
    const likedGameIds = userDoc.userGames
        .filter(game => game.isLiked === true)
        .map(game => game.id);
        
    if (likedGameIds.length === 0) {
        return new Array(FEATURE_TO_INDEX_SIZE).fill(0);
    }

    // Get the Feature Data 
    const rawGameDocuments = await GameModel.find(
        { id: { $in: likedGameIds } }, 
        { 
            // Select only the features needed for encoding
            genres: 1, platforms: 1, keywords: 1, themes: 1, franchise: 1, 
            game_modes: 1, player_perspectives: 1, game_type: 1, _id: 0 
        }
    ).lean().exec();

    if (rawGameDocuments.length === 0) {
        return new Array(FEATURE_TO_INDEX_SIZE).fill(0);
    }

    // Hot-Encode and Average
    const combinedVector = new Array(FEATURE_TO_INDEX_SIZE).fill(0);
    
    for (const doc of rawGameDocuments) {
        const featureVector = transformToFeatureVector(doc); 
        
        for (let i = 0; i < combinedVector.length; i++) {
            combinedVector[i] += featureVector[i];
        }
    }

    const numGamesFound = rawGameDocuments.length;
    const userProfileVector = combinedVector.map(sum => sum / numGamesFound);

    return userProfileVector;
}

module.exports = { buildUserProfileVector };