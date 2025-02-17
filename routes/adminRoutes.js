const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const { authenticateJWT, verifyRole } = require('../middleware/authMiddleware');


router.get('/', authenticateJWT, verifyRole, async (req, res) => {
    const users = await User.find({});

    const usersCountAggregate = await User.aggregate([
        { $count: "count" }
    ]);
    const usersCount = usersCountAggregate[0].count;

    const transactionsCountAggregate = await Transaction.aggregate([
        { $count: "count" }
    ]);
    const transactionsCount = transactionsCountAggregate[0].count;

    const goalsCountAggregate = await Goal.aggregate([
        { $count: "count" }
    ]);
    const goalsCount = goalsCountAggregate[0].count;

    res.render('admin', { users, usersCount, transactionsCount, goalsCount, message: null });
});

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
