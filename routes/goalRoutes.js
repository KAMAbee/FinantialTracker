// Goal routes
const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Get all goals
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        res.render('goals', { message: null, goals });
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

        // Ensure that the amount to add is positive and doesn't exceed the goal amount
        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }

        goal.currentSaved += amount;

        if (goal.currentSaved > goal.goalAmount) {
            goal.currentSaved = goal.goalAmount; // Cap the amount to the goal amount
        }

        await goal.save();
        res.redirect('/goals');
    } catch (err) {
        res.status(500).json({ error: 'Error adding money to goal' });
    }
});

module.exports = router;