const { centroids, feature_names, FEATURE_TO_INDEX, FEATURE_TO_INDEX_SIZE, EPSILON } = require('./recommend_model_loader');

function tokenizeText(text) {
    if (typeof text !== 'string' || !text.trim()) return [];
    const tokens = text.toLowerCase().match(/\b[a-z]{3,}\b/g);
    return tokens || [];
}

function transformToFeatureVector(rawGameDocument) {
    const featureVector = new Array(FEATURE_TO_INDEX_SIZE).fill(0);

    const setFeature = (featureName) => {
        if (FEATURE_TO_INDEX.hasOwnProperty(featureName)) {
            featureVector[FEATURE_TO_INDEX[featureName]] = 1;
        }
    };

    try {
        const categoricalFields = ['genres', 'platforms', 'keywords', 'themes', 'game_modes', 'player_perspectives', 'franchise', 'game_type', 'game_engines', 'collections'];
        for (const category of categoricalFields) {
            const rawValue = rawGameDocument[category];
            const values = Array.isArray(rawValue) ? rawValue : (rawValue != null ? [rawValue] : []);
            for (const id of values) setFeature(`${category}_${String(id)}`);
        }

        if (rawGameDocument.first_release_date != null) {
            const releaseDate = new Date(rawGameDocument.first_release_date * 1000);
            const year = releaseDate.getUTCFullYear();
            const decade = Math.floor(year / 10) * 10;
            setFeature(`release_year_${year}`);
            setFeature(`release_decade_${decade}s`);
        }

        const summaryTokens = tokenizeText(rawGameDocument.summary);
        for (const token of summaryTokens) setFeature(`summary_tokens_${token}`);

        const storylineTokens = tokenizeText(rawGameDocument.storyline);
        for (const token of storylineTokens) setFeature(`storyline_tokens_${token}`);
        
        if (rawGameDocument.rating != null) {
            let label;
            const rating = rawGameDocument.rating;
            if (rating > 84) label = 'acclaimed';
            else if (rating > 74) label = 'great';
            else if (rating > 64) label = 'good';
            else if (rating > 0) label = 'average';
            if (label) setFeature(`rating_tier_${label}`);
        }

        if (rawGameDocument.rating_count != null) {
            let label;
            const count = rawGameDocument.rating_count;
            if (count > 500) label = 'popular';
            else if (count > 50) label = 'known';
            else if (count > 0) label = 'niche';
            else label = 'unrated';
            if (label) setFeature(`rating_count_tier_${label}`);
        }
    } catch (e) {
        console.error(`[ERROR] Transformation failed for game ID ${rawGameDocument.id}:`, e.message);
        return new Array(FEATURE_TO_INDEX_SIZE).fill(0);
    }

    return featureVector;
}

function getMagnitude(vector) {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
}

function getDotProduct(vecA, vecB) {
    return vecA.reduce((sum, _, i) => sum + vecA[i] * vecB[i], 0);
}

function findBestCluster(userProfileVector) {
    if (!centroids || centroids.length === 0) return -1;

    let maxSimilarity = -Infinity;
    let bestClusterId = -1;
    const magnitudeUPV = getMagnitude(userProfileVector);
    if (magnitudeUPV === 0) return -1;

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

async function getRecommendations(userProfileVector, userLikedGameIds, models) {
    const { GameModel } = models;

    const bestClusterId = findBestCluster(userProfileVector);
    if (bestClusterId === -1) return [];

    console.log(`[ML Service] User profile best matches Cluster ID: ${bestClusterId}`);

    const gamesInCluster = await GameModel.find(
        { clusterId: bestClusterId },
        'id name genres platforms keywords themes franchise game_modes player_perspectives game_type rating rating_count summary storyline first_release_date game_engines collections'
    ).lean().exec();

    const gamesToRank = gamesInCluster.filter(game => !userLikedGameIds.includes(game.id));
    if (gamesToRank.length === 0) return [];

    const results = [];
    for (const gameDoc of gamesToRank) {
        const gameVector = transformToFeatureVector(gameDoc);
        const score = getDotProduct(userProfileVector, gameVector);

        if (score > 0) {
            results.push({ id: gameDoc.id, name: gameDoc.name, score: score });
        }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 100);
}

module.exports = {
    getRecommendations,
    transformToFeatureVector
};