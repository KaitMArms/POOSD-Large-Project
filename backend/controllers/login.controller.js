const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const JWT_EXPIRES = '1d';


function signToken(user) {
  const payload = {
    sub: user._id.toString(),
    uid: user.userID,
    email: user.email,
    role: user.role // 'user' or 'dev'
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
}


exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const user = await User.create({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: String(email).toLowerCase().trim(),
      password
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const ok = await user.checkPassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = signToken(user);
    return res.status(200).json({ token, user: user.toJSON() });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};


// Secure change password (auth required)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }

    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const ok = await user.checkPassword(currentPassword);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect.' });

    await User.findOneAndUpdate(
      { _id: req.user.sub },
      { $set: { password: newPassword } }, 
      { new: true, runValidators: true, context: 'query' }
    );

    return res.status(200).json({ message: 'Password updated.' });
  } catch (err) {
    console.error('ChangePassword error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};