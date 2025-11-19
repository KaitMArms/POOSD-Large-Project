const { UserModel: User, GameModel: Game } = require('../db');

exports.addUserGame = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { gameId, name, status, rating, isLiked } = req.body;

    if (!gameId || !status) {
      return res.status(400).json({ success: false, error: 'gameId and status are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const gameExists = user.userGames.some(game => game.id === gameId);
    if (gameExists) {
      return res.status(409).json({ success: false, error: 'Game already in user list' });
    }

    const newGame = {
      id: gameId,
      name: name,
      status: status,
      userRating: rating,
      isLiked: isLiked,
    };

    user.userGames.push(newGame);
    await user.save();

    return res.status(201).json({ success: true, message: 'Game added to user list', game: newGame });
  } catch (error) {
    console.error('Error adding user game:', error);
    return res.status(500).json({ success: false, error: 'Error adding game to user list' });
  }
};

exports.viewUserGames = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('userGames').lean();
    if (!user || !user.userGames || user.userGames.length === 0) {
      return res.status(200).json({ success: true, games: [] });
    }

    const userGamesMap = new Map(user.userGames.map(g => [g.id, g]));
    const gameIds = Array.from(userGamesMap.keys());

    if (gameIds.length === 0) {
      return res.status(200).json({ success: true, games: [] });
    }

    const pipeline = [
      { $match: { id: { $in: gameIds } } },

      {
        $lookup: {
          from: 'covers',
          localField: 'cover',
          foreignField: 'id',
          as: 'coverObject'
        }
      },
      { $lookup: { from: 'artworks', localField: 'artworks', foreignField: 'id', as: 'artworkObjects' } },
      {
        $addFields: {
          coverUrl: {
            $let: {
              vars: { coverDoc: { $arrayElemAt: ['$coverObject', 0] } },
              in: {
                $cond: [
                  '$$coverDoc',
                  { $concat: ["https://images.igdb.com/igdb/image/upload/t_cover_small/", "$$coverDoc.image_id", ".jpg"] },
                  null
                ]
              }
            }
          },
          bannerUrl: {
            $let: {
              vars: { artDoc: { $arrayElemAt: ['$artworkObjects', 0] } },
              in: {
                $cond: {
                  if: '$$artDoc',
                  then: {
                    $concat: [
                      "https:",
                      {
                        $replaceOne: {
                          input: "$$artDoc.url",
                          find: "t_thumb",
                          replacement: "t_1080p"
                        }
                      }
                    ]
                  },
                  else: null
                }
              }
            }
          },
        }
      },
      { $project: {           
          coverObject: 0,
          artworkObjects: 0,
          cover: 0,
          artworks: 0 
        } }
    ];

    const detailedGames = await Game.aggregate(pipeline);

    const populatedGames = detailedGames.map(game => {
      const userGameData = userGamesMap.get(game.id);
      return {
        ...game,
        status: userGameData.status,
        userRating: userGameData.userRating,
        isLiked: userGameData.isLiked,
      };
    });

    return res.status(200).json({ success: true, games: populatedGames });

  } catch (error) {
    console.error('Error fetching populated user games:', error);
    return res.status(500).json({ success: false, error: 'Error fetching user games' });
  }
};


exports.searchUserGames = async (req, res) => {
  try {
    const userId = req.user?.sub; // Mongo _id from JWT
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // GET /api/user/games/search?searchTerm=halo
    const { searchTerm } = req.query;
    if (!searchTerm || typeof searchTerm !== 'string') {
      return res.status(400).json({ success: false, error: 'searchTerm (string) is required' });
    }

    const user = await User.findById(userId, 'userGames');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const q = searchTerm.toLowerCase();
    const allGames = user.userGames || [];

    const startsWith = [];
    const contains = [];

    for (const g of allGames) {
      if (!g.name) continue;
      const name = g.name.toLowerCase();

      // Prioritize names starting with query
      if (name.startsWith(q)) startsWith.push(g);
      else if (name.includes(q)) contains.push(g);
    }

    // Merge arrays: starts-with results first, then contains
    const filtered = [...startsWith, ...contains];

    return res.status(200).json({
      success: true,
      count: filtered.length,
      games: filtered
    });
  } catch (error) {
    console.error('Error searching user games:', error);
    return res.status(500).json({ success: false, error: 'Error searching user games' });
  }
};



