const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Get all transactions
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const { category, type } = req.query;
        const user = await User.findById(req.user.id);
        const categories = user.categories;

        let filter = { userId: req.user.id };

        if (category) {
            filter.category = category;
        }

        if (type) {
            filter.type = type;
        }

        const transactions = await Transaction.find(filter);

        res.render('transactions', { 
            message: null, 
            transactions, 
            categories,
            categoryMessage: null,
            selectedType: type
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

// Add transaction
router.post('/addTransactions', authenticateJWT, async (req, res) => {
    try {
        const { name, amount, category, type } = req.body;

        const newTransaction = new Transaction({
            userId: req.user.id,
            name,
            amount,
            category,
            type,
        });

        await newTransaction.save();
        res.redirect('/transactions');
    } catch (err) {
        res.status(500).json({ error: 'Error creating transaction' });
    }
});

// Add category
router.post('/addCategory', authenticateJWT, async (req, res) => {
    try {
        const { categoryName } = req.body;

        const user = await User.findById(req.user.id);

        const newCategory = {
            userId: req.user.id,
            name: categoryName,
            isDefault: false
        };

        const updateResult = await User.updateOne(
            { _id: req.user.id },
            { $addToSet: { categories: newCategory } }
        );

        if (updateResult.nModified === 0) {
            return res.render('transactions', {
                message: null,
                transactions: await Transaction.find({ userId: req.user.id }),
                categories: user.categories,
                categoryMessage: 'Category already exists'
            });
        }

        res.redirect('/transactions');
    } catch (err) {
        res.status(500).json({ error: 'Error adding category' });
    }
});

// Delete transaction
router.post('/deleteTransaction', authenticateJWT, async (req, res) => {
    try {
        const { transactionId } = req.body;
        await Transaction.findByIdAndDelete(transactionId);
        res.redirect('/transactions');
    } catch (err) {
        return res.render('transaction', { message: 'Error deleting transaction' });
    }
});

// Update transaction
router.post('/updateTransaction', authenticateJWT, async (req, res) => {
    try {
        const { transactionId, name, amount, category, type } = req.body;
        await Transaction.findByIdAndUpdate(transactionId, { name, amount, category, type });
        res.redirect('/transactions');
    } catch (err) {
        return res.render('transaction', { message: 'Error updating transaction' });
    }
});


module.exports = router;