const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT
function authenticateJWT(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('token');
        res.redirect('/login');
    }
}

// Middleware to verify user role
function verifyRole(req, res, next) {
    if (req.user.role !== "admin") {
        return res.redirect('/login');
    }
    next();
}

module.exports = { authenticateJWT, verifyRole };
