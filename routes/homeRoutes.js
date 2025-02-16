const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/', authenticateJWT, async (req, res) => {
    try {
        res.render('home', { message: null }); 
    } catch (err) {
        res.status(500).json({ error: 'Error rendering Homepage' });
    }
});

module.exports = router;