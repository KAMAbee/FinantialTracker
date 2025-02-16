const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Get all transactions and categories for the user with optional filters
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
            selectedCategory: category,
            selectedType: type
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

// Add a new transaction
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

// Add a new category to the user's account
router.post('/addCategory', authenticateJWT, async (req, res) => {
    try {
        const { categoryName } = req.body;

        if (!categoryName) {
            return res.render('transactions', {
                message: null,
                transactions: await Transaction.find({ userId: req.user.id }),
                categories: (await User.findById(req.user.id)).categories,
                categoryMessage: 'Category name is required'
            });
        }

        const user = await User.findById(req.user.id);
        
        const categoryExists = user.categories.some(category => category.name.toLowerCase() === categoryName.toLowerCase());
        if (categoryExists) {
            return res.render('transactions', {
                message: null,
                transactions: await Transaction.find({ userId: req.user.id }),
                categories: user.categories,
                categoryMessage: 'Category already exists'
            });
        }

        const newCategory = { 
            userId: req.user.id,
            name: categoryName,
            isDefault: false
        };

        user.categories.push(newCategory);
        await user.save();

        res.redirect('/transactions');
    } catch (err) {
        res.status(500).json({ error: 'Error adding category' });
    }
});

module.exports = router;