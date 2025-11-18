const { UserModel: User } = require('../db');
const { GameModel: Game } = require('../db');
const recommend = require('../services/recommend');
const user_profile = require('../services/user_profile');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.browseGames = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limitReq = Math.max(parseInt(req.query.limit || '50', 10), 1);
    const limit = Math.min(limitReq, 50); // cap at 50 per page

    const sort = { first_release_date: -1, name: 1, _id: 1 };

    const [items, total] = await Promise.all([
      Game.find({}, null).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Game.estimatedDocumentCount() // fast count; good enough for browse
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return res.json({
      data: items,
      paging: {
        page,
        limit,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages
      }
    });
  } catch (err) {
    console.error('browseGames error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.browseRecommended = async (req, res) => {
  try {
    const limitReq = Math.max(parseInt(req.query.limit || '50', 10), 1);
    const limit = Math.min(limitReq, 50);

    const userId = req.user?.sub || req.user?.uid || null;

    if (userId) {
      const userDoc = await User.findById(userId).select('userGames').lean().exec();
      const likedIds = (userDoc?.userGames || []).filter(g => g.isLiked === true).map(g => g.id);

      const userProfileVector = await user_profile.buildUserProfileVector(userId, { UserModel: User, GameModel: Game });

      const recs = await recommend.getRecommendations(userProfileVector, likedIds, { GameModel: Game });
      if (recs.length === 0) {
        return res.json({ recommendations: [] });
      }

      const recIds = recs.map(r => r.id);
      const pipeline = [
        { $match: { id: { $in: recIds } } },
        {
          $lookup: {
            from: 'covers',
            localField: 'cover',
            foreignField: 'id',
            as: 'coverObject'
          }
        },
        {
          $addFields: {
            coverUrl: {
              $let: {
                vars: { coverDoc: { $arrayElemAt: ['$coverObject', 0] } },
                in: { $cond: ['$$coverDoc', { $concat: ["https://images.igdb.com/igdb/image/upload/t_cover_small/", "$$coverDoc.image_id", ".jpg"] }, null] }
              }
            }
          }
        },
        { $project: { coverObject: 0} }
      ];

      const games = await Game.aggregate(pipeline);

      const gamesById = new Map(games.map(g => [g.id, g]));
      const results = recs
        .map(r => ({ ...r, game: gamesById.get(r.id) || null }))
        .filter(r => r.game) 
        .slice(0, limit);

      return res.json({ recommendations: results });
    } 
  } catch (err) {
    console.error('recommendedGames error', err);
    return res.status(500).json({ message: 'Server error recommended.' });
  }
};
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.searchGames = async (req, res) => {
  try {
    const qRaw = (req.query.q || '').trim();
    const hasGameTypes = req.query.game_types && req.query.game_types.length > 0;
    const hasRatedOnly = req.query.ratedOnly === 'true';

    if (!qRaw && !hasGameTypes && !hasRatedOnly) {
      return res.json({
        data: [],
        paging: { page: 1, limit: 24, total: 0, totalPages: 1, hasPrev: false, hasNext: false }
      });
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit || '24', 10), 50);
    const skip = (page - 1) * limit;

    const matchConditions = {};

    if (qRaw) {
      const anywhereRegex = new RegExp(escapeRegex(qRaw), 'i');
      matchConditions.name = { $regex: anywhereRegex };
    }

    if (hasGameTypes) {
      const gameTypes = Array.isArray(req.query.game_types)
        ? req.query.game_types.map(id => parseInt(id, 10))
        : [parseInt(req.query.game_types, 10)];

      const validGameTypes = gameTypes.filter(id => !isNaN(id));
      if (validGameTypes.length > 0) {
        matchConditions.game_type = { $in: validGameTypes };
      }
    }

    if (hasRatedOnly) {
      matchConditions['age_ratings.0'] = { $exists: true };
    }

    if (qRaw) {
      const anywhereRegex = new RegExp(escapeRegex(qRaw), 'i');
      matchConditions.name = { $regex: anywhereRegex };
    }

    if (hasGameTypes) {
      const gameTypes = Array.isArray(req.query.game_types)
        ? req.query.game_types.map(id => parseInt(id, 10))
        : [parseInt(req.query.game_types, 10)];

      const validGameTypes = gameTypes.filter(id => !isNaN(id));
      if (validGameTypes.length > 0) {
        matchConditions.game_type = { $in: validGameTypes };
      }
    }

    if (hasRatedOnly) {
      matchConditions['age_ratings.0'] = { $exists: true };
    }

    const pipeline = [
      { $match: matchConditions },

      { $sort: { name: 1 } },

      { $skip: skip },
      { $limit: limit },

      {
        $lookup: {
          from: 'covers', 
          localField: 'cover',
          foreignField: 'id',
          as: 'coverObject'
        }
      },

      {
        $lookup: {
          from: 'genres', 
          localField: 'genres',
          foreignField: 'id',
          as: 'genreObjects'
        }
      },

      {
        $addFields: {
          coverUrl: {
            $cond: [
              { $gt: [{ $size: "$coverObject" }, 0] },
              {
                $concat: [
                  "https://images.igdb.com/igdb/image/upload/t_cover_small/",
                  { $arrayElemAt: ["$coverObject.image_id", 0] },
                  ".jpg"
                ]
              },
              null 
            ]
          },
          genres: '$genreObjects.name'
        }
      },

      { $project: { coverObject: 0, genreObjects: 0 } }
    ];

    const results = await Game.aggregate(pipeline);

    const total = await Game.countDocuments(matchConditions);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.json({
      data: results,
      paging: {
        page,
        limit,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages
      }
    });

  } catch (err) {
    console.error('searchGames error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.recommendedGames = async (req, res) => {
  // Get usergames IDs
  try {
    const curUser = req.user?.sub || req.user?.uid || req.user?.userID;
    if (!curUser) return res.status(401).json({ message: 'Unauthorized' });

    const userDoc = await User.findById(curUser).select('userGames').lean().exec();
    const likedIds = (userDoc?.userGames || []).map(g => g.id);

    const userProfileVector = await user_profile.buildUserProfileVector(curUser, { UserModel: User, GameModel: Game });
    // Call functions for recommending games
    const recommendations = await recommend.getRecommendations(userProfileVector, likedIds, { GameModel: Game });

    return res.json({ recommendations });
  }
  catch (err) {
    console.error('recommendedGames error', err);
    return res.status(500).json({ message: 'Server error recommended.' });
  }
};

exports.addUserGame = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { id, name } = req.body;
    if (typeof id !== 'number' || !name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Body must include numeric "id" and string "name".' });
    }

    const exists = await User.exists({ _id: userId, 'userGames.id': id });
    if (exists) {
      return res.status(409).json({ message: 'Game already in user list.' });
    }

    const entry = {
      id,
      name,
      status: 'to-play',
      isLiked: false,
      userRating: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updated = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { userGames: entry } },
      { new: true, projection: { userGames: 1 } }
    ).lean();

    const added = updated?.userGames.find(g => g.id === id) || entry;

    return res.status(201).json({
      message: 'Added game to user list.',
      game: added
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const gameId = parseInt(req.params.id, 10);
    if (isNaN(gameId)) {
      return res.status(400).json({ message: 'Invalid Game ID format.' });
    }

    const pipeline = [
      { $match: { id: gameId } },

      { $lookup: { from: 'genres', localField: 'genres', foreignField: 'id', as: 'genreObjects' } },
      { $lookup: { from: 'covers', localField: 'cover', foreignField: 'id', as: 'coverObject' } },
      { $lookup: { from: 'artworks', localField: 'artworks', foreignField: 'id', as: 'artworkObjects' } },

      {
        $addFields: {
          genres: '$genreObjects.name',
          
          bannerUrl: {
            $let: {
              vars: {
                artDoc: { $arrayElemAt: ['$artworkObjects', 0] }
              },
              in: {
                $cond: {
                  if: '$$artDoc', 
                  then: {
                    $concat: [
                      "https:", 
                      { $replaceOne: { input: "$$artDoc.url", find: "/t_thumb/", replacement: "/t_1080p/" } }
                    ]
                  },
                  else: null 
                }
              }
            }
          },

          coverUrl: {
            $let: {
              vars: {
                coverDoc: { $arrayElemAt: ['$coverObject', 0] }
              },
              in: {
                $cond: {
                  if: '$$coverDoc',
                  then: {
                    $concat: [
                      "https:",
                      { $replaceOne: { input: "$$coverDoc.url", find: "/t_thumb/", replacement: "/t_cover_big/" } }
                    ]
                  },
                  else: null
                }
              }
            }
          }
        }
      },

      {
        $project: {
          genreObjects: 0,
          coverObject: 0,
          artworkObjects: 0,
          cover: 0,
          artworks: 0
        }
      }
    ];

    const gameArr = await Game.aggregate(pipeline);
    if (!gameArr || gameArr.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }

    return res.json(gameArr[0]);
  } catch (err) {
    console.error('getGameById error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};