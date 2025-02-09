const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/', authenticateJWT, async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        res.render('goals', { message: null, goals });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching goals' });
    }
});

router.post('/addGoal', authenticateJWT, async (req, res) => {
    try {
        const { name, description, goalAmount, deadline } = req.body;

        const newGoal = new Goal({
            userId: req.user.id, name, description, goalAmount, deadline
        });

        await newGoal.save();
        res.redirect('/goals')
    } catch (err) {
        res.status(500).json({ error: 'Error creating goal' });
    }
});

module.exports = router;