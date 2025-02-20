// Goal routes
const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Get all goals
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const userId = req.user.id;

        const totalGoals = await Goal.countDocuments({ userId });
        const totalPages = Math.ceil(totalGoals / limit);
        const goals = await Goal.find({ userId })
            .sort({deadline: 1})
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.render('goals', { 
            message: null, 
            goals, 
            currentPage: parseInt(page),
            totalPages
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching goals' });
    }
});

// Add a new goal
router.post('/addGoal', authenticateJWT, async (req, res) => {
    try {
        const { name, description, goalAmount, deadline } = req.body;

        const newGoal = new Goal({
            userId: req.user.id, 
            name, 
            description, 
            goalAmount, 
            deadline
        });

        await newGoal.save();
        res.redirect('/goals');
    } catch (err) {
        res.status(500).json({ error: 'Error creating goal' });
    }
});

// Add money to a goal
router.post('/addMoney', authenticateJWT, async (req, res) => {
    try {
        const { goalId, amount } = req.body;

        const goal = await Goal.findById(goalId);
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }

        goal.currentSaved += amount;

        if (goal.currentSaved > goal.goalAmount) {
            goal.currentSaved = goal.goalAmount;
        }

        await goal.save();
        res.redirect('/goals');
    } catch (err) {
        res.status(500).json({ error: 'Error adding money to goal' });
    }
});

// Delete goal
router.post('/deleteGoal', authenticateJWT, async (req, res) => {
    try {
        const { goalId } = req.body;
        await Goal.findByIdAndDelete(goalId);
        res.redirect('/goals');
    } catch (err) {
        res.status(500).json({ error: 'Error deleting goal' });
    }
});

// Update goal
router.post('/updateGoal', authenticateJWT, async (req, res) => {
    try {
        const { goalId, name, amount, description, deadline} = req.body;
        await Goal.findByIdAndUpdate(goalId, { name, amount, description, deadline });
        res.redirect('/goals');
    } catch (err) {
        res.status(500).json({ error: 'Error updating goal' });

    }
});

module.exports = router;