exports.deleteUserGame = async (req, res) => {
  try {
    const userId = req.user?.sub; // from JWT payload
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const gameId = Number(req.params.gameId);
    if (!Number.isInteger(gameId)) {
      return res.status(400).json({ success: false, error: 'Valid numeric gameId path param required' });
    }

    // Ensure it exists before pulling (so we can return 404 if not in library)
    const user = await User.findById(userId, 'userGames');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const hasGame = user.userGames.some(g => g.id === gameId);
    if (!hasGame) {
      return res.status(404).json({ success: false, error: 'Game not found in user library' });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $pull: { userGames: { id: gameId } } },
      { new: true, projection: { userGames: 1 } }
    );

    return res.status(200).json({
      success: true,
      message: 'Game removed from your library',
      removedCount: 1,
      userGames: updated.userGames
    });
  } catch (error) {
    console.error('Error deleting user game:', error);
    return res.status(500).json({ success: false, error: 'Error deleting game from collection' });
  }
};


exports.likeGame = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const gameId = Number(req.params.gameId);
    if (!Number.isInteger(gameId)) {
      return res.status(400).json({ success: false, error: 'Valid numeric gameId path param required' });
    }

    const user = await User.findById(userId, 'userGames');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const game = user.userGames.find(g => g.id === gameId);
    if (!game) {
      return res.status(404).json({ success: false, error: 'Game not found in user library' });
    }

    game.isLiked = !game.isLiked;
    await user.save();

    return res.status(200).json({ success: true, message: 'Game like status updated', isLiked: game.isLiked });
  } catch (error) {
    console.error('Error liking game:', error);
    return res.status(500).json({ success: false, error: 'Error liking game' });
  }
};

exports.editGameInfo = async (req, res) => {
  try {
    const userId = req.user?.sub; // Mongo _id lives in JWT `sub`
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Route: PATCH /api/user/games/:gameId
    const gameId = Number(req.params.gameId ?? req.body.gameId);
    if (!Number.isInteger(gameId)) {
      return res.status(400).json({ success: false, error: 'Valid numeric gameId required (path param)' });
    }

    const { status, isLiked, rating, review } = req.body;

    // Validate status
    if (status !== undefined) {
      const allowed = ['completed', 'in-progress', 'on-hold', 'dropped', 'to-play'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }
    }

    // Validate rating
    if (rating !== undefined) {
      const n = Number(rating);
      if (!Number.isFinite(n) || n < 0 || n > 10) {
        return res.status(400).json({ success: false, error: 'rating must be a number between 0 and 10' });
      }
    }

    // Validate review (≤ 500 chars)
    if (review !== undefined) {
      if (typeof review !== 'string' || review.length > 500) {
        return res.status(400).json({ success: false, error: 'review must be a string up to 500 characters' });
      }
    }

    if (
      status === undefined &&
      isLiked === undefined &&
      rating === undefined &&
      review === undefined
    ) {
      return res.status(400).json({ success: false, error: 'Provide at least one of {status, isLiked, rating, review}' });
    }

    const update = {};
    if (status !== undefined) update['userGames.$.status'] = status;
    if (isLiked !== undefined) update['userGames.$.isLiked'] = !!isLiked;
    if (rating !== undefined) update['userGames.$.userRating'] = Number(rating);
    if (review !== undefined) update['userGames.$.review'] = review;

    const updatedDoc = await User.findOneAndUpdate(
      { _id: userId, 'userGames.id': gameId },
      { $set: update },
      { new: true, projection: { userGames: 1 } }
    );

    if (!updatedDoc) {
      return res.status(404).json({ success: false, error: 'Game not found in user library' });
    }

    const updatedGame = updatedDoc.userGames.find(g => g.id === gameId);
    return res.status(200).json({ success: true, message: 'Updated', game: updatedGame });
  } catch (error) {
    console.error('Error updating game info:', error);
    return res.status(500).json({ success: false, error: 'Error updating game information' });
  }
};
