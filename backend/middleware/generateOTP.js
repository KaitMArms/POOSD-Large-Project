const crypto = require('crypto');

module.exports = function generateOTP(len = 6) {
  let otp = '';
  for (let i = 0; i < len; i++) {
    otp += crypto.randomInt(0, 10).toString(); // 0..9
  }
  return otp;
};
