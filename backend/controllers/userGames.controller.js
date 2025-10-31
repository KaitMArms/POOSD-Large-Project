const User = require('../models/Users');
const Game = require('../models/UserGames');

exports.viewUserGames = async (req, res) => {
    //view all games in user's collection
};

exports.searchUserGames = async (req, res) => {
    //review, search via user first then the game within user's collection

    const games = req.body.games;

    if (games && Array.isArray(games) && games.length > 0) {
        try {
            const found = await Game.find({ title: {$in: games}});
            return res.status(200).json({ 
                message: `Found ${games.lenght}` });
        }
        catch (e){
            if (e.code == 11000){
                return res.status(200).json({
                    message: "Games received. Some were dulicates and were ignored.",
                })
            }
            console.error("Database Search Error:", e);
            return res.status(500).json({ error: e.toString() });
        }

    };
}

exports.deleteUserGame = async (req, res) => {

    //delete games from user's collection, search user first then the game within user's collection
    const games = req.body.games; 
    
    if (!games || !Array.isArray(games) || games.length === 0) {
        return res.status(400).json({ error: 'Request body must be an array of games.' });
    }

    try {
        const result = await GameModel.deleteMany(games, { ordered: false }); 
        return res.status(201).json({ 
            message: `Successfully deleted ${result.length} games from the database.`,
        });

    } catch(e) {
        if (e.code === 11000) {
             return res.status(200).json({ 
                message: "Games deleted. Some were duplicates and were ignored.",
            });
        }
        console.error("Database Deletion Error:", e);
        return res.status(500).json({ error: e.toString() });
    }
;};

exports.editGameInfo = async (req, res) => {
    //edit the game info (completed, to play, in progress, paused, dropped) and rating (1-5 stars)



};

