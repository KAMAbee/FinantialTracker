const mongoose = require('mongoose');
const moment = require('moment');

// Goals Schema
const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    description: String,
    goalAmount: Number,
    currentSaved: Number,
    deadline: { type: Date },
    createdAt: { type: Date, default: Date.now, get: (date) => moment(date).format('DD-MM-YYYY') },
});

goalSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('Goal', goalSchema);