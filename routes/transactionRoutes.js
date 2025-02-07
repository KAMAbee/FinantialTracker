const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

router.get('/transactions', isAuthenticated, (req, res) => {
    if (!req.session.resetEmail) {
        return res.redirect('/reset');
    }
    res.render('transactions', { message: null })
});

router.post('/transactions', isAuthenticated, async (req, res) => {
    try {
        const { name, amount, category, type } = req.body;

        const newTransaction = new Transaction({
            userId: req.session.user._id, name, amount, category, type
        });

        await newTransaction.save();
        res.redirect('/transactions')
    } catch (err) {
        res.status(500).json({ error: 'Error creating transaction' });
    }
});

// Authentification
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}
module.exports = router;