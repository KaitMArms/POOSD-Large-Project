const User = require('../models/Users');
const Game = require('../models/Games'); 
const GameCounter = require('../models/GameCounter'); 

async function getNextGameId() {
  const doc = await GameCounter.findOneAndUpdate(
    { _id: 'gameId' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return doc.sequence;
}

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

exports.addGame = async (req, res) => {
  try {
    if (req.user?.role !== 'dev') {
      return res.status(403).json({ error: 'Only devs can add games' });
    }

    let { id, name, developersUsernames = [] } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    name = String(name).trim();

    // allocate internal numeric id if client didn't provide one
    let numericId = (typeof id === 'number') ? id : await getNextGameId();
    if (!Number.isFinite(numericId)) {
      return res.status(500).json({ error: 'Could not allocate game id' });
    }

    // resolve developers list
    let devs = [];
    if (developersUsernames.length) {
      const usernames = developersUsernames.map(u => String(u).toLowerCase());
      devs = await User.find({ username: { $in: usernames }, role: 'dev' }, '_id username');
      if (devs.length !== usernames.length) {
        const found = new Set(devs.map(d => d.username));
        const missing = usernames.filter(u => !found.has(u));
        return res.status(400).json({ error: `Unknown or non-developer usernames: ${missing.join(', ')}` });
      }
    } else {
      // default to the caller; IMPORTANT: use req.user.sub, then fetch _id
      const me = await User.findById(req.user.sub).select('_id username role');
      if (!me || me.role !== 'dev') return res.status(403).json({ error: 'Only devs can add games' });
      devs = [me];
    }

    // guard against null ids sneaking in
    const devIds = devs.map(d => d._id).filter(Boolean);

    const game = await Game.findOneAndUpdate(
      { id: numericId },
      {
        $setOnInsert: { id: numericId, createdBy: req.user.sub },
        $set: { name }, // allow name updates on re-run
        $addToSet: { developers: { $each: devIds } },
      },
      { upsert: true, new: true }
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