const { UserModel: User } = require('../db');
const { GameModel: Game } = require('../db');
const mongoose = require('mongoose');
const BIO_MAX = 300; // schema maxlength
const fs = require('fs');
const jwt = require('jsonwebtoken');
const JWT_EXPIRES = '1d';

function signToken(user) {
  const payload = {
    sub: user._id.toString(),
    uid: user.userID,
    email: user.email,
    username: user.username,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

exports.profile = async (req, res) => {
  try {
    const userID = req.user.sub;
    const user = await User.findById(userID)
      .select('firstName lastName username email avatarUrl bio role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        firstName: user.firstName,
        lastName:  user.lastName,
        username:  user.username,
        email:     user.email,
        avatarUrl: user.avatarUrl,
        bio:       user.bio,
        role:      user.role
      }
    });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.profileUpd = async (req, res) => {
  try {
    const userId = req.user.sub;

    // Whitelist fields we allow to change
    const allowed = ['firstName', 'lastName', 'username', 'avatarUrl', 'bio'];
    const body = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const update = {};

    // Normalize names (optional, but nice)
    if (body.firstName !== undefined) update.firstName = String(body.firstName).trim();
    if (body.lastName  !== undefined) update.lastName  = String(body.lastName).trim();

    // Username: normalize + uniqueness check
    if (body.username !== undefined) {
      const nextUsername = String(body.username).toLowerCase().trim();
      if (!nextUsername) {
        return res.status(400).json({ message: 'Username cannot be empty.' });
      }
      // Optional: basic pattern check (mirror your schema)
      if (!/^[a-z0-9._-]{3,30}$/.test(nextUsername)) {
        return res.status(400).json({ message: 'Username must be 3–30 chars, a–z, 0–9, dot, underscore, or dash.' });
      }
      const existing = await User.findOne({ username: nextUsername });
      if (existing && existing._id.toString() !== userId) {
        return res.status(409).json({ message: 'Username already taken.' });
      }
      update.username = nextUsername;
    }

    // Avatar / pfp URL (allow empty string to clear)
    if (body.avatarUrl !== undefined) {
      update.avatarUrl = String(body.avatarUrl).trim();
    }

    // Bio (enforce soft limit here for friendly error; schema enforces hard limit)
    if (body.bio !== undefined) {
      const bio = String(body.bio);
      if (bio.length > BIO_MAX) {
        return res.status(400).json({ message: `Bio cannot exceed ${BIO_MAX} characters.` });
      }
      update.bio = bio.trim();
    }

    // Perform update
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true, context: 'query' }
    ).select('firstName lastName username email avatarUrl bio userID createdAt');

    if (!updated) return res.status(404).json({ message: 'User not found.' });

    return res.status(200).json({ success: true, user: updated });
  } catch (err) {
    // Handle duplicate key edge cases (race conditions)
    if (err?.code === 11000) {
      if (err.keyPattern?.username) return res.status(409).json({ message: 'Username already taken.' });
      if (err.keyPattern?.email)    return res.status(409).json({ message: 'Email already in use.' });
    }
    console.error('profileUpd error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.settings = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub)
      .select('role settings.theme');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      success: true,
      settings: {
        isDev: user.role === 'dev',
        theme: user.settings?.theme ?? 'system'
      }
    });
  } catch (e) {
    console.error('settings error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.settingsUpd = async (req, res) => {
  try {
    const updates = {};
    const { isDev, theme } = req.body;

    // Validate and map theme
    if (theme !== undefined) {
      const allowed = ['light', 'dark', 'system'];
      if (!allowed.includes(String(theme))) {
        return res.status(400).json({ message: 'Invalid theme.' });
      }
      updates['settings.theme'] = theme;
    }

    // Map isDev -> role
    if (typeof isDev === 'boolean') {
      updates.role = isDev ? 'dev' : 'user';
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid settings to update.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('role settings.theme');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      settings: {
        isDev: user.role === 'dev',
        theme: user.settings?.theme ?? 'system'
      },
      token,
    });
  } catch (e) {
    console.error('settingsUpd error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }

    // Need password for comparison
    const user = await User.findById(req.user.sub).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const ok = await user.checkPassword(currentPassword);
    if (!ok) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Set new password; pre-save hook will hash it
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated.' });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { currentPassword, deleteAvatar = false } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required.' });
    }

    // Make sure password is selectable for check
    const user = await User.findById(req.user.sub).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const ok = await user.checkPassword(currentPassword);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect.' });

    // Remove this user from any game's developers list
    // (uses Game's own connection; safe without a transaction)
    await Game.updateMany(
      { developers: user._id },
      { $pull: { developers: user._id } }
    );

    // Optional avatar cleanup
    if (deleteAvatar && user.avatarUrl) {
      try {
        // await deleteAvatarIfExternal(user.avatarUrl);
      } catch (e) {
        console.error('Avatar cleanup failed:', e);
      }
    }

    // Finally delete the user
    await User.deleteOne({ _id: user._id });

    return res.status(200).json({ success: true, message: 'Account deleted and references cleaned up.' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const userId = req.user.sub;
    const relPath = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatarUrl: relPath } },
      { new: true, runValidators: true }
    ).select('firstName lastName username email avatarUrl bio role');

    if (!user) {
      // clean up the file if user not found
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('uploadAvatar error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ───────────────────────────────────────────────────────────
// Public user search + public profile + public games
// ───────────────────────────────────────────────────────────

/**
 * GET /api/user/search?query=kev
 * Returns a list of public user info (excluding the current user).
 */
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(200).json({ success: true, users: [] });
    }

    const q = query.toLowerCase().trim();
    const currentUserId = req.user.sub;

    // Basic regex search on username (case-insensitive)
    const rawUsers = await User.find({
      username: { $regex: q, $options: 'i' },
      _id: { $ne: currentUserId }, // exclude self
    })
      .select('username firstName lastName avatarUrl role userID createdAt')
      .lean();

    // Prioritize "starts with" matches, then "contains"
    const startsWith = [];
    const contains = [];

    for (const u of rawUsers) {
      const uname = (u.username || '').toLowerCase();
      if (uname.startsWith(q)) startsWith.push(u);
      else contains.push(u);
    }

    const merged = [...startsWith, ...contains];

    return res.status(200).json({
      success: true,
      users: merged,
    });
  } catch (err) {
    console.error('searchUsers error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /api/user/:username/public
 * Returns public profile info for a given username.
 * Blocks viewing your *own* profile this way.
 */
exports.publicProfileByUsername = async (req, res) => {
  try {
    const paramUsername = String(req.params.username || '').toLowerCase().trim();
    if (!paramUsername) {
      return res.status(400).json({ message: 'Username is required.' });
    }

    // Prevent users from viewing *their own* profile via this route
    const currentUsername = String(req.user.username || '').toLowerCase();
    if (paramUsername === currentUsername) {
      return res.status(403).json({
        message: 'Use /api/user/profile for your own profile.',
        reason: 'SELF_PROFILE',
      });
    }

    const user = await User.findOne({ username: paramUsername })
      .select('username firstName lastName avatarUrl bio role userID createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('publicProfileByUsername error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /api/user/:username/games
 * Returns a populated game list for the given username.
 * Blocks viewing your *own* games this way.
 *
 * This reuses the aggregation approach from viewUserGames,
 * but uses the target user's embedded userGames instead of req.user.
 */
exports.publicUserGamesByUsername = async (req, res) => {
  try {
    const paramUsername = String(req.params.username || '').toLowerCase().trim();
    if (!paramUsername) {
      return res.status(400).json({ message: 'Username is required.' });
    }

    const currentUsername = String(req.user.username || '').toLowerCase();
    if (paramUsername === currentUsername) {
      return res.status(403).json({
        message: 'Use /api/user/games for your own games.',
        reason: 'SELF_PROFILE_GAMES',
      });
    }

    const user = await User.findOne({ username: paramUsername })
      .select('username userGames')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userGames = Array.isArray(user.userGames) ? user.userGames : [];
    if (userGames.length === 0) {
      return res.status(200).json({
        success: true,
        username: user.username,
        games: [],
      });
    }

    const userGamesMap = new Map(userGames.map((g) => [g.id, g]));
    const gameIds = Array.from(userGamesMap.keys());

    if (gameIds.length === 0) {
      return res.status(200).json({
        success: true,
        username: user.username,
        games: [],
      });
    }

    // Reuse the aggregation pattern from viewUserGames
    const pipeline = [
      { $match: { id: { $in: gameIds } } },
      {
        $lookup: {
          from: 'covers',
          localField: 'cover',
          foreignField: 'id',
          as: 'coverObject',
        },
      },
      {
        $lookup: {
          from: 'artworks',
          localField: 'artworks',
          foreignField: 'id',
          as: 'artworkObjects',
        },
      },
      {
        $addFields: {
          coverUrl: {
            $let: {
              vars: { coverDoc: { $arrayElemAt: ['$coverObject', 0] } },
              in: {
                $cond: [
                  '$$coverDoc',
                  {
                    $concat: [
                      'https://images.igdb.com/igdb/image/upload/t_cover_small/',
                      '$$coverDoc.image_id',
                      '.jpg',
                    ],
                  },
                  null,
                ],
              },
            },
          },
          bannerUrl: {
            $let: {
              vars: { artDoc: { $arrayElemAt: ['$artworkObjects', 0] } },
              in: {
                $cond: {
                  if: '$$artDoc',
                  then: {
                    $concat: [
                      'https:',
                      {
                        $replaceOne: {
                          input: '$$artDoc.url',
                          find: 't_thumb',
                          replacement: 't_1080p',
                        },
                      },
                    ],
                  },
                  else: null,
                },
              },
            },
          },
        },
      },
      {
        $project: {
          coverObject: 0,
          artworkObjects: 0,
          cover: 0,
          artworks: 0,
        },
      },
    ];

    const detailedGames = await Game.aggregate(pipeline);

    const populatedGames = detailedGames.map((g) => {
      const uGame = userGamesMap.get(g.id) || {};
      return {
        ...g,
        status: uGame.status,
        userRating: uGame.userRating,
        isLiked: uGame.isLiked,
        review: uGame.review,
      };
    });

    return res.status(200).json({
      success: true,
      username: user.username,
      games: populatedGames,
    });
  } catch (err) {
    console.error('publicUserGamesByUsername error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};
