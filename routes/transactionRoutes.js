const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/', authenticateJWT, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id });
        res.render('transactions', { message: null, transactions });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

router.post('/addTransactions', authenticateJWT, async (req, res) => {
    try {
        const { name, amount, category, type } = req.body;

        const newTransaction = new Transaction({
            userId: req.user.id, name, amount, category, type
        });

        await newTransaction.save();
        res.redirect('/transactions')
    } catch (err) {
        res.status(500).json({ error: 'Error creating transaction' });
    }
});

module.exports = router;