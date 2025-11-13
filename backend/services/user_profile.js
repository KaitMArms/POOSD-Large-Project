const { transformToFeatureVector, FEATURE_TO_INDEX_SIZE } = require('./recommend');
const { feature_names } = require('./recommend_model_loader');

async function buildUserProfileVector(userId, models) {
    const { UserModel, GameModel } = models;
    const zeroVector = new Array(FEATURE_TO_INDEX_SIZE).fill(0);

    const userDoc = await UserModel.findById(userId, 'userGames -_id').lean().exec();
    if (!userDoc || !userDoc.userGames) {
        return zeroVector;
    }

    const likedGameIds = userDoc.userGames
        .filter(game => game.isLiked === true)
        .map(game => game.id);

    if (likedGameIds.length === 0) {
        return zeroVector;
    }

    const rawGameDocuments = await GameModel.find(
        { id: { $in: likedGameIds } },
        'id name genres platforms keywords themes franchise game_modes player_perspectives game_type rating rating_count summary storyline first_release_date game_engines collections -_id'
    ).lean().exec();

    if (rawGameDocuments.length === 0) {
        return zeroVector;
    }

    const WEIGHTS = {
        CORE_FEATURE: 5.0,    // High weight for genres, keywords, themes, etc.
        NUANCE_FEATURE: 1.0   // Low weight for text tokens and release dates
    };

    const combinedVector = new Array(FEATURE_TO_INDEX_SIZE).fill(0);

    for (const doc of rawGameDocuments) {
        const featureVector = transformToFeatureVector(doc);

        for (let i = 0; i < featureVector.length; i++) {
            if (featureVector[i] === 1) {
                const featureName = feature_names[i];
                let weight;

                if (featureName.startsWith('genres_') ||
                    featureName.startsWith('keywords_') ||
                    featureName.startsWith('themes_') ||
                    featureName.startsWith('platforms_') ||
                    featureName.startsWith('collections_') ||
                    featureName.startsWith('franchise_') ||
                    featureName.startsWith('game_engines_') ||
                    featureName.startsWith('player_perspectives_') ||
                    featureName.startsWith('game_type_') ||
                    featureName.startsWith('rating_tier_') ||
                    featureName.startsWith('game_modes_')) {
                    
                    weight = WEIGHTS.CORE_FEATURE;
                } else {
                    weight = WEIGHTS.NUANCE_FEATURE;
                }
                
                combinedVector[i] += weight; // Add the correctly weighted value
            }
        }
    }

    // Average the final weighted vector
    const userProfileVector = combinedVector.map(sum => sum / rawGameDocuments.length);

    return userProfileVector;
}

module.exports = { buildUserProfileVector };