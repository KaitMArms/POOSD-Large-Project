require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

const UserSchema = require('../models/Users');
const GameSchema = require('../models/Games');
const CounterSchema = require('../models/Counter'); 

const { buildUserProfileVector } = require('../services/user_profile');
const { getRecommendations } = require('../services/recommend');

const TEST_USER_ID = '690642a016356720a54b25e4'; 

async function runTest() {
    console.log("Starting Recommendation Test");
    
    let userConnection, gameConnection;

    try {
        userConnection = await mongoose.createConnection(process.env.MONGO_URI_USERS).asPromise();
        gameConnection = await mongoose.createConnection(process.env.MONGO_URI_GAMES).asPromise();
        console.log("DB connections established.");

        const LocalUserModel = userConnection.model('User', UserSchema);
        const LocalGameModel = gameConnection.model('Game', GameSchema);
        userConnection.model('Counter', CounterSchema);

        console.log(`\nTesting for User ID: ${TEST_USER_ID}`);
        
        console.log("Building User Profile");
        const userProfileVector = await buildUserProfileVector(TEST_USER_ID, {
            UserModel: LocalUserModel,
            GameModel: LocalGameModel  
        });

        if (!userProfileVector || userProfileVector.every(v => v === 0)) {
            throw new Error("buildUserProfileVector returned an empty or zero vector.");
        }
        console.log(`SUCCESS: User Profile Vector created.`);

        console.log("\nGetting Top Recommendation IDs...");
        const user = await LocalUserModel.findById(TEST_USER_ID, 'userGames').lean();
        const userLikedGameIds = user ? user.userGames.map(g => g.id) : [];
        
        const topIds = await getRecommendations(userProfileVector, userLikedGameIds);

        if (!topIds || topIds.length === 0) {
            throw new Error("getRecommendations returned an empty list.");
        }
        console.log(`SUCCESS: Received ${topIds.length} recommended game IDs.`);

        console.log("\n3. Fetching Full Game Details for Recommendations...");
        const finalGameDetails = await LocalGameModel.find({ id: { $in: topIds } }).lean();

        const gameMap = new Map(finalGameDetails.map(g => [g.id, g.name]));
        const sortedFinalGames = topIds.map(id => ({ id, name: gameMap.get(id) }));

        console.log("\n" + "=".repeat(50));
        console.log("PASSED - RECOMMENDATIONS:");
        console.log("=".repeat(50));
        sortedFinalGames.forEach((game, index) => {
            console.log(`${index + 1}. ID: ${game.id}, Name: ${game.name}`);
        });
        console.log("=".repeat(50));

    } catch (error) {
        console.error("\nTEST FAILED with an error:", error);
    } finally {
        if (userConnection) await userConnection.close();
        if (gameConnection) await gameConnection.close();
        console.log("\nTest finished. All MongoDB connections closed.");
    }
}

runTest();