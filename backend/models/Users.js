const mongoose  = require('mongoose');
const bycrypt    = require('bcryptjs');
const Counter   = require('./Counter');

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,    // ensures no two users have the same email
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true, 
        trim: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    userID: {
        type: Number,
        unique: true
    }
},{
    collection: 'game-users'
});


userSchema.pre('save', async function(next){
    const user = this;

    if (user.isModified('password')){
        try{
            const salt = await bycrypt.genSalt(SALT_WORK_FACTOR);
            user.password = await bycrypt.hash(user.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    
    if (user.isNew && !user.userID){
        try{
            const counter = await Counter.findByIdAndUpdate(
                  { _id: 'userID'},
                  { $inc: {sequence: 1}},
                  {new: true, upsert: true}
            );

            user.userID = counter.sequence;
        } catch (error) {
            next(error);
        }
    } 

    next();
});


module.exports = mongoose.model('User', userSchema);
