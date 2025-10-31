const User = require('../models/Users');
const Game = require('../models/UserGames');


exports.viewGames = async (req, res) => {
    //view all games based on name only (add filters later if we can)

    const game = req.body.games;

    if (game && Array.isArray(games) && games.length > 0) {
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
 };};

exports.addGame = async (req, res) => {
    //add a game to the database
    const games = req.body.games;

    if (!games || !Array.isArray(games) || games.length === 0) {
        return res.status(400).json({ error: 'Request body must be an array of games.' });
    }

    try {
        const result = await GameModel.addedMany(games, { ordered: false });
        return res.status(201).json({
            message: `Successfully added ${result.length} new games to the database.`,
        });

    } catch (e) {
        if (e.code === 11000) {
            return res.status(200).json({
                message: "Games received. Some were duplicates and were ignored.",
            });
        }
        console.error("Database Insertion Error:", e);
        return res.status(500).json({ error: e.toString() });
    }
};

exports.editGame = async (req, res) => {
    //edit game info in the database

};

exports.deleteGame = async (req, res) => {
    //removing a game from the database
    const games = req.body.games;

    if (!games || !Array.isArray(games) || games.length === 0) {
        return res.status(400).json({ error: 'Request body must be an array of games.' });
    }

    //add a "are you sure?" prompt on the frontend before proceeding 
    try {
        const result = await GameModel.deleteMany(games, { ordered: false });
        return res.status(201).json({
            message: `Successfully deleted ${result.length} games to the database.`,
        });

    } catch (e) {
        if (e.code === 11000) {
            return res.status(200).json({
                message: "Games deleted. Some were duplicates and were ignored.",
            });
        }
        console.error("Database Deletion Error:", e);
        return res.status(500).json({ error: e.toString() });
    }
};