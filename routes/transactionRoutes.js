const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Get all transactions
router.get('/', authenticateJWT, async (req, res, next) => {
    try {
        const { category, type, page = 1, limit = 5 } = req.query;
        const user = await User.findById(req.user.id);
        const categories = user.categories;

        let filter = { userId: req.user.id };

        if (category) filter.category = category;
        if (type) filter.type = type;

        const totalTransactions = await Transaction.countDocuments(filter);
        const totalPages = Math.ceil(totalTransactions / limit);
        const transactions = await Transaction.find(filter)
            .sort({createdAt: -1}) 
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.render('transactions', { 
            message: null, 
            transactions, 
            categories,
            selectedType: type,
            currentPage: parseInt(page),
            totalPages
        });
    } catch (err) {
        next(err);    
    }
});


// Add transaction
router.post('/addTransactions', authenticateJWT, async (req, res, next) => {
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
        next(err);    
    }
});

// Delete transaction
router.post('/deleteTransaction', authenticateJWT, async (req, res, next) => {
    try {
        const { transactionId } = req.body;
        await Transaction.findByIdAndDelete(transactionId);
        res.redirect('/transactions');
    } catch (err) {
        next(err);    
    }
});

// Update transaction
router.post('/updateTransaction', authenticateJWT, async (req, res, next) => {
    try {
        const { transactionId, name, amount, category, type } = req.body;
        await Transaction.findByIdAndUpdate(transactionId, { name, amount, category, type });
        res.redirect('/transactions');
    } catch (err) {
        next(err);    
    }
});

// Add category
router.post('/addCategory', authenticateJWT, async (req, res, next) => {
    try {
        const { categoryName } = req.body;
        const user = await User.findById(req.user.id);

        const existingCategory = user.categories.find(category => category.name.toLowerCase() === categoryName.toLowerCase());

        if (existingCategory) {
            return res.json({ success: false, message: 'Category already exists' });
        }
        
        const newCategory = {
            userId: req.user.id,
            name: categoryName,
            isDefault: false
        };

        user.categories.push(newCategory);
        await user.save();

        res.json({ success: true });
    } catch (err) {
        next(err);    
    }
});

// Update category
router.post('/updateCategory', authenticateJWT, async (req, res, next) => {
    try {
        const { categoryId, categoryName } = req.body;

        const user = await User.findById(req.user.id);

        const category = user.categories.id(categoryId);

        if (!category) {
            return res.json({ success: false, message: 'Category not found' });
        }

        if (category.isDefault) {
            return res.json({ success: false, message: 'Default categories cannot be updated' });
        }

        category.name = categoryName;
        await user.save();

        res.json({ success: true, message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        next(err);    
    }
});

// Delete category
router.post('/deleteCategory', authenticateJWT, async (req, res, next) => {
    try {
        const { categoryId } = req.body;
        const user = await User.findById(req.user.id);
        const category = user.categories.id(categoryId);

        if (!category) {
            return res.json({ success: false, message: 'Category not found' });
        }

        if (category.isDefault) {
            return res.json({ success: false, message: 'Default categories cannot be deleted' });
        }

        user.categories.pull({ _id: categoryId });
        await user.save();

        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        next(err);    
    }
});

module.exports = router;