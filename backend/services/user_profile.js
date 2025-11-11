const { transformToFeatureVector, FEATURE_TO_INDEX_SIZE } = require('./recommend');

async function buildUserProfileVector(userId, models) {
    const { UserModel, GameModel } = models;
    const zeroVector = new Array(FEATURE_TO_INDEX_SIZE).fill(0);

    // 1. Fetch user data
    const userDoc = await UserModel.findById(userId, 'userGames -_id').lean().exec();

    if (!userDoc || !userDoc.userGames || userDoc.userGames.length === 0) {
        return zeroVector;
    }

    // 2. Filter for liked games
    const likedGameIds = userDoc.userGames
        .filter(game => game.isLiked === true)
        .map(game => game.id);

    if (likedGameIds.length === 0) {
        return zeroVector;
    }

    // 3. Fetch full game documents, including new features (rating, rating_count)
    const rawGameDocuments = await GameModel.find(
        { id: { $in: likedGameIds } },
        'id name genres platforms keywords themes franchise game_modes player_perspectives game_type rating rating_count -_id'
    ).lean().exec();

    if (rawGameDocuments.length === 0) {
        return zeroVector;
    }

    // 4. Create a combined vector by summing the one-hot vectors of all liked games
    const combinedVector = new Array(FEATURE_TO_INDEX_SIZE).fill(0);

    for (const doc of rawGameDocuments) {
        // transformToFeatureVector handles the complex binning and feature matching
        const featureVector = transformToFeatureVector(doc);
        for (let i = 0; i < combinedVector.length; i++) {
            combinedVector[i] += featureVector[i];
        }
    }

    // 5. Create the final averaged profile
    const userProfileVector = combinedVector.map(sum => sum / rawGameDocuments.length);


    const roundedProfileVector = userProfileVector.map(val => Math.round(val * 100000) / 100000);
    // The vector is now the single object returned to the caller
    return roundedProfileVector;
}

module.exports = { buildUserProfileVector };