const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const session = require('express-session');
const nodemailer = require("nodemailer");

const router = express.Router();

// Authenticate Middleware
const authenticateJWT = (req, res, next) => {
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
};

// Check if user is Authenticated 
const redirectIfAuthenticated = (req, res, next) => {
    if (req.cookies.token) {
        try {
            jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            return res.redirect('/profile');
        } catch (err) {
            res.clearCookie('token');
        }
    }
    next();
};

// Registration
router.get('/registration', redirectIfAuthenticated, (req, res) => {
    res.render('registration', { message: null });
});

router.post('/registration', async (req, res) => {
    try {
        const { username, email, password, repeatPassword } = req.body;

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.render('registration', { message: 'User with this username is already exists' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.render('registration', { message: 'User with this email is already exists' });
        }

        if(password !== repeatPassword){
            return res.render('registration', { message: 'Passwords are not same' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.addDefaultCategories();
        await newUser.save();

        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Error creating user');
    }
});

// Login
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login', { message: null });
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.render('login', { message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { message: 'Incorrect password' });
        }

        const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/profile');
    } catch (err) {
        res.status(500).send('Login error');
    }
});

// Profile
router.get('/profile', authenticateJWT, (req, res) => {
    res.render('profile', { user: req.user, message: null });
});

// Profile update
router.post('/update_user', authenticateJWT, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = req.user.id;

        const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
        if (existingUsername) {
            return res.render('profile', { user: req.user, message: 'User with this username already exists' });
        }

        const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
        if (existingEmail) {
            return res.render('profile', { user: req.user, message: 'User with this email already exists' });
        }

        const updateData = { username, email };

        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await User.findByIdAndUpdate(userId, updateData, { new: true });

        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Update error');
    }
});

// Profile delete
router.post('/delete_user', authenticateJWT, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.clearCookie('token');
        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Delete error');
    }
});


// Log out
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

// Email sender
const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

router.get('/reset', (req, res) => {
    res.render('reset', { message: null, messageType: null });
});

router.post('/reset', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.render('reset', { message: 'User not found', messageType: 'error' });
        }

        let resetCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

        const mailOptions = {
            from: "230047@astanait.edu.kz",
            to: email,
            subject: "Reset code",
            text: `Reset code: ${resetCode}`,
        }

        req.session.resetCode = resetCode;
        req.session.resetEmail = email;

        try {
            await transporter.sendMail(mailOptions);
            return res.render('reset', { message: `Reset code sent to ${email}`, messageType: 'success' });
        } catch (err) {
            return res.render('reset', { message: 'Error sending email', messageType: 'error' });
        }
    } catch (err) {
        console.log(err)
        res.status(500).send('Error')
    }
});

router.post('/resetcode', async (req, res) => {
    try {
        const { resetcode } = req.body;

        if (!req.session.resetCode || resetcode != req.session.resetCode) {
            return res.render('reset', { message: 'Invalid reset code', messageType: 'error' });
        }
        req.session.resetCode = null

        res.redirect('/newpassword');
    } catch (err) {
        res.status(500).send('Error updating password')
    }
});

// Reset Password
router.get('/newpassword', (req, res) => {
    if (!req.session.resetEmail) {
        return res.redirect('/reset');
    }
    res.render('newpassword', { message: null })
});

router.post('/newpassword', async (req, res) => {
    try {
        const { password, repeatPassword } = req.body;

        if (!req.session.resetEmail) {
            return res.redirect('/reset');
        }

        if (password !== repeatPassword) {
            return res.render('newpassword', { message: 'Passwords are not same' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.updateOne({ email: req.session.resetEmail }, { password: hashedPassword });

        req.session.resetEmail = null;

        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Server error');
    }
});


// All users in json 
router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving users' });
    }
});

router.use((req, res) => {
    res.redirect('/profile');
});

module.exports = router;
