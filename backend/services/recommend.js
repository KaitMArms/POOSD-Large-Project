const fs = require('fs');
const path = require('path');

const CENTER_PATH = path.join(__dirname, '.', 'final_prediction_artifact.json');
const EPSILON = 1e-10;

let k_clusters, feature_names, centroids, FEATURE_TO_INDEX, FEATURE_TO_INDEX_SIZE;

try {
    const model = JSON.parse(fs.readFileSync(CENTER_PATH, 'utf8'));
    k_clusters = model.k_clusters;
    feature_names = model.feature_names;
    centroids = model.centroids;

    FEATURE_TO_INDEX = Object.fromEntries(feature_names.map((name, i) => [name, i]));
    FEATURE_TO_INDEX_SIZE = feature_names.length;

    if (typeof k_clusters === 'undefined' || k_clusters === null) {
        throw new Error("'k_clusters' key not found in model artifact.");
    }
} catch (error) {
    console.error("FATAL ERROR: Could not load or parse ML model.", error);
    process.exit(1);
}

function transformToFeatureVector(rawGameDocument) {
    const featureVector = new Array(FEATURE_TO_INDEX_SIZE).fill(0);

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

    try {
        for (const category in featureCategories) {
            const rawValue = featureCategories[category];
            const values = Array.isArray(rawValue) ? rawValue : (rawValue != null ? [rawValue] : []);

            for (const id of values) {
                const idAsString = String(parseInt(id, 10));
                const featureName = `${category}_${idAsString}`;
                if (FEATURE_TO_INDEX.hasOwnProperty(featureName)) {
                    featureVector[FEATURE_TO_INDEX[featureName]] = 1;
                }
            }
        }

        // --- Binned Numerical Features ---
        if (rawGameDocument.rating != null) {
            let label;
            const rating = rawGameDocument.rating;
            if (rating > 84 && rating <= 101) label = 'acclaimed';
            else if (rating > 74 && rating <= 84) label = 'great';
            else if (rating > 64 && rating <= 74) label = 'good';
            else if (rating > 0 && rating <= 64) label = 'average';

            if (label) {
                const featureName = `rating_tier_${label}`;
                if (FEATURE_TO_INDEX.hasOwnProperty(featureName)) {
                    featureVector[FEATURE_TO_INDEX[featureName]] = 1;
                }
            }
        }

        if (rawGameDocument.rating_count != null) {
            let label;
            const count = rawGameDocument.rating_count;
            if (count > 500) label = 'popular';
            else if (count > 50) label = 'known';
            else if (count > 0) label = 'niche';
            else if (count <= 0) label = 'unrated';

            if (label) {
                const featureName = `rating_count_tier_${label}`;
                if (FEATURE_TO_INDEX.hasOwnProperty(featureName)) {
                    featureVector[FEATURE_TO_INDEX[featureName]] = 1;
                }
            }
        }
    } catch (e) {
        console.error(`[ERROR] Transformation failed for game ID ${rawGameDocument.id}:`, e.message);
        // Return a zero vector, but DO NOT crash.
        return new Array(FEATURE_TO_INDEX_SIZE).fill(0);
    }

    return featureVector;
}

// --- Vector Math Helpers ---
function getMagnitude(vector) {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
}

function getDotProduct(vecA, vecB) {
    return vecA.reduce((sum, _, i) => sum + vecA[i] * vecB[i], 0);
}

// --- Cluster Matching Logic ---
function findBestCluster(userProfileVector) {
    if (!centroids || centroids.length === 0) {
        console.error("[ERROR] Centroids are not loaded or are empty.");
        return -1;
    }

    let maxSimilarity = -Infinity;
    let bestClusterId = -1;
    const magnitudeUPV = getMagnitude(userProfileVector);

    if (magnitudeUPV === 0) {
        console.error("[ERROR] User Profile Vector has a magnitude of zero. Cannot find best cluster.");
        return -1;
    }

    for (let i = 0; i < centroids.length; i++) {
        const centroidVector = centroids[i];
        const dotProduct = getDotProduct(userProfileVector, centroidVector);
        const magnitudeCentroid = getMagnitude(centroidVector);

        const similarity = dotProduct / (magnitudeUPV * magnitudeCentroid + EPSILON);

        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            bestClusterId = i;
        }
    }

    console.log(`[DEBUG] findBestCluster: Max similarity was ${maxSimilarity} for Cluster ID ${bestClusterId}`);
    return bestClusterId;
}

// --- Main Recommendation Function ---
async function getRecommendations(userProfileVector, userLikedGameIds, models) {
    const { GameModel } = models;
    const bestClusterId = findBestCluster(userProfileVector);
    if (bestClusterId === -1) return [];

    console.log(`[ML Service] User profile best matches Cluster ID: ${bestClusterId}`);

    const gamesInCluster = await GameModel.find(
        { clusterId: bestClusterId },
        'id name genres platforms keywords themes franchise game_modes player_perspectives game_type rating rating_count'
    ).lean().exec();

    const gamesToRank = gamesInCluster.filter(game => !userLikedGameIds.includes(game.id));
    if (gamesToRank.length === 0) return [];

    const userProfileMagnitude = getMagnitude(userProfileVector);
    const results = [];

    for (const gameDoc of gamesToRank) {
        const gameVector = transformToFeatureVector(gameDoc);
        const magnitudeGame = getMagnitude(gameVector);

        const dotProduct = getDotProduct(userProfileVector, gameVector);

        const similarity = dotProduct / (userProfileMagnitude * magnitudeGame + EPSILON);
        results.push({ id: gameDoc.id, name: gameDoc.name, score: similarity });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 100);
}

module.exports = {
    getRecommendations,
    transformToFeatureVector,
    FEATURE_TO_INDEX_SIZE
};