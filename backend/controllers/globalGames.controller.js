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

    //const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    //const limitReq = Math.max(parseInt(req.query.limit || '50', 10), 1);
    //const limit = Math.min(limitReq, 50); // cap at 50 per page

    //Function to get array of recommended games IDs.
    const gamesIDs = recommend.recommendedGames;
    
    // Get games by IDs
    const games = await Game.find({ _id: { $in: gamesIDs}});
    return res.json({games});

  }catch(error) {
    console.error('browseRecommended error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }

}

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
  try {
    const userId = req.user.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - no user ID found' });
    }

    // 1. Fetch the user to get their games list
    const user = await User.findById(userId).select('userGames').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userGameIds = (user.userGames || []).map(g => g.id);

    if (userGameIds.length === 0) {
      // If user has no games, we can't generate a profile vector.
      // Return a default list, like top-rated games.
      const topGames = await Game.find({ rating: { $gt: 90 } }).sort({ rating_count: -1 }).limit(20).lean();
      return res.json({ games: topGames });
    }

    // 2. Fetch full game documents for the user's library
    const userGamesFull = await Game.find({ id: { $in: userGameIds } }).lean();

    // 3. Build the user's profile vector
    const userProfileVector = await user_profile.buildUserProfileVector(userGamesFull);

    // 4. Get recommendations
    const recommendedGameInfo = await recommend.getRecommendations(
      userProfileVector,
      userGameIds,
      { GameModel: Game }
    );

    // 5. The service returns a list of {id, name, score}. Fetch full docs for these.
    const recommendedGameIds = recommendedGameInfo.map(r => r.id);
    const games = await Game.find({ id: { $in: recommendedGameIds } }).lean();

    // Optional: Re-order the full docs to match the recommendation score order
    const orderedGames = recommendedGameIds.map(id => games.find(g => g.id === id)).filter(Boolean);

    return res.json({ games: orderedGames });

  } catch (err) {
    console.error('Recommendation error:', err);
    return res.status(500).json({ message: 'Server error during recommendation.' });
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
    console.error('addUserGame error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};