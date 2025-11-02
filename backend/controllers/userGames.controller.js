const User = require('../models/Users');
const Game = require('../models/UserGames');

exports.viewUserGames = async (req, res) => {
    try {
        // Get the user ID from the authenticated request
        const userId = req.user._id;

        // Find the user and populate their games
        const user = await User.findById(userId).populate('games');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return the user's games
        return res.status(200).json({
            success: true,
            games: user.games
        });
    } catch (error) {
        console.error('Error fetching user games:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Error fetching user games' 
        });
    }
};

exports.searchUserGames = async (req, res) => {
    try {
        // Get the user ID from the authenticated request
        const userId = req.user._id;
        
        // Get search parameters from request body
        const { searchTerm, status } = req.body;

        // Find the user first
        const user = await User.findById(userId).populate('games');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Filter the user's games based on search criteria
        let filteredGames = user.games;

        if (searchTerm) {
            filteredGames = filteredGames.filter(game => 
                game.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (status) {
            filteredGames = filteredGames.filter(game => 
                game.status === status
            );
        }

        return res.status(200).json({
            success: true,
            games: filteredGames,
            count: filteredGames.length
        });
    } catch (error) {
        console.error('Error searching user games:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Error searching user games'
        });
    }
};


exports.deleteUserGame = async (req, res) => {
    try {
        // Get the user ID from the authenticated request
        const userId = req.user._id;

        // Get the game IDs to delete from request body
        const { gameIds } = req.body;

        if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Request body must include an array of game IDs to delete.' 
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        // Remove the games from the user's collection
        const result = await User.findByIdAndUpdate(
            userId,
            { $pull: { games: { id: { $in: gameIds } } } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Games successfully removed from your collection',
            removedCount: gameIds.length
        });

    } catch (error) {
        console.error('Error deleting user games:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Error deleting games from collection' 
        });
    }
};

exports.editGameInfo = async (req, res) => {
    try {
        // Get the user ID from the authenticated request
        const userId = req.user._id;

        // Get update information from request body
        const { gameId, status, isLiked } = req.body;

        if (!gameId) {
            return res.status(400).json({ 
                success: false,
                error: 'Game ID is required' 
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        // Validate status if provided
        if (status && !['completed', 'in-progress', 'on-hold', 'dropped', 'to-play'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value. Must be one of: completed, in-progress, on-hold, dropped, to-play'
            });
        }

        // Build update object based on what was provided
        const updateFields = {};
        if (status !== undefined) updateFields['games.$.status'] = status;
        if (isLiked !== undefined) updateFields['games.$.isLiked'] = isLiked;

        // Update the specific game in the user's collection
        const result = await User.findOneAndUpdate(
            { 
                _id: userId,
                'games.id': gameId 
            },
            { 
                $set: updateFields
            },
            { 
                new: true,
                runValidators: true
            }
        ).populate('games');

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Game not found in user collection'
            });
        }

        // Find the updated game to return in response
        const updatedGame = result.games.find(game => game.id === gameId);

        return res.status(200).json({
            success: true,
            message: 'Game information updated successfully',
            game: updatedGame
        });

    } catch (error) {
        console.error('Error updating game info:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Error updating game information'
        });
    }
};

