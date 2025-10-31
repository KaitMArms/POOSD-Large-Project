const User = require('../models/Users');
const Game = require('../models/Game'); 
const mongoose = require('mongoose');
const BIO_MAX = 300; // schema maxlength

exports.profile = async (req, res) => {
  try {
    const userID = req.user.sub;
    const user = await User.findById(userID)
      .select('firstName lastName username email avatarUrl bio');

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

    return res.status(200).json({
      success: true,
      settings: {
        isDev: user.role === 'dev',
        theme: user.settings?.theme ?? 'system'
      }
    });
  } catch (e) {
    console.error('settingsUpd error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { currentPassword, deleteAvatar = false } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required.' });
    }

    // Load user (needs password hash available for compare)
    const user = await User.findById(req.user.sub).session(session);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const ok = await user.checkPassword(currentPassword);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect.' });

    // Start atomic transaction
    await session.withTransaction(async () => {
      const uid = user._id;

      // Delete all standalone resources owned by the user
      await Game.deleteMany({ createdBy: uid }, { session });

      // If we add more collections later, delete them here too:

      // Finally, delete the User
      await User.deleteOne({ _id: uid }, { session });
    });

    // Best-effort external cleanup after DB commit
    if (deleteAvatar && user.avatarUrl) {
      try {
        // await deleteAvatarIfExternal(user.avatarUrl); // optional helper for S3/Cloudinary
      } catch (e) {
        console.error('Avatar cleanup failed:', e);
      }
    }


    return res.status(200).json({ success: true, message: 'Account and related data deleted.' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    return res.status(500).json({ message: 'Server error.' });
  } finally {
    session.endSession();
  }
};
