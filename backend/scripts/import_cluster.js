// At the top with your other requires
const fs = require('fs');
const { parse } = require('csv-parse');
const { GameModel, connectionsReady, userConnection, gameConnection } = require('../db');

// --- CONFIGURATION ---
const CSV_FILE_PATH = './recreated_cluster_assignments.csv';
const BATCH_SIZE = 5000; // Process 5,000 records at a time. Adjust if needed.
const DELAY_BETWEEN_BATCHES_MS = 500; // 0.5 second pause between batches.

// --- HELPER FUNCTION ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runImport() {
    console.log("--- Starting Cluster ID Import Script (Batch Mode) ---");
    try {
        // Wait for the connections from db.js to be established.
        await connectionsReady;
        console.log("Database connections are ready.");

        let bulkOperations = [];
        let totalRecordsProcessed = 0;

        // Create a readable stream from the file. This is the key to low memory usage.
        const fileStream = fs.createReadStream(CSV_FILE_PATH);

        // Create the CSV parser stream.
        const parser = parse({
            columns: true, // Treat the first line as headers
            skip_empty_lines: true
        });

        console.log(`Processing '${CSV_FILE_PATH}' in batches of ${BATCH_SIZE}...`);

        // Use a 'for await...of' loop to process the stream line by line.
        // This is a modern and clean way to handle streams.
        for await (const record of fileStream.pipe(parser)) {
            // Add the operation for the current record to our batch array.
            bulkOperations.push({
                updateOne: {
                    filter: { id: parseInt(record.game_id, 10) },
                    update: { $set: { clusterId: parseInt(record.cluster_id, 10) } },
                }
            });

            // When the batch is full, execute it.
            if (bulkOperations.length >= BATCH_SIZE) {
                totalRecordsProcessed += bulkOperations.length;
                console.log(`Executing batch of ${bulkOperations.length}. Total processed: ${totalRecordsProcessed}`);

                // Use await directly on the bulkWrite operation.
                await GameModel.bulkWrite(bulkOperations, { ordered: false });

                // Clear the array for the next batch.
                bulkOperations = [];

                // Pause to give the database server some breathing room.
                await sleep(DELAY_BETWEEN_BATCHES_MS);
            }
        }

        // After the loop, process any remaining records that didn't make a full batch.
        if (bulkOperations.length > 0) {
            totalRecordsProcessed += bulkOperations.length;
            console.log(`Executing final batch of ${bulkOperations.length}. Total processed: ${totalRecordsProcessed}`);
            await GameModel.bulkWrite(bulkOperations, { ordered: false });
        }

        console.log("\n--- Bulk Write Complete! ---");
        console.log(`Successfully processed a total of ${totalRecordsProcessed} records.`);

    } catch (err) {
        console.error("\nFATAL ERROR: The import process failed.", err);
    } finally {
        // Close the connections that db.js opened.
        await Promise.all([
            userConnection.close(),
            gameConnection.close()
        ]);
        console.log("\nAll MongoDB connections closed.");
    }
}

// Run the script
runImport();