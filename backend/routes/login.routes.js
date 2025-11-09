const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, resendOTP} = require('../controllers/login.controller');
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5,              // 5 requests per minute per IP
  message: 'Too many OTP requests from this IP, please try again later.'
});

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', otpLimiter, verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTP);

module.exports = router;