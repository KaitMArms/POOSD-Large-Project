const mongoose = require('mongoose');
const { gameConnection } = require('../db');
const Games = require('../models/Games');
const fs = require('fs');
const {parse} = require('csv-parse');

const path = './final_game_cluster_assignments.csv';
const db_uri = proces.env.MONGO_URI_GAMES;

async function runImport(){
    await mongoose.connect(db_uri);

    let records;
    try{
        const csv_string = fs.readFileSync(path, 'utf8');

        records = await new Promise((resolve, reject) => {
            parse(csv_string, {columns: true, skip_empty_lines: true}, (err, output) => {
                if (err) reject(err);
                resolve(output);
            });
        });
        console.log('Parsed ${records.length}');
    } catch (err) {
        await mongoose.connection.close();
        return;
    }

    const doImport = records.map(record => ({
        updateOne: {
            filter: {id: parseInt(record.game_id)},
            update: { $set: {clusterId: parseInt(record.cluster_id)}}
        }
    }));

    try {
        const result = await Games.bulkWrite(doImport, {ordered: false});
    } catch (err) {
        console.error("Failed during bulkWrite", err);
    }
    await mongoose.connection.close();
};

fs.readFile('./final_game_cluster_assignments.csv', 'utf8', (err, csv_string) => {
    if (err) { 
        console.error('Error reading file:', err);
        return;
    }
    records = csv_string;
})


const cluster_import = records.map(record => ({
    updateOne: {
        filter: { id: parseInt(record.game_id) }, 
        update: { $set: { clusterId: parseInt(record.cluster_id) } } 
    }
}));

await Games.bulkWrite(cluster_import);