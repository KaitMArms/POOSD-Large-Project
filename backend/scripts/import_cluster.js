require('dotenv').config({ path: '../.env' });
const { MongoClient } = require('mongodb');
const fs = require('fs');
const {parse} = require('csv-parse');

const path = './final_game_cluster_assignments.csv';
const db_uri = process.env.MONGO_URI_GAMES;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function retryOp(operation, maxRetries=5){
    for (let attempt = 1; attempt <= maxRetries; attempt++){
        try{
            return await operation();
        } catch (err){
            const isRetryError = err.name === 'MongoNetworkError' || (err.message && err.message.includes('ECONNREFUSED'));

            if (isRetryError && attempt < maxRetries){
                const delay = 2000 * attempt;
                await sleep(delay);
            } else{
                throw err;
            }
        }
    }
    return null;
}

async function runImport(){
    let client;
    try {
        client = new MongoClient(db_uri);
        await client.connect();
        console.log("MongoDB connected successfully.");

        const db = client.db(client.options.dbName); 
        const gamesCollection = db.collection('games'); 

        let records;
        try {
            const csv_string = fs.readFileSync(path, 'utf8');

            records = await new Promise((resolve, reject) => {
                parse(csv_string, { columns: true, skip_empty_lines: true }, (err, output) => {
                    if (err) reject(err);
                    resolve(output);
                });
            });
            console.log(`Successfully parsed ${records.length} records.`);

        } catch (err) {
            console.error('FATAL ERROR during file reading or parsing:', err.message);
            await client.close();
            return;
        }

        const bulkOperations = records.map(record => ({
            updateOne: {
                filter: { id: parseInt(record.game_id) },
                update: { $set: { clusterId: parseInt(record.cluster_id) } }
            }
        }));

        console.log(`Executing bulkWrite for ${bulkOperations.length} records (with retry)...`);

        const result = await retryOp(async() => {
            return await gamesCollection.bulkWrite(bulkOperations, { ordered: false });
        });

        console.log(`  - Matched documents: ${result.matchedCount}`);
        console.log(`  - Modified documents: ${result.modifiedCount}`);

    } catch (err) {
        console.error("FATAL ERROR: The entire import process failed.", err.message);

    } finally {
        if (client) {
            await client.close();
            console.log("MongoDB connection closed.");
        }
    }
};

runImport();