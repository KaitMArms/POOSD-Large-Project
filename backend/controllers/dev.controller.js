// controllers/dev.controller.js
const User = require('../models/Users');
const Game = require('../models/Games'); // <-- FIX: this is the global games catalog (gameConnection)

// GET /dev/games?name=halo&limit=20&skip=0
exports.viewGames = async (req, res) => {
  try {
    const { name, limit = 20, skip = 0 } = req.query;
    const q = name ? { name: new RegExp(name, 'i') } : {};

    const [games, total] = await Promise.all([
      Game.find(q).sort({ updatedAt: -1 }).skip(Number(skip)).limit(Math.min(Number(limit), 100)),
      Game.countDocuments(q),
    ]);

    return res.status(200).json({ total, count: games.length, skip: Number(skip), limit: Number(limit), games });
  } catch (e) {
    console.error('Database Search Error:', e);
    return res.status(500).json({ error: e.toString() });
  }
};

// POST /dev/games  body: { id, name, developersUsernames?: [] }
exports.addGame = async (req, res) => {
  try {
    const { id, name, developersUsernames = [] } = req.body;
    if (typeof id !== 'number') return res.status(400).json({ error: 'id (IGDB Number) is required' });

    // Only devs can add
    if (req.user?.role !== 'dev') return res.status(403).json({ error: 'Only devs can add games' });

    // Resolve developer usernames -> user _ids (and ensure role === 'dev')
    const usernames = developersUsernames.map(u => String(u).toLowerCase());
    const devs = usernames.length
      ? await User.find({ username: { $in: usernames }, role: 'dev' }, '_id username role')
      : [ { _id: req.user._id, username: req.user.username, role: 'dev' } ];

    if (developersUsernames.length && devs.length !== usernames.length) {
      const found = new Set(devs.map(d => d.username));
      const missing = usernames.filter(u => !found.has(u));
      return res.status(400).json({ error: `Unknown or non-developer usernames: ${missing.join(', ')}` });
    }

    // Upsert by IGDB id; add developers with $addToSet
    const game = await Game.findOneAndUpdate(
      { id },
      {
        $setOnInsert: { id, name },
        $addToSet: { developers: { $each: devs.map(d => d._id) } },
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ message: 'Game upserted', game });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Game with that id already exists' });
    console.error('Database Insertion Error:', e);
    return res.status(500).json({ error: e.toString() });
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
    if (!game.developers.some(d => d.equals(req.user._id))) {
      return res.status(403).json({ error: 'Not a developer of this game' });
    }

    const { name, addDevelopersUsernames = [], removeDevelopersUsernames = [] } = req.body;
    const update = {};
    if (name) update.name = name;

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

    if (!game.developers.some(d => d.equals(req.user._id))) {
      return res.status(403).json({ error: 'Not a developer of this game' });
    }

    await game.deleteOne();
    return res.status(200).json({ message: 'Game deleted' });
  } catch (e) {
    console.error('Database Deletion Error:', e);
    return res.status(500).json({ error: e.toString() });
  }
};