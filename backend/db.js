const mongoose = require('mongoose');

// Handles having multiple databases
function createDbConnection(uri, dbName){
	const db = mongoose.createConnection(uri)

	db.on(`connected`, () => {
		console.log(`MongoDB connected: ${dbName}`);
	});

	db.on(`error`, (err) => {
		console.error(`MongoDB connection error for ${dbName}:`, err);
		process.exit(1);
	});

	return db;
}

const userConnection = createDbConnection(process.env.MONGO_URI_USERS, 'Users');
const gameConnection = createDbConnection(process.env.MONGO_URI_GAMES, 'GameDB');

const connectionsReady = Promise.all([
	userConnection.asPromise(),
	gameConnection.asPromise()
]).then(() => {
	console.log("Connections ready");
});

// Export connections
module.exports = { userConnection, gameConnection, connectionsReady };
