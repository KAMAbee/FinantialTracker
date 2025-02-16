const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { authenticateJWT, verifyRole } = require('../middleware/authMiddleware');


router.get('/', authenticateJWT, verifyRole, (req, res) => {
    res.render('admin', { message: null });
});

module.exports = router;
