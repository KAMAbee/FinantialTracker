const mongoose = require('mongoose');
const moment = require('moment');

// User schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    createdAt: {
        type: Date,
        default: Date.now,
        get: (date) => moment(date).format('DD-MM-YYYY')
    }
});

userSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('User', userSchema);
