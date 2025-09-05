const express = require('express');
const router = express.Router();

router.use('/user', require('./api/user.routes'));
router.use('/tournaments', require('./api/tournament.routes'));
router.use('/tournaments', require('./api/bracket.routes')); // Add bracket routes

module.exports = router;