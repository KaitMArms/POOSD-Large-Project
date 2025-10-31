const User = require('../models/Users');
const Game = require('../models/Games');

exports.searchGames = async(req, res) => {
    //search all games in the database based on name only (add filters later if we can)
    try {
        const { gameName } = req.body.name;

        const games = Game.find({ name: { $regex: gameName, $options: "i" } });
        res.json(games);

    } catch (err) {
        console.error('Global search error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

exports.recommendedGames = async(req, res) => {
    //via LLM, recommend games based on user's preferences
};

exports.addUserGame = async(req, res) => {
    //add a game to user's collection, add the user to the game as well

    const games = req.body.games;

    if (!games || !Array.isArray(games) || games.length === 0) {
        return res.status(400).json({ error: 'Request body must be an array of games.' });
    }

    try {
        const result = await GameModel.insertMany(games, { ordered: false });
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

    //add the ability to add progress/rating info while adding the game
};