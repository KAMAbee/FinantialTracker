const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const session = require('express-session');
const nodemailer = require("nodemailer");

const router = express.Router();

// Registration
router.get('/registration', (req, res) => {
    if (req.session.user) {
        return res.redirect('/profile');
    }
    res.render('registration', { message: null });
});

router.post('/registration', async (req, res) => {
    try {
        const { username, email, password } = req.body;

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
        const newUser = new User({ username, email, password: hashedPassword});

        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Error creating user');
    }
});


// Login
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/profile');
    }
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

        req.session.user = user;
        res.redirect('/profile');
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});

// Profile page
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user, message: null });
});

// Update profile
router.post('/update_user', isAuthenticated, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userId = req.session.user._id;

        const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
        if (existingUsername) {
            return res.render('profile', { user: req.session.user, message: 'User with this username is already exists' });
        }

        const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
        if (existingEmail) {
            return res.render('profile', { user: req.session.user, message: 'User with this email is already exists' });
        }

        const updateData = { username, email };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        req.session.user = updatedUser;

        res.redirect('/profile');
    } catch (err) {
        res.status(500).send('Error updating profile')
    }
});

// Delete profile
router.post('/delete_user', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user._id;

        await User.findByIdAndDelete(userId);

        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Error deleting profile');
            }
            res.redirect('/login');
        });
    } catch (err) {
        res.status(500).send('Error deleting profile');
    }
});

// Authentification
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}


// Log out
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
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

// Send Verification code
router.get('/reset', (req, res) => {
    if (req.session.user) {
        return res.redirect('/profile');
    }
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

module.exports = router;
