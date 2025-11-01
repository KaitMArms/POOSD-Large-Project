require('dotenv').config({ path: '../.env' });

require('../db'); 

const { buildUserProfileVector } = require('../services/user_profile');
const { getRecommendations } = require('../services/recommend');
const GameModel = require('../models/Games'); 
const TEST_USER_ID = '690642a016356720a54b25e4'; 

async function runTest() {
    console.log(`Testing for User ID: ${TEST_USER_ID}`);

    try {
        console.log("\nBuilding User Profile Vector...");
        const userProfileVector = await buildUserProfileVector(TEST_USER_ID);

        if (!userProfileVector || userProfileVector.every(v => v === 0)) {
            console.error(" FAILED: buildUserProfileVector returned an empty or zero vector.");
            return;
        }
        console.log(`SUCCESS: User Profile Vector created. Sample: [${userProfileVector.slice(0, 5).join(', ')}, ...]`);

        console.log("\nGetting Top Recommendation IDs...");

        const userLikedGameIds = [];
        
        const topIds = await getRecommendations(userProfileVector, userLikedGameIds);

        if (!topIds || topIds.length === 0) {
            console.error(" FAILED: getRecommendations returned an empty list.");
            return;
        }
        console.log(`Received ${topIds.length} recommended game IDs:`);
        console.log(topIds);

        console.log("\n3. Fetching Full Game Details for Recommendations...");
        const finalGameDetails = await GameModel.find({ id: { $in: topIds } }).lean();

        const gameMap = new Map(finalGameDetails.map(g => [g.id, g.name]));
        const sortedFinalGames = top10Ids.map(id => ({ id, name: gameMap.get(id) }));

        console.log("\n" + "=".repeat(50));
        console.log("FINAL RECOMMENDATIONS:");
        console.log("=".repeat(50));
        sortedFinalGames.forEach((game, index) => {
            console.log(`${index + 1}. ID: ${game.id}, Name: ${game.name}`);
        });
        console.log("=".repeat(50));

    } catch (error) {
        console.error("\FAILED with error:", error);
    } finally {
        const mongoose = require('mongoose');
        await mongoose.disconnect();
        console.log("\nMongoDB connections closed.");
    }
}

runTest();