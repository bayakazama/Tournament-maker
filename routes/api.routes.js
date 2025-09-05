const express = require('express');
const router = express.Router();

router.use('/user', require('./api/user.routes'));

module.exports = router;