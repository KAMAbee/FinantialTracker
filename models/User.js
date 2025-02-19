const mongoose = require('mongoose');
const moment = require('moment');

// Category Schema
const categorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
        get: (date) => moment(date).format('DD-MM-YYYY')
    },
    isDefault: { type: Boolean, default: false },
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: {
        type: Date,
        default: Date.now,
        get: (date) => moment(date).format('DD-MM-YYYY')
    },
    categories: [categorySchema],
});

// Standart category adder
userSchema.methods.addDefaultCategories = function () {
    const defaultCategories = [
        'Food', 'Transport', 'Entertainment', 'Health', 'Bills', 'Shopping'
    ];
    const categories = defaultCategories.map(name => ({
        userId: this._id,
        name,
        isDefault: true
    }));

    this.categories.push(...categories);
    return this.save();
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

categorySchema.index({ userId: 1, name: 1 }, { unique: true }); 

userSchema.set('toJSON', { getters: true });
categorySchema.set('toJSON', { getters: true });

module.exports = mongoose.model('User', userSchema);
