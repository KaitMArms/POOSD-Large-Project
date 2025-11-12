const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { UserModel: User } = require('../db');
const generateOTP = require('../middleware/generateOTP');
const { sendEmail } = require('../services/sendEmail');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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


exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;
    if (!firstName || !lastName || !email || !password || !username) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const normEmail = String(email).toLowerCase().trim();
    if (!EMAIL_RE.test(normEmail)) {
      return res.status(400).json({ message: 'Valid email is required.' });
    }

    const normUser  = String(username).toLowerCase().trim();

    const [emailTaken, usernameTaken] = await Promise.all([
      User.exists({ email: normEmail }),
      User.exists({ username: normUser }),
    ]);
    if (emailTaken)    return res.status(409).json({ message: 'Email already in use.' });
    if (usernameTaken) return res.status(409).json({ message: 'Username already taken.' });

    await User.create({
      firstName: String(firstName).trim(),
      lastName:  String(lastName).trim(),
      email:     normEmail,
      username:  normUser,
      password,
      emailVerified: false,    
    });

    return res.status(201).json({
      message: 'Account created. Please log in to verify your email.',
    });
  } catch (err) {
    if (err?.code === 11000) {
      if (err.keyPattern?.email)    return res.status(409).json({ message: 'Email already in use.' });
      if (err.keyPattern?.username) return res.status(409).json({ message: 'Username already taken.' });
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
    if (!EMAIL_RE.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Valid email is required.' });
    }

    const user = await User.findOne({ email: normalizedEmail })
      .select('+email +password emailVerified role username userID otpLastSentAt');

    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const ok = await user.checkPassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });
    
    // 🔒 Hard gate: never issue a token if not verified
    if (!user.emailVerified) {
      const now = Date.now();
      const cooldown = 30 * 1000;
      let resent = false, wait = 0;
    
      if (!user.otpLastSentAt || (now - user.otpLastSentAt.getTime()) >= cooldown) {
        const otp = generateOTP(6);
        const otpHash = await bcrypt.hash(otp, 10);
        const otpExpiresAt = new Date(now + 5 * 60 * 1000);
        await User.updateOne(
          { _id: user._id },
          { $set: { otpHash, otpExpiresAt, otpLastSentAt: new Date(now), otpAttempts: 0 } }
        );
        sendEmail({ to: user.email, subject: 'Your verification code',
          text: `Your code is ${otp}. It expires in 5 minutes.`,
          html: `<p>Your verification code is: <b>${otp}</b></p><p>This code expires in 5 minutes.</p>`
        }).catch(err => console.error('sendEmail error:', err));
        resent = true;
      } else {
        wait = Math.ceil((cooldown - (now - user.otpLastSentAt.getTime())) / 1000);
      }
    
      res.set('x-handler', 'auth-login-v2');
      return res.status(403).json({
        code: 'EMAIL_UNVERIFIED',
        message: 'Please verify your email to continue.',
        email: user.email,
        resent,
        resendWaitSec: wait
      });
    }
    
    // ✅ Verified → token
    res.set('x-handler', 'auth-login-v2');
    const token = signToken(user);
    return res.status(200).json({ token, user: user.toJSON() });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: 'Email and code are required.' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() })
      .select('+otpHash +otpExpiresAt otpAttempts emailVerified role username userID');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.otpAttempts >= 5) {
      return res.status(429).json({ message: 'Too many invalid attempts. Request a new code.' });
    }
    if (!user.otpHash || !user.otpExpiresAt)
      return res.status(400).json({ message: 'No active code. Please request a new one.' });
    if (Date.now() > new Date(user.otpExpiresAt).getTime())
      return res.status(400).json({ message: 'Code expired. Request a new one.' });

    const ok = await bcrypt.compare(String(code), user.otpHash);
    if (!ok) {
      await User.updateOne({ _id: user._id }, { $inc: { otpAttempts: 1 } });
      return res.status(401).json({ message: 'Invalid code.' });
    }

    user.emailVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    const token = signToken(user);
    return res.status(200).json({ success: true, message: 'Email verified.', token, user: user.toJSON() });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() })
      .select('_id email emailVerified otpLastSentAt');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified.' });

    const now = Date.now();
    const cooldown = 30 * 1000;
    if (user.otpLastSentAt && now - user.otpLastSentAt.getTime() < cooldown) {
      const wait = Math.ceil((cooldown - (now - user.otpLastSentAt.getTime())) / 1000);
      return res.status(429).json({ message: `Please wait ${wait}s before requesting another code.` });
    }

    const otp = generateOTP(6);
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(now + 5 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      $set: { otpHash, otpExpiresAt, otpLastSentAt: new Date(now), otpAttempts: 0 }
    });

    await sendEmail({
      to: user.email,
      subject: 'Your verification code',
      text: `Your code is ${otp}. It expires in 5 minutes.`,
      html: `<p>Your verification code is: <b>${otp}</b></p><p>This code expires in 5 minutes.</p>`
    });

    return res.status(200).json({ success: true, message: 'Code sent.' });
  } catch (err) {
    console.error('resendOtp error:', err);
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

exports.logout = async (_req, res) => {
  // Client should discard the JWT; server stays stateless.
  return res.status(200).json({ message: 'Logged out.' });
};
