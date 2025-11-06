const fs = require('fs');
const path = require('path');

const CENTER_PATH = path.join(__dirname, '.', 'final_prediction_artifact.json');
const EPSILON = 1e-10;

let k_clusters, feature_names, centroids, FEATURE_TO_INDEX;

try {
    // Load the entire model from a JSON file
    const model = JSON.parse(fs.readFileSync(CENTER_PATH, 'utf8'));
    k_clusters = model.k_clusters;
    feature_names = model.feature_names;
    centroids = model.centroids;

    FEATURE_TO_INDEX = Object.fromEntries(feature_names.map((name, i) => [name, i]));
} catch (error) {
    console.error("ERROR: Could not load ML model.", error);
}

// Calculates the magnitude of a vector
function getMagnitude(vector) {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
}

// Calculates the dot product of two vectors
function getDotProduct(vecA, vecB) {
    return vecA.reduce((sum, _, i) => sum + vecA[i] * vecB[i], 0);
}

// Transforms a game document into a one-hot encoded feature vector
function transformToFeatureVector(rawGameDocument) {
    const featureVector = new Array(feature_names.length).fill(0);

    const featureCategories = {
        genres: rawGameDocument.genres,
        platforms: rawGameDocument.platforms,
        keywords: rawGameDocument.keywords,
        themes: rawGameDocument.themes,
        game_modes: rawGameDocument.game_modes,
        player_perspectives: rawGameDocument.player_perspectives,
        franchise: rawGameDocument.franchise,
        game_type: rawGameDocument.game_type,
    };

    for (const category in featureCategories) {
        const rawValue = featureCategories[category];
        const values = Array.isArray(rawValue) ? rawValue : (rawValue != null ? [rawValue] : []);

        for (const id of values) {
            const featureName = `${category}_${id}`;
            if (FEATURE_TO_INDEX.hasOwnProperty(featureName)) {
                const columnIndex = FEATURE_TO_INDEX[featureName];
                featureVector[columnIndex] = 1;
            }
        }
    }
    return featureVector;
}

// Finds the best matching cluster for a given User Profile Vector
function findBestCluster(userProfileVector) {
    let maxSimilarity = -Infinity;
    let bestClusterId = -1;
    const magnitudeUPV = getMagnitude(userProfileVector);

    for (let i = 0; i < k_clusters; i++) {
        const centroidVector = centroids[i];
        const dotProduct = getDotProduct(userProfileVector, centroidVector);
        const magnitudeCentroid = getMagnitude(centroidVector);
        const similarity = dotProduct / (magnitudeUPV * magnitudeCentroid + EPSILON);

        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            bestClusterId = i;
        }
    }
    return bestClusterId;
}

// Finds the best cluster, queries the DB for games in that cluster, ranks them by similarity to the user's profile, and returns the top 100 IDs.
async function getRecommendations(userProfileVector, userLikedGameIds, models) {
    const { GameModel } = models
    // Find the most relevant cluster for this user
    const bestClusterId = findBestCluster(userProfileVector);
    if (bestClusterId === -1) return []; // No clusters found, return empty

    console.log(`[ML Service] User profile best matches Cluster ID: ${bestClusterId}`);

    // Query the database to get all games in that cluster
    const gamesInCluster = await GameModel.find(
        { clusterId: bestClusterId },
        'id genres platforms keywords themes franchise game_modes player_perspectives game_type -_id'
    ).lean().exec();

    // Filter out games the user has already liked
    const gamesToRank = gamesInCluster.filter(
        game => !userLikedGameIds.includes(game.id)
    );
    if (gamesToRank.length === 0) return []; // No new games to recommend in this cluster

    const userProfileMagnitude = getMagnitude(userProfileVector);
    const results = [];

    // Loop through the candidate games, encode them, and calculate similarity
    for (const gameDoc of gamesToRank) {
        const gameVector = transformToFeatureVector(gameDoc);
        const dotProduct = getDotProduct(userProfileVector, gameVector);
        const magnitudeGame = getMagnitude(gameVector);
        const similarity = dotProduct / (userProfileMagnitude * magnitudeGame + EPSILON);
        results.push({ id: gameDoc.id, score: similarity });
    }

    // Sort the results and return the top 100 IDs
    results.sort((a, b) => b.score - a.score);
    const topRankedRes = results.slice(0, 100);

    return topRankedRes;
}

module.exports = {
    getRecommendations,
    transformToFeatureVector,
    FEATURE_TO_INDEX_SIZE: feature_names ? feature_names.length : 0
};
