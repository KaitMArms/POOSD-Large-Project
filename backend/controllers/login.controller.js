const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const OTP = require('../middleware/generateOTP');
const generateOTP = require('../middleware/generateOTP');

const JWT_EXPIRES = '1d';


function signToken(user) {
    const payload = {
        sub: user._id.toString(),
        uid: user.userID,
        email: user.email,
        username: user.username,
        role: user.role // 'user' or 'dev'
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
}


exports.register = async(req, res) => {
    try {
        const { firstName, lastName, email, username, password } = req.body;
        if (!firstName || !lastName || !email || !password || !username) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const [emailTaken, usernameTaken] = await Promise.all([
            User.exists({ email: String(email).toLowerCase().trim() }),
            User.exists({ username: String(username).toLowerCase().trim() })
        ]);
        if (emailTaken) return res.status(409).json({ message: 'Email already in use.' });
        if (usernameTaken) return res.status(409).json({ message: 'Username already taken.' });

        /*
        Martin - Verify OTP before or after creating user.
        Verifying after creating requires deleting user if authentication could not be established.
        Otherwise, continue as normal.
        */

        const otp = generateOTP();
        //                                Miliseconds  Seconds  Minutes   => Lasts 5 minutes
        const otpExpiresIn = Date.now() * 1000 * 60 * 5;
        // Generate and send email to email received with code to email address


        const user = await User.create({
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email: String(email).toLowerCase().trim(),
            username: String(username).toLowerCase().trim(),
            password
        });
        res.status(201).json({ message: 'Registration successful. Please log in.' });
    } catch (err) {
        if (err ? .code === 11000) {
            if (err.keyPattern ? .email) return res.status(409).json({ message: 'Email already in use.' });
            if (err.keyPattern ? .username) return res.status(409).json({ message: 'Username already taken.' });
        }
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

exports.login = async(req, res) => {
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
exports.changePassword = async(req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required.' });
        }

        const user = await User.findById(req.user.sub);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const ok = await user.checkPassword(currentPassword);
        if (!ok) return res.status(401).json({ message: 'Current password is incorrect.' });

        await User.findOneAndUpdate({ _id: req.user.sub }, { $set: { password: newPassword } }, { new: true, runValidators: true, context: 'query' });

        return res.status(200).json({ message: 'Password updated.' });
    } catch (err) {
        console.error('ChangePassword error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

exports.logout = async(req, res) => {

    // Set user parameters to null
    user._id = null;
    user.userID = null;
    user.email = null;
    user.role = null;

    // Invalidate the token


}