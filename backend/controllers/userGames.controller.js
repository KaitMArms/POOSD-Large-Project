const User = require('../models/Users');


exports.viewUserGames = async (req, res) => {
  try {
    const user = await User.findById(req.user._id, 'userGames');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ success: true, games: user.userGames });
  } catch (error) {
    console.error('Error fetching user games:', error);
    return res.status(500).json({ success: false, error: 'Error fetching user games' });
  }
};

exports.searchUserGames = async (req, res) => {
  try {
    const { searchTerm, status } = req.body;
    const user = await User.findById(req.user._id, 'userGames');
    if (!user) return res.status(404).json({ error: 'User not found' });

    let filtered = user.userGames;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(g => g.name?.toLowerCase().includes(q));
    }
    if (status) {
      filtered = filtered.filter(g => g.status === status);
    }

    return res.status(200).json({ success: true, count: filtered.length, games: filtered });
  } catch (error) {
    console.error('Error searching user games:', error);
    return res.status(500).json({ success: false, error: 'Error searching user games' });
  }
};


// DELETE /me/library   body: { gameIds: [123, 456] }  // IGDB ids
exports.deleteUserGame = async (req, res) => {
  try {
    const { gameIds } = req.body;
    if (!Array.isArray(gameIds) || gameIds.length === 0) {
      return res.status(400).json({ success: false, error: 'gameIds[] required' });
    }

    const result = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { userGames: { id: { $in: gameIds } } } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Games removed from your library',
      removedCount: gameIds.length,
      userGames: result.userGames,
    });
  } catch (error) {
    console.error('Error deleting user games:', error);
    return res.status(500).json({ success: false, error: 'Error deleting games from collection' });
  }
};


// PATCH /me/library   body: { gameId, status?, isLiked? }
exports.editGameInfo = async (req, res) => {
  try {
    const { gameId, status, isLiked } = req.body;
    if (typeof gameId !== 'number') {
      return res.status(400).json({ success: false, error: 'gameId (IGDB number) required' });
    }

    if (status && !['completed','in-progress','on-hold','dropped','to-play'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const update = {};
    if (status !== undefined)  update['userGames.$.status'] = status;
    if (isLiked !== undefined) update['userGames.$.isLiked'] = !!isLiked;

    const result = await User.findOneAndUpdate(
      { _id: req.user._id, 'userGames.id': gameId },
      { $set: update },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, error: 'Game not found in user library' });
    }

    const updated = result.userGames.find(g => g.id === gameId);
    return res.status(200).json({ success: true, message: 'Updated', game: updated });
  } catch (error) {
    console.error('Error updating game info:', error);
    return res.status(500).json({ success: false, error: 'Error updating game information' });
  }
};

