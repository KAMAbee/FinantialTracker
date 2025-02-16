const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/', authenticateJWT, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id });

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        res.render('home', { 
            message: null,
            totalIncome,
            totalExpense
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Error rendering Homepage' });
    }
});


module.exports = router;