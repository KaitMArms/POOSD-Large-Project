const express = require('express');
const router = express.Router();
const GameModel = require('../models/Games'); 

router.post('/', async (req, res) => {
    const games = req.body.games; 
    
    if (!games || !Array.isArray(games) || games.length === 0) {
        return res.status(400).json({ error: 'Request body must be an array of games.' });
    }

    try {
        const result = await GameModel.deleteMany(games, { ordered: false }); 
        return res.status(201).json({ 
            message: `Successfully deleted ${result.length} games to the database.`,
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
});

module.exports = router;