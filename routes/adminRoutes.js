const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const { authenticateJWT, verifyRole } = require('../middleware/authMiddleware');

// Get all users
router.get('/', authenticateJWT, verifyRole, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const users = await User.find({})
    .skip((page - 1) * limit)
    .limit(limit);

    // Get count of all users
    const usersCountAggregate = await User.aggregate([
        { $count: "count" }
    ]);
    const usersCount = usersCountAggregate[0].count;

    // Get count of all transactions
    const transactionsCountAggregate = await Transaction.aggregate([
        { $count: "count" }
    ]);
    const transactionsCount = transactionsCountAggregate[0].count;

    // Get count of income and expense transactions
    const incomeCountAggregate = await Transaction.aggregate([
        { $match: { type: 'income' } },
        { $count: "count" }
    ]);
    const expenseCountAggregate = await Transaction.aggregate([
        { $match: { type: 'expense' } },
        { $count: "count" }
    ]);

    const incomeCount = incomeCountAggregate.length > 0 ? incomeCountAggregate[0].count : 0;
    const expenseCount = expenseCountAggregate.length > 0 ? expenseCountAggregate[0].count : 0;


    // Get count of all goals
    const goalsCountAggregate = await Goal.aggregate([
        { $count: "count" },
    ]);
    const goalsCount = goalsCountAggregate[0].count;

    // Get count of transactions for each user
    const usersWithTransactionCount = await User.aggregate([
        {
            $lookup: {
                from: Transaction.collection.name,
                localField: "_id",
                foreignField: "userId",
                as: "transactions"
            }
        },
        {
            $addFields: {
                transactionsCount: { $size: "$transactions" }
            }
        },
        {
            $project: {
                transactionsCount: 1
            }
        }
    ]);

    const totalPages = Math.ceil(usersCount / limit);

    res.render('admin', {
        users,
        usersWithTransactionCount,
        usersCount,
        transactionsCount,
        incomeCount,
        expenseCount,
        goalsCount, 
        currentPage: page,
        totalPages,
        message: null
    });
});


// Update user role
router.post('/updateRole', authenticateJWT, verifyRole, async (req, res) => {
    try {
        const { userId, role } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.render('admin', { message: 'User not found' });
        }

        user.role = role;
        await user.save();
        res.redirect('/admin');
    } catch (err) {
        return res.render('admin', { message: 'Error updating role' });
    }
});

module.exports = router;
