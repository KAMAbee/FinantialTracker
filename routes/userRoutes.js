const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const session = require("express-session");
const nodemailer = require("nodemailer");
const router = express.Router();
const {
  registerValidation,
  loginValidation,
  updateUserValidation,
} = require("../middleware/validation");

const { authenticateJWT } = require("../middleware/authMiddleware");

// Check if user is Authenticated
const redirectIfAuthenticated = (req, res, next) => {
  if (req.cookies.token) {
    try {
      jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      return res.redirect("/profile");
    } catch (err) {
      res.clearCookie("token");
    }
  }
  next();
};

// Registration
router.get("/registration", redirectIfAuthenticated, (req, res, next) => {
  res.render("registration", { message: null });
});

router.post("/registration", async (req, res, next) => {
  const { error } = registerValidation(req.body);
  if (error)
    return res.render("registration", { message: error.details[0].message });
  try {
    const { username, email, password, repeatPassword } = req.body;
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.render("registration", {
          message: "User with this username already exists",
        });
      }
      if (existingUser.email === email) {
        return res.render("registration", {
          message: "User with this email already exists",
        });
      }
    }

    if (password !== repeatPassword) {
      return res.render("registration", { message: "Passwords are not same" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.addDefaultCategories();
    await newUser.save();

    res.redirect("/login");
  } catch (err) {
    next(err);
  }
});

// Login
router.get("/login", redirectIfAuthenticated, (req, res, next) => {
  res.render("login", { message: null });
});

router.post("/login", async (req, res, next) => {
  const { error } = loginValidation(req.body);
  if (error) return res.render("login", { message: error.details[0].message });

  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.render("login", { message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { message: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/home");
  } catch (err) {
    next(err);
  }
});

// Profile
router.get("/profile", authenticateJWT, (req, res, next) => {
  res.render("profile", { user: req.user, message: null });
});

// Profile update
router.post("/update_user", authenticateJWT, async (req, res, next) => {
  const { error } = updateUserValidation(req.body);
  if (error)
    return res.render("profile", {
      user: req.user,
      message: error.details[0].message,
    });
  try {
    const { username, email, password } = req.body;
    const userId = req.user.id;

    const existingUsername = await User.findOne({
      username,
      _id: { $ne: userId },
    });
    if (existingUsername) {
      return res.render("profile", {
        user: req.user,
        message: "User with this username already exists",
      });
    }

    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail) {
      return res.render("profile", {
        user: req.user,
        message: "User with this email already exists",
      });
    }

    const updateData = { username, email };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(userId, updateData, { new: true });

    res.redirect("/profile");
  } catch (err) {
    next(err);
  }
});

// Profile delete
router.post("/delete_user", authenticateJWT, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("token");
    res.redirect("/login");
  } catch (err) {
    next(err);
  }
});

// Log out
router.get("/logout", (req, res, next) => {
  res.clearCookie("token");
  res.redirect("/login");
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

// Reset Password
router.get("/reset", (req, res, next) => {
  res.render("reset", { message: null, messageType: null });
});

router.post("/reset", async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("reset", {
        message: "User not found",
        messageType: "error",
      });
    }

    let resetCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    const mailOptions = {
      from: "230047@astanait.edu.kz",
      to: email,
      subject: "Reset code",
      text: `Reset code: ${resetCode}`,
    };

    req.session.resetCode = resetCode;
    req.session.resetEmail = email;

    try {
      await transporter.sendMail(mailOptions);
      return res.render("reset", {
        message: `Reset code sent to ${email}`,
        messageType: "success",
      });
    } catch (err) {
      return res.render("reset", {
        message: "Error sending email",
        messageType: "error",
      });
    }
  } catch (err) {
    next(err);
  }
});

// Reset Code
router.post("/resetcode", async (req, res, next) => {
  try {
    const { resetcode } = req.body;

    if (!req.session.resetCode || resetcode != req.session.resetCode) {
      return res.render("reset", {
        message: "Invalid reset code",
        messageType: "error",
      });
    }
    req.session.resetCode = null;

    res.redirect("/newpassword");
  } catch (err) {
    next(err);
  }
});

// Reset Password
router.get("/newpassword", (req, res, next) => {
  if (!req.session.resetEmail) {
    return res.redirect("/reset");
  }
  res.render("newpassword", { message: null });
});

router.post("/newpassword", async (req, res, next) => {
  try {
    const { password, repeatPassword } = req.body;

    if (!req.session.resetEmail) {
      return res.redirect("/reset");
    }

    if (password !== repeatPassword) {
      return res.render("newpassword", { message: "Passwords are not same" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
      { email: req.session.resetEmail },
      { password: hashedPassword }
    );

    req.session.resetEmail = null;

    res.redirect("/login");
  } catch (err) {
    next(err);
  }
});

// All users in json
router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
