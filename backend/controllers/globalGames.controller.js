const User = require('../models/Users');
const Game = require('../models/Games');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

exports.recommendedGames = async(req, res) => {
    //via LLM, recommend games based on user's preferences
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