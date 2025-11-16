const bcrypt = require('bcrypt');
const User = require('../../models/User');
// Salt used on hashing
const SALT_WORK_FACTOR = 10;

// Functions creates a user.
// Will be used locally for testing
async function createTestUser({ email = 'juela575@gmail.com', password = 'COP4331' } = {}) {

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  const hashed = await bcrypt.hash(password, salt);
  const user = await User.create({ email, password: hashed });
  return user;
}

module.exports = createTestUser;
