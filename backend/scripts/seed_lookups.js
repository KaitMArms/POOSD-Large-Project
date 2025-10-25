require('dotenv').config({ path: '../.env' }); 
const axios = require('axios');
const mongoose = require('mongoose');

const PlatformModel = require('../models/Platform');
const GenreModel = require('../models/Genre');
const FranchiseModel = require('../models/Franchise');
const AgeRatingModel = require('../models/AgeRating');
const CoverModel = require('../models/Cover');
const ModeModel = require('../models/GameMode');
const KeyModel = require('../models/KeyWords');
const LanguageModel = require('../models/LanguageSupport');
const TheseModel = require('../models/Themes');
const TypeModel = require('../models/GameType');
const PerspectiveModel = require('../models/Perspective');

async function getAccessToken() {
    console.log("Requesting Twitch Access Token...");
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

async function seedData(endpointName, Model, accessToken) {
    console.log(`\n--- Seeding ${endpointName} ---`);
    
    let offset = 0;
    const limit = 500;
    let continueFetching = true;
    let totalRecords = 0;
    let retries = 0;
    const maxRetries = 5;

    while (continueFetching) {
        try {
            const fields = (endpointName === 'covers') ? 'fields id,image_id;' : 'fields *;';
            
            console.log(`   > Fetching ${endpointName} with offset ${offset}...`);
            const response = await axios.post(`https://api.igdb.com/v4/${endpointName}`,
                `${fields} limit ${limit}; offset ${offset};`,
                {
                    headers: {
                        'Client-ID': process.env.TWITCH_CLIENT_ID,
                        'Authorization': `Bearer ${accessToken}`
                    },

		    timeout: 10000
                }
            );
	    retries = 0;

            const data = response.data;
            if (data.length > 0) {
                await Model.insertMany(data, { ordered: false });
                totalRecords += data.length;
                offset += limit; 

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
    await mongoose.connect(process.env.MONGO_URI_GAMES);
    console.log("Mongo connected for seeding.");
    
    const accessToken = await getAccessToken();
    
    await seedData('platforms', PlatformModel, accessToken);
    await seedData('genres', GenreModel, accessToken);
    await seedData('franchises', FranchiseModel, accessToken);
    await seedData('age_ratings', AgeRatingModel, accessToken);
    await seedData('covers', CoverModel, accessToken); 
    await seedData('game_modes', ModeModel, accessToken);
    await seedData('keywords', KeyModel, accessToken);
    await seedData('language_supports', LanguageModel, accessToken);
    await seedData('themes', TheseModel, accessToken);
    await seedData('game_types', TypeModel, accessToken);

    await mongoose.connection.close();
    console.log("\nSeeding complete. Mongo connection closed.");
}

run().catch(err => {
    console.error("A fatal error occurred during the seeding process:", err);
    mongoose.connection.close();
});
