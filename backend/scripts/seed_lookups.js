require('dotenv').config({ path: '../.env' }); 
const axios = require('axios');
const mongoose = require('mongoose');

// Model imports
const PlatformModel = require('../models/Platform');
const GenreModel = require('../models/Genre');
const FranchiseModel = require('../models/Franchise');
const AgeRatingModel = require('../models/AgeRating');
const CoverModel = require('../models/Cover');
const ModeModel = require('../models/GameMode');
const KeyModel = require('../models/KeyWords');
const LanguageModel = require('../models/Languages');
const TheseModel = require('../models/Themes');
const TypeModel = require('../models/GameType');
const PerspectiveModel = require('../models/Perspective');
const CollectionsModel = require('../models/Collections');
const GameEngineModel = require('../models/GameEngine');
const ICompaniesModel = require('../models/ICompanies');



// Authenticates with twitch 
async function getAccessToken() {
    console.log("Requesting Twitch Access Token...");
    // Send a request to twitch authentication given the credentials in .env
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        });
        console.log("Token received.");
        return response.data.access_token;
    } catch (error) {
        console.error("FATAL: Could not get Twitch Access Token. Check your credentials in .env");
        throw error;
    }
}

// Send a data request to Twitch Servers
async function seedData(endpointName, Model, accessToken) {
    console.log(`\n--- Seeding ${endpointName} ---`);
    
    
    let offset = 0;              // Offset to determine which portion of info to take
    const limit = 500;           // max number of files pulled per fetch
    let continueFetching = true; // Whether we should keep pulling information
    let totalRecords = 0;        // Total number of files processed
    let retries = 0;             // Current number of times a call was retried
    const maxRetries = 5;        // max allowed retries

    while (continueFetching) {
        try {
            // Field for api request
            // Take all fields if not cover endpoint
            const fields = (endpointName === 'covers') ? 'fields id,image_id;' : 'fields *;';
            
            console.log(`   > Fetching ${endpointName} with offset ${offset}...`);
            // API request for given endpointName
            // Pull the specified fields, pull limit amount of them at offset
            const response = await axios.post(`https://api.igdb.com/v4/${endpointName}`,
                `${fields} limit ${limit}; offset ${offset};`,
                {
                    // Specify authorization
                    headers: {
                        'Client-ID': process.env.TWITCH_CLIENT_ID,
                        'Authorization': `Bearer ${accessToken}`
                    },
                    // How long we should wait for the information
		            timeout: 10000
                }
            );
	        retries = 0;

            // Insert data into our database
            const data = response.data;
            if (data.length > 0) {
                await Model.insertMany(data, { ordered: false });
                totalRecords += data.length;
                offset += limit; 

                // Wait 3 ms to ensure that we don't get timed out
                await new Promise(resolve => setTimeout(resolve, 300))
            } else {
                console.log(`No more records found for ${endpointName}.`);
                continueFetching = false;
            }

        } catch (error)
	    {
             if (retries < maxRetries && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
                retries++;
                const delay = 5000 * retries; // Wait longer each time
                console.warn(`   > Request timed out or connection was reset. Retrying in ${delay / 1000}s... (Attempt ${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // For other errors (like duplicates or fatal errors), handle as before
                if (error.code === 11000) {
                    console.log(`   > Some records were duplicates. Moving to next batch.`);
                    offset += limit;
                } else {
                    console.error(`Error seeding ${endpointName} at offset ${offset}:`, error.message);
                    continueFetching = false; // Stop on fatal errors
                }
            }
        }
    }
    console.log(`Finished seeding ${endpointName}. Total records processed: ${totalRecords}.`);
}

async function run() {
    // Establish connection with database
    await mongoose.connect(process.env.MONGO_URI_GAMES);
    console.log("Mongo connected for seeding.");
    
    const accessToken = await getAccessToken();
    
    await seedData('platforms', PlatformModel, accessToken);
    await seedData('genres', GenreModel, accessToken);
    await seedData('franchises', FranchiseModel, accessToken);
    // await seedData('age_ratings', AgeRatingModel, accessToken);
    await seedData('covers', CoverModel, accessToken); 
    await seedData('game_modes', ModeModel, accessToken);
    await seedData('keywords', KeyModel, accessToken);
    await seedData('languages', LanguageModel, accessToken);
    await seedData('themes', TheseModel, accessToken);
    await seedData('game_types', TypeModel, accessToken);
    await seedData('player_perspectives', PerspectiveModel, accessToken);
    await seedData('involved_companies', ICompaniesModel, accessToken);
    await seedData('collections', CollectionsModel, accessToken);
    await seedData('game_engines', GameEngineModel, accessToken);


    await mongoose.connection.close();
    console.log("\nSeeding complete. Mongo connection closed.");
}

run().catch(err => {
    console.error("A fatal error occurred during the seeding process:", err);
    mongoose.connection.close();
});
