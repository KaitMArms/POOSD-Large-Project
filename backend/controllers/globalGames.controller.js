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

exports.browseRecommended = async (req,res) => {

  try{
      const limitReq = Math.max(parseInt(req.query.limit || '50', 10), 1);
      const limit = Math.min (limitReq, 50);

      const userId = req.user?.sub || req.user?.uid ||null;

      if (userId){
        const userDoc = await User.findById(userId).select('userGames').lean().exec();
        const likedIds = (userDoc?.userGames || [])
        .filter(g=>g.isLiked === true)
        .map(g => g.id);

        const userProfileVector = await user_profile.buildUserProfileVector(userId, { UserModel: User, GameModel: Game});

        const recs = await recommend.getRecommendations(userProfileVector, likedIds, {GameModel: Game});

        const recIds = recs.map(r =>r.id);
        const games = await Game.find({id: {$in: recIds } }).lean().exec();

        const gamesById = new Map (games.map(g => [g.id, g]));
        const results  = recs.map (r=> ({ ...r,game: gamesById.get(r.id) || null}))
        .slice(0,limit);

        return res.json ({recommendations: results});

      }
      else {
        const items = await Game.find({}, 'id name rating_count summary first_release_date')
        .sort({rating_count: -1, rating: -1, first_release_date: -1})
        .limit(limit).lean().exec();

        return res.json ({recommendations: items });
      }
  }
  catch (err)
  {
    console.error('browseRecommended error: ', err);
    return res.status(500).json({message: 'Server error browse.'});
  }

};

exports.searchGames = async (req, res) => {
  try {
    const qRaw = (req.query.q || '').trim();
    if (!qRaw) {
      return res.status(400).json({ message: "Query param 'q' is required." });
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limitReq = Math.max(parseInt(req.query.limit || '24', 10), 1);
    const limit = Math.min(limitReq, 50);

    const anywhereRegex = new RegExp(escapeRegex(qRaw), 'i');
    const qLower = qRaw.toLowerCase();
    const startsWithPattern = `^${escapeRegex(qLower)}`;

    const pipeline = [
      { $match: { name: { $regex: anywhereRegex } } },
      {
        $addFields: {
          _lowerName: { $toLower: "$name" },
          _startsWith: {
            $cond: [
              { $regexMatch: { input: { $toLower: "$name" }, regex: startsWithPattern } },
              1,
              0
            ]
          }
        }
      },
      // Sort priority:
      // 1. starts-with first
      // 2. lowercase version (case-insensitive alpha)
      // 3. original-case name (so Halo < HalOpe)
      // 4. _id for stability
      { $sort: { _startsWith: -1, _lowerName: 1, name: 1, _id: 1 } },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          total: [
            { $count: "count" }
          ]
        }
      }
    ];

    const agg = await Game.aggregate(pipeline);
    const data = (agg[0]?.data) || [];
    const total = (agg[0]?.total?.[0]?.count) ?? 0;

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return res.json({
      data,
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
    console.error('Global search error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.recommendedGames = async (req, res) => {
  // Get usergames IDs
  try{
    const curUser = req.user?.sub || req.user?.uid || req.user?.userID;
    if (!curUser) return res.status(401).json({message: 'Unauthorized'});

    const userDoc = await User.findById(curUser).select('userGames').lean().exec();
    const likedIds = (userDoc?.userGames || []).map(g=> g.id);

    const userProfileVector = await user_profile.buildUserProfileVector(curUser, {UserModel: User, GameModel: Game});
    // Call functions for recommending games
    const recommendations = await recommend.getRecommendations(userProfileVector, likedIds, {GameModel: Game});

    return res.json({recommendations});
  }
  catch(err)
  {
    console.error('recommendedGames error',err);
    return res.status(500).json({message: 'Server error recommended.'});
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
  console.log('getGameById called with id:', req.params.id);
  try {
    const gameId = parseInt(req.params.id, 10);

    if (isNaN(gameId)){
      return res.status(400).json({message: 'Invalid Game ID format.'});
    }

    const pipeline = [
      { $match: {id: gameId}},
      {
        $lookup: {
          from: 'genres',
          localField: 'genres',
          foreignField: 'genres',
          as: 'genreObjects'
        }
      },
      {
        $addFields: {
          genres: '$genreObjects.name'
        }
      },
      {
        $project: {
          genreObjects: 0
        }
      }
    ]
    const gameArr = await Game.aggregate(pipeline);
    if (!gameArr || gameArr.length == 0) {
      return res.status(404).json({ message: 'Game not found' });
    }
    return res.json(gameArr[0]);
  } catch (err) {
    console.error('getGameById error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};