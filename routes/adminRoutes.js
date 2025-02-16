const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { authenticateJWT, verifyRole } = require('../middleware/authMiddleware');


router.get('/', authenticateJWT, verifyRole, async (req, res) => {
    const users = await User.find({});
    
    res.render('admin', {users, message: null });
});

router.post('/updateRole', authenticateJWT, verifyRole, async (req, res) => {
    try {
        const { userId, role } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.role = role;
        await user.save();
        res.redirect('/admin');
    } catch (err) {
        res.status(500).json({ error: 'Error updating role' });
    }
});

module.exports = router;
