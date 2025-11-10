const mongoose = require('mongoose');
const { UserModel: User } = require('../db');
const { GameModel: Game } = require('../db');
const GameCounter = require('../models/GameCounter');

async function getNextDevGameId() {
  const doc = await GameCounter.findOneAndUpdate(
    { _id: 'devGameId' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  if (doc.sequence < 1000000000) {
    const fixed = await GameCounter.findOneAndUpdate(
      { _id: 'devGameId' },
      { $set: { sequence: 1000000000 } },
      { new: true }
    );
    return fixed.sequence;
  }
  return doc.sequence;
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseRequiredNumArray(fieldName, value) {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be a non-empty array of numbers`);
  }
  const arr = value.map(Number).filter(n => Number.isFinite(n));
  if (arr.length === 0) {
    throw new Error(`${fieldName} must be a non-empty array of numbers`);
  }
  return arr;
}

// Accept either unix seconds as a number OR an ISO date string and convert.
function parseFirstReleaseDate(val) {
  if (typeof val === 'number') {
    if (!Number.isFinite(val) || val < 0) throw new Error('first_release_date must be a non-negative number (unix seconds)');
    return Math.floor(val);
  }
  if (typeof val === 'string') {
    const t = Date.parse(val);
    if (!Number.isFinite(t)) throw new Error('first_release_date string must be a valid ISO date');
    return Math.floor(t / 1000); // to unix seconds
  }
  throw new Error('first_release_date is required (number unix seconds or ISO date string)');
}

/**
 * GET /dev/games/view
 * Returns ONLY the caller's dev games (isDev: true, developers includes caller).
 * Optional name filter; supports limit/skip.
 */
exports.viewGames = async (req, res) => {
  try {
    const callerSub = req.user?.sub;
    if (!callerSub) return res.status(401).json({ error: 'Unauthorized' });

    const { name, limit = 20, skip = 0 } = req.query;
    const q = {
      isDev: true,
      developers: new mongoose.Types.ObjectId(callerSub),
      ...(name ? { name: new RegExp(String(name), 'i') } : {})
    };

    const lim = Math.min(Number(limit) || 20, 100);
    const skp = Number(skip) || 0;

    const [games, total] = await Promise.all([
      Game.find(q).sort({ updatedAt: -1 }).skip(skp).limit(lim),
      Game.countDocuments(q),
    ]);

    return res.status(200).json({ total, count: games.length, skip: skp, limit: lim, games });
  } catch (e) {
    console.error('Database Search Error:', e);
    return res.status(500).json({ error: e.toString() });
  }
};

exports.addGame = async (req, res) => {
  try {
    const callerId = req.user?.sub;
    if (!callerId) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'dev') return res.status(403).json({ error: 'Only devs can add games' });

    let {
      id,                       // optional; must be >= 1_000_000_000 if provided
      name,                     // REQUIRED (string)
      summary,                  // REQUIRED (string)
      first_release_date,       // REQUIRED (number unix seconds OR ISO string)
      platforms,                // REQUIRED (non-empty array of numbers)
      genres,                   // REQUIRED (non-empty array of numbers)
      slug,                     // optional (auto from name if omitted)
      cover,                    // optional (number)
      developersUsernames = []  // optional extra devs
    } = req.body;

    // --- Required fields ---
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    name = String(name).trim();

    if (!summary || !String(summary).trim()) {
      return res.status(400).json({ error: 'summary is required' });
    }
    summary = String(summary).trim();
    if (summary.length > 2000) {
      return res.status(400).json({ error: 'summary must be ≤ 2000 characters' });
    }

    let firstRelease;
    try {
      firstRelease = parseFirstReleaseDate(first_release_date);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    let platformsArr, genresArr;
    try {
      platformsArr = parseRequiredNumArray('platforms', platforms);
      genresArr    = parseRequiredNumArray('genres', genres);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    // slug: auto-generate if absent
    slug = slug && String(slug).trim() ? String(slug).trim() : slugify(name);

    // optional: cover
    let coverId = undefined;
    if (cover !== undefined) {
      const c = Number(cover);
      if (!Number.isFinite(c) || c < 0) {
        return res.status(400).json({ error: 'cover must be a non-negative number' });
      }
      coverId = c;
    }

    // --- Dev ID policy (≥ 1_000_000_000) ---
    let numericId;
    if (typeof id === 'number') {
      if (id < 1000000000) {
        return res.status(400).json({ error: 'Dev game id must be >= 1000000000' });
      }
      numericId = id;
    } else {
      numericId = await getNextDevGameId();
    }

    // --- Resolve developers (always include caller) ---
    const callerObjId = new mongoose.Types.ObjectId(callerId);
    let devIds = [callerObjId];

    if (Array.isArray(developersUsernames) && developersUsernames.length) {
      const usernames = developersUsernames.map(u => String(u).toLowerCase());
      const devs = await User.find(
        { username: { $in: usernames }, role: 'dev' },
        '_id username'
      );
      if (devs.length !== usernames.length) {
        const found = new Set(devs.map(d => d.username));
        const missing = usernames.filter(u => !found.has(u));
        return res.status(400).json({ error: `Unknown or non-developer usernames: ${missing.join(', ')}` });
      }
      devIds.push(...devs.map(d => d._id));
    }
    devIds = Array.from(new Set(devIds.map(id => String(id)))).map(id => new mongoose.Types.ObjectId(id));

    // --- Upsert into global GamesDB ---
    const setPayload = {
      name,
      slug,
      summary,
      first_release_date: firstRelease,
      platforms: platformsArr,
      genres: genresArr
    };
    if (coverId !== undefined) setPayload.cover = coverId;

    const game = await Game.findOneAndUpdate(
      { id: numericId },
      {
        $setOnInsert: { id: numericId, isDev: true },
        $set: setPayload,
        $addToSet: { developers: { $each: devIds } },
      },
      { upsert: true, new: true }
    );

    // --- Mirror into caller's userGames ---
    await User.findByIdAndUpdate(
      callerId,
      {
        $addToSet: {
          userGames: {
            id: numericId,
            name,
            status: 'to-play',
            isLiked: false,
            isDeveloperGame: true,
          }
        }
      },
      { new: false }
    );

    return res.status(201).json({ message: 'Game upserted', game });
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'Game with that id already exists' });
    console.error('addGame error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
};

// PATCH /dev/games/:id   body: { name?, addDevelopersUsernames?:[], removeDevelopersUsernames?:[] }
exports.editGame = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Bad id' });

    const game = await Game.findOne({ id });
    if (!game) return res.status(404).json({ error: 'Game not found' });

    // Only listed developers can edit
    const callerObjId = new mongoose.Types.ObjectId(req.user.sub);
    if (!game.developers.some(d => d.equals(callerObjId))) {
      return res.status(403).json({ error: 'Not a developer of this game' });
    }

    const { name, addDevelopersUsernames = [], removeDevelopersUsernames = [] } = req.body;
    const update = {};
    if (name && name.trim() !== game.name.trim()) {
      update.name = name.trim();
      update.slug = slugify(name);
    }

    // Add/remove developers (role=dev enforced)
    if (addDevelopersUsernames.length || removeDevelopersUsernames.length) {
      const toAdd = addDevelopersUsernames.length
        ? await User.find({ username: { $in: addDevelopersUsernames.map(s => s.toLowerCase()) }, role: 'dev' }, '_id')
        : [];
      const toRemove = removeDevelopersUsernames.length
        ? await User.find({ username: { $in: removeDevelopersUsernames.map(s => s.toLowerCase()) }, role: 'dev' }, '_id')
        : [];

      if (toAdd.length)   update.$addToSet = { developers: { $each: toAdd.map(u => u._id) } };
      if (toRemove.length) update.$pull    = { developers: { $in: toRemove.map(u => u._id) } };
    }

    const updated = await Game.findOneAndUpdate({ id }, update, { new: true });
    return res.status(200).json({ message: 'Game updated', game: updated });
  } catch (e) {
    console.error('Edit Game Error:', e);
    return res.status(500).json({ error: e.toString() });
  }
};

// DELETE /dev/games/:id
exports.deleteGame = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Bad id' });

    const game = await Game.findOne({ id });
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const callerObjId = new mongoose.Types.ObjectId(req.user.sub);
    if (!game.developers.some(d => d.equals(callerObjId))) {
      return res.status(403).json({ error: 'Not a developer of this game' });
    }

    await game.deleteOne();

    // Also remove from all users' userGames
    await User.updateMany(
      { 'userGames.id': id },
      { $pull: { userGames: { id } } }
    );

    return res.status(200).json({ message: 'Game deleted' });
  } catch (e) {
    console.error('Database Deletion Error:', e);
    return res.status(500).json({ error: e.toString() });
  }
};

/**
 * GET /dev/games/search?name=foo&limit=20&skip=0
 * Requires 'name' (non-empty). Searches ONLY within caller's dev games.
 */
exports.search = async (req, res) => {
  try {
    const callerSub = req.user?.sub;
    if (!callerSub) return res.status(401).json({ error: 'Unauthorized' });

    const { name, limit = 20, skip = 0 } = req.query;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const regex = new RegExp(String(name).trim(), 'i');
    const q = {
      isDev: true,
      developers: new mongoose.Types.ObjectId(callerSub),
      name: regex
    };

    const lim = Math.min(Number(limit) || 20, 100);
    const skp = Number(skip) || 0;

    const [games, total] = await Promise.all([
      Game.find(q).sort({ updatedAt: -1 }).skip(skp).limit(lim),
      Game.countDocuments(q),
    ]);

    return res.status(200).json({ total, count: games.length, skip: skp, limit: lim, games });
  } catch (e) {
    console.error('Dev search error:', e);
    return res.status(500).json({ error: e.toString() });
  }
};
