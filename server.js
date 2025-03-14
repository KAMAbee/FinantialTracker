const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Joi = require('joi');
const errorHandler = require('./middleware/errorHandler');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connection to MongoDB
mongoose.connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Session configuration
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.URI,
        collectionName: 'sessions'
    }),
    cookie: { secure: false,  maxAge: 10 * 60 * 1000 }
}));

// Routes
const homeRoutes = require('./routes/homeRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const goalRoutes = require('./routes/goalRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/', userRoutes);
app.use('/home', homeRoutes);
app.use('/transactions', transactionRoutes);
app.use('/goals', goalRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
    res.redirect('/home');
});

app.use(errorHandler);

// Server creation
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
