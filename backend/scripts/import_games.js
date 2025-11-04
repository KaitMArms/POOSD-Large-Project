require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const YOUR_SERVER_API_URL = 'http://127.0.0.1:8080/api/games'; 

// Authenticates with Twitch
async function getAccessToken() {
    console.log("Requesting Twitch Access Token...");
    // Send a request to twitch authentication given the credentials in .env
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    });
    console.log("Token received.");
    return response.data.access_token;
}

// Sends request to gather game information
async function importGames() {
    const accessToken = await getAccessToken();
    
    let offset = 0;            
    const limit = 500; 
    let continueFetching = true; 
    let totalGamesProcessed = 0;

    console.log("\n--- Starting Game Import Loop ---");

    while (continueFetching) {
        try {
            console.log(`Fetching games batch with offset: ${offset}...`);
            
            // Request to twitch's servers, requests information about limit games with an increment of offset
            const igdbResponse = await axios.post('https://api.igdb.com/v4/games',
                `fields name,slug,summary,first_release_date,genres,cover,age_ratings,franchise,platforms,game_modes,keywords,language_supports,themes,game_type,player_perspectives; limit ${limit}; offset ${offset}; where platforms != null;`,
                {
                    headers: {
                        'Client-ID': process.env.TWITCH_CLIENT_ID,
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            const gamesBatch = igdbResponse.data;

            // If no games were fetched then we are done importing
            if (gamesBatch.length === 0) {
                console.log("No more games found. Ending import.");
                continueFetching = false;
                break;
            }

            console.log(`  > Found ${gamesBatch.length} games. Sending to our server...`);
            
            // Post the fetched information to the mongodb server
            const serverResponse = await axios.post(YOUR_SERVER_API_URL, { games: gamesBatch });
            
            console.log(`  > Server Response: ${serverResponse.data.message}`);
            totalGamesProcessed += gamesBatch.length;

            offset += limit;

            // Wait 3ms to avoid being rate limited
            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
            console.error("An error occurred during the import loop:", error.message);
            continueFetching = false;
        }
    }
    console.log(`\nImport finished. Total games processed: ${totalGamesProcessed}`);
}

importGames();

