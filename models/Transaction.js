const mongoose = require('mongoose');
const moment = require('moment');

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    amount: Number,
    category: String,
    type: { type: String, enum: ['income', 'expense'] },
    createdAt: { type: Date, default: Date.now, get: (date) => moment(date).format('DD-MM-YYYY') },
});

TransactionSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('Transaction', TransactionSchema);