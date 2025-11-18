const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fetch = require('node-fetch'); // <-- Use node-fetch

// The URL for your local API server
const YOUR_SERVER_API_URL = 'http://localhost:8080/api/games';

// Authenticates with Twitch using node-fetch
async function getAccessToken() {
    console.log("Requesting Twitch Access Token...");

    // Construct the URL with query parameters
    const twitchUrl = new URL('https://id.twitch.tv/oauth2/token');
    twitchUrl.searchParams.append('client_id', process.env.TWITCH_CLIENT_ID);
    twitchUrl.searchParams.append('client_secret', process.env.TWITCH_CLIENT_SECRET);
    twitchUrl.searchParams.append('grant_type', 'client_credentials');

    try {
        const response = await fetch(twitchUrl, { method: 'POST' });
        const data = await response.json();

        if (!response.ok) {
            // If the response is not a 2xx, throw an error with the message from Twitch
            throw new Error(data.message || `Twitch API returned status ${response.status}`);
        }

        console.log("Token received.");
        return data.access_token;
    } catch (error) {
        console.error("FATAL: Could not get Twitch Access Token.", error);
        throw error; // Re-throw to stop the script
    }
}

// Main import function using node-fetch
async function importGames() {
    try {
        const accessToken = await getAccessToken();
        let offset = 0;
        const limit = 500;
        let continueFetching = true;
        let totalGamesProcessed = 0;

        console.log("\n--- Starting Game Import Loop ---");

        while (continueFetching) {
            console.log(`Fetching games batch with offset: ${offset}...`);

            const igdbResponse = await fetch('https://api.igdb.com/v4/games', {
                method: 'POST',
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'text/plain',
                },
                body: `fields name,slug,summary,first_release_date,genres,cover,age_ratings,franchise,platforms,game_modes,keywords,language_supports,themes,game_type,player_perspectives,rating,rating_count,involved_companies,game_engines,collections,storyline,summary,artworks; limit ${limit}; offset ${offset}; where platforms != null;`
            });

            const gamesBatch = await igdbResponse.json();

            if (!Array.isArray(gamesBatch) || gamesBatch.length === 0) {
                console.log("No more games found or received an invalid response. Ending import.");
                continueFetching = false;
                break;
            }
            console.log(`  > Found ${gamesBatch.length} games. Sending to our server...`);

            // Post the fetched information to your local server using node-fetch
            const serverResponse = await fetch(YOUR_SERVER_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ games: gamesBatch })
            });

            // Check if the server responded with a 404
            if (serverResponse.status === 404) {
                throw new Error(`Request failed with status code 404. Endpoint not found.`);
            }
            if (!serverResponse.ok) {
                const errorData = await serverResponse.json();
                throw new Error(errorData.message || `Server returned status ${serverResponse.status}`);
            }

            const responseData = await serverResponse.json();
            console.log(`  > Server Response: ${responseData.message}`);

            totalGamesProcessed += gamesBatch.length;
            offset += limit;

            await new Promise(resolve => setTimeout(resolve, 300));
        }
        console.log(`\nImport finished. Total games processed: ${totalGamesProcessed}`);
    } catch (error) {
        console.error("\nAn error occurred during the import loop:", error.message);
        console.log("Import finished. Total games processed: 0");
    }
}

// Run the script
importGames();