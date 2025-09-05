const express = require('express');
const router = express.Router();
const Tournament = require('../models/tournament.model');


function isAuth(req, res, next) {
    if (req.user) {
        return next();
    }
    res.redirect('login');
}

// Brackets management dashboard
router.get('/brackets', isAuth, async (req, res) => {
    try {
        const tournaments = await Tournament.find()
            .populate('creator', 'username')
            .populate('participants.userId', 'username')
            .sort('-createdAt');

        res.render('brackets', {
            user: req.user,
            tournaments: tournaments
        });
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).send('Error loading brackets dashboard');
    }
});

// View specific tournament bracket
router.get('/tournaments/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('creator', 'username')
            .populate('participants.userId', 'username');

        if (!tournament) {
            return res.status(404).send('Tournament not found');
        }

        res.render('tournament', {
            user: req.user,
            tournament: tournament
        });
    } catch (error) {
        console.error('Error fetching tournament:', error);
        res.status(500).send('Error loading tournament');
    }
});

module.exports = router;
