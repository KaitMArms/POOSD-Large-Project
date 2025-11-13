const fs = require('fs');
const path = require('path');

const CENTER_PATH = path.join(__dirname, 'final_prediction_artifact.json');
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

module.exports = {
    k_clusters,
    feature_names,
    centroids,
    FEATURE_TO_INDEX,
    FEATURE_TO_INDEX_SIZE,
    EPSILON
};