require('dotenv').config({ path: '../.env' });

const { UserModel, GameModel, connectionsReady } = require('../db');

const { buildUserProfileVector } = require('../services/user_profile');
const { getRecommendations } = require('../services/recommend');

const TEST_USER_ID = '690b87bb490467c28d66aa04';

async function runTest() {
    console.log("Starting Recommendation Test");


    try {
        await connectionsReady;
        console.log("db connections established");
        console.log(`\nTesting for User ID: ${TEST_USER_ID}`);

        console.log("Building User Profile");
        const userProfileVector = await buildUserProfileVector(TEST_USER_ID, {
            UserModel: UserModel,
            GameModel: GameModel
        });

        if (!userProfileVector || userProfileVector.every(v => v === 0)) {
            throw new Error("buildUserProfileVector returned an empty or zero vector.");
        }
        console.log(`SUCCESS: User Profile Vector created.`);

        console.log("\nGetting Top Recommendation IDs...");
        const user = await UserModel.findById(TEST_USER_ID, 'userGames').lean();
        const userLikedGameIds = user ? user.userGames.map(g => g.id) : [];

        const recResults = await getRecommendations(userProfileVector, userLikedGameIds, {GameModel: GameModel});

        if (!recResults || recResults.length === 0) {
            throw new Error("getRecommendations returned an empty list.");
        }
        console.log(`SUCCESS: Received ${recResults.length} recommended game IDs.`);

        const topIds = recResults.map(item => item.id);

        console.log("\n3. Fetching Full Game Details for Recommendations...");
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
        const {userConnection, gameConnection} = require('../db');
        if (userConnection) await userConnection.close();
        if (gameConnection) await gameConnection.close();
        console.log("\nTest finished. All MongoDB connections closed.");
    }
}

runTest();