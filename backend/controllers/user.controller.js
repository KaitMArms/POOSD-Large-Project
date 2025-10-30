
const User = require('../models/Users');

exports.profile = async (req, res) => {
    try {
        const userID = req.user.sub;
        const user = await User.findById(userID).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
    }
    const response = { success: true, user };
    
    if (req.user.role === 'dev') {
      const games = await Game.find({ createdBy: req.user.sub });
      response.devData = { games };
    }

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.profileUpd = async (req, res) => {};

exports.settings = async (req, res) => {};

exports.settingsUpd = async (req, res) => {};