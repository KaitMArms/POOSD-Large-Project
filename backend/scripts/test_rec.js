require('dotenv').config({ path: '../.env' });

// We must import the connections in order to close them in the finally block
const { UserModel, GameModel, connectionsReady, userConnection, gameConnection } = require('../db');
const { buildUserProfileVector } = require('../services/user_profile');
const { getRecommendations } = require('../services/recommend');

const TEST_USER_ID = '6911ccee1dabfb2ec2e62352'; // Use the user ID that has verified liked games

async function runTest() {
    console.log("Starting Recommendation Test");


    try {
        await connectionsReady; // Wait for the DB to be ready
        console.log("db connections established");
        console.log(`\nTesting for User ID: ${TEST_USER_ID}`);

        console.log("Building User Profile");

        // 1. Call the function that returns a single feature vector array
        const userProfileVector = await buildUserProfileVector(TEST_USER_ID, {
            UserModel: UserModel,
            GameModel: GameModel
        });

        // 2. Check if the returned array is valid (i.e., not a zero vector)
        if (!userProfileVector || userProfileVector.length === 0 || userProfileVector.every(v => v === 0)) {
            throw new Error("buildUserProfileVector returned an empty or zero vector.");
        }
        console.log(`SUCCESS: User Profile Vector created.`);

        console.log("\nGetting Top Recommendation IDs...");

        // Fetch liked game IDs for filtering
        const user = await UserModel.findById(TEST_USER_ID, 'userGames').lean();
        const userLikedGameIds = user ? user.userGames.filter(g => g.isLiked === true).map(g => g.id) : [];

        // 3. Call getRecommendations with the single vector
        const recResults = await getRecommendations(userProfileVector, userLikedGameIds, {GameModel: GameModel});

        if (!recResults || recResults.length === 0) {
            throw new Error("getRecommendations returned an empty list.");
        }
        console.log(`SUCCESS: Received ${recResults.length} recommended game IDs.`);

        // 4. Fetch details and print results
        const topIds = recResults.map(item => item.id);

        console.log("\nFetching Full Game Details for Recommendations...");
        const finalGameDetails = await GameModel.find({ id: { $in: topIds } }).lean();

        const gameMap = new Map(finalGameDetails.map(g => [g.id, g.name]));

        console.log("\n" + "=".repeat(50));
        console.log("PASSED - RECOMMENDATIONS:");
        console.log("=".repeat(50));
        recResults.forEach((game, index) => {
            const gameName = gameMap.get(game.id) || "Unknown Name";
            const score = game.score.toFixed(4);
             console.log(`${index + 1}. ID: ${game.id}, Name: ${gameName}, Score: ${score}`);
        });
        console.log("=".repeat(50));

    } catch (error) {
        console.error("\nTEST FAILED with an error:", error);
    } finally {
        // Close connections
        if (userConnection) await userConnection.close();
        if (gameConnection) await gameConnection.close();
        console.log("\nTest finished. All MongoDB connections closed.");
    }
}

runTest();