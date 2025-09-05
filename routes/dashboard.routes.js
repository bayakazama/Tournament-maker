const express = require('express');
const router = express.Router();

function isAuth(req, res, next) {
    if (req.user) {
        return next();
    }
    res.redirect('api/auth');
}

router.get('/', isAuth, (req, res) => {
    res.render('dashboard', { user: req.user });
});

module.exports = router;