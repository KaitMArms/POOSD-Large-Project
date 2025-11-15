const { transformToFeatureVector } = require('./recommend');
const { feature_names, FEATURE_TO_INDEX_SIZE } = require('./recommend_model_loader');

async function buildUserProfileVector(userId, models) {
    const { UserModel, GameModel } = models;
    const zeroVector = new Array(FEATURE_TO_INDEX_SIZE).fill(0);

    const userDoc = await UserModel.findById(userId, 'userGames -_id').lean().exec();
    if (!userDoc || !userDoc.userGames) {
        console.warn(`[UserProfile] User ${userId} not found or has no games.`);
        return zeroVector;
    }

    const likedGameIds = userDoc.userGames.filter(g => g.isLiked === true).map(g => g.id);
    if (likedGameIds.length === 0) {
        console.warn(`[UserProfile] User ${userId} has no liked games.`);
        return zeroVector;
    }

    console.log(`[UserProfile] Found ${likedGameIds.length} liked game IDs for user.`);

    const rawGameDocuments = await GameModel.find({ id: { $in: likedGameIds } },
        'id name genres platforms keywords themes franchise game_modes player_perspectives game_type summary storyline first_release_date game_engines collections -_id'
    ).lean().exec();

    console.log(`[UserProfile] Matched ${rawGameDocuments.length} of those IDs in the games collection.`);
    if (rawGameDocuments.length === 0) {
        console.error(`[UserProfile] CRITICAL: None of the user's liked game IDs were found in the database. Returning a clean zero vector.`);
        return zeroVector;
    }

    const WEIGHTS = {
        SERIES_LOYALTY:    30.0, // Maximum weight for franchise and collections
        CRITICAL_IDENTITY: 10.0, // High weight for genre, theme, etc.
        CORE_DESCRIPTOR:   5.0,  // Medium weight for platform, etc.
        NUANCE:            1.0   // Lowest weight for keywords, text
    };

    const combinedVector = new Array(FEATURE_TO_INDEX_SIZE).fill(0);
    for (const doc of rawGameDocuments) {
        const featureVector = transformToFeatureVector(doc);
        for (let i = 0; i < featureVector.length; i++) {
            if (featureVector[i] === 1) {
                const featureName = feature_names[i];
                let weight;

                if (featureName.startsWith('franchise_') || featureName.startsWith('collections_')) {
                    weight = WEIGHTS.SERIES_LOYALTY;

                } else if (featureName.startsWith('genres_') || featureName.startsWith('themes_') || featureName.startsWith('player_perspectives_')) {
                    weight = WEIGHTS.CRITICAL_IDENTITY;

                } else if (featureName.startsWith('platforms_') || featureName.startsWith('game_engines_') || featureName.startsWith('game_type_') || featureName.startsWith('game_modes_')) {
                    weight = WEIGHTS.CORE_DESCRIPTOR;
                
                } else {
                    weight = WEIGHTS.NUANCE;
                }
                combinedVector[i] += weight;
            }
        }
    }

    const numDocs = rawGameDocuments.length;
    const userProfileVector = combinedVector.map(sum => (numDocs > 0 ? sum / numDocs : 0));

    return userProfileVector;
}

module.exports = { buildUserProfileVector };