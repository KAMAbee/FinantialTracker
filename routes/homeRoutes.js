const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/', authenticateJWT, async (req, res) => {
    try {

        const incomeResult = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id), type: 'income' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        
        const expenseResult = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id), type: 'expense' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        
        const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
        const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
        

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