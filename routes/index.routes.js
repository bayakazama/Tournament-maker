const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

router.get('/login', passport.authenticate('discord'));

// simple route for testing
router.get('/callback', passport.authenticate('discord', { 
    failureRedirect: '/',
    successRedirect: '/dashboard',
}));

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
})




module.exports = router;