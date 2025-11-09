const { transformToFeatureVector, FEATURE_TO_INDEX_SIZE } = require('./recommend'); 

async function buildUserProfileVector(userId, models) {
    const { UserModel, GameModel } = models;
    
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

    const rawGameDocuments = await GameModel.find(
        { id: { $in: likedGameIds } },
        'id genres platforms keywords themes franchise game_modes player_perspectives game_type -_id'
    ).lean().exec();

    if (rawGameDocuments.length === 0) {
        return new Array(FEATURE_TO_INDEX_SIZE).fill(0);
    }

    const combinedVector = new Array(FEATURE_TO_INDEX_SIZE).fill(0);
    
    for (const doc of rawGameDocuments) {
        const featureVector = transformToFeatureVector(doc); 
        for (let i = 0; i < combinedVector.length; i++) {
            combinedVector[i] += featureVector[i];
        }
    }

    const userProfileVector = combinedVector.map(sum => sum / rawGameDocuments.length);
    return userProfileVector;
}

module.exports = { buildUserProfileVector };