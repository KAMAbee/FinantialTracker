const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/', authenticateJWT, async (req, res) => {
    try {

        const result = await Transaction.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        let totalIncome = 0, totalExpense = 0;

        result.forEach(entry => {
            if (entry._id === "income") totalIncome = entry.total;
            if (entry._id === "expense") totalExpense = entry.total;
        });
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