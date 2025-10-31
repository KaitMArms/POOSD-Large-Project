const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
require('./Counter');
const UserGameSchema = require('./UserGame'); 

const SALT_WORK_FACTOR = 10;

// Simple bcrypt-hash detector (to avoid double-hashing on updates)
const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  userID:    { type: Number, unique: true },
  role:      { type: String, enum: ['user', 'dev'], default: 'user' },
  userGames:[UserGameSchema]
}, {
  collection: 'game-users'
});

// Hide password in JSON responses
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});

// Instance method to verify passwords
userSchema.methods.checkPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// --------------------------
// Hash on create/save
// --------------------------
userSchema.pre('save', async function(next) {
  const user = this;

  if (user.isModified('password') && !BCRYPT_RE.test(user.password)) {
    try {
      const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
      user.password = await bcrypt.hash(user.password, salt);
    } catch (err) {
      return next(err);
    }
  }

  // Assign incremental userID once on create
  if (user.isNew && !user.userID) {
    try {
      const Counter = user.model('Counter');
      const counter = await Counter.findByIdAndUpdate(
        'userID',
        { $inc: { sequence: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      user.userID = counter.sequence;
    } catch (err) {
      return next(err);
    }
  }

  next();
});

// --------------------------
// Hash on updates too
// --------------------------
async function hashPasswordInUpdate(ctx) {
  const update = ctx.getUpdate() || {};

  // Support both direct set and $set
  const direct = update.password;
  const setObj = update.$set && update.$set.password;

  let newPassword = direct ?? setObj;
  if (!newPassword) return; // nothing to do

  if (!BCRYPT_RE.test(newPassword)) {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    newPassword = await bcrypt.hash(newPassword, salt);

    if (direct) update.password = newPassword;
    if (setObj) update.$set.password = newPassword;

    ctx.setUpdate(update);
  }
}

userSchema.pre('findOneAndUpdate', function () {
  this.setOptions({ runValidators: true, new: true, context: 'query' });
});

userSchema.pre('findOneAndUpdate', async function(next) {
  try {
    await hashPasswordInUpdate(this);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre('updateOne', async function(next) {
  try {
    await hashPasswordInUpdate(this);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
