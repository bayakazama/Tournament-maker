const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('./config/passport.strategies');
const session = require('express-session');
const path = require('path');

dotenv.config();
connectDB();

const app = express();
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}));

app.use(cors());
app.use(express.json());
app.use(passport.initialize()); // use passport middleware
app.use(passport.session()); // use passport session

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/dashboard", require("./routes/dashboard.routes")); // Dashboard route
app.use("/", require("./routes/index.routes")); 
app.use("/api", require("./routes/api.routes")); // API routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on this port: ${PORT}`));