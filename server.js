const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
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

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

// Server creation
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
