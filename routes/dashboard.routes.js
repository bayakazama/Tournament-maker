const express = require('express');
const router = express.Router();
const Tournament = require('../models/tournament.model');

function isAuth(req, res, next) {
    if (req.user) {
        return next();
    }
    res.redirect('login');
}

// Get dashboard with tournaments and statistics
router.get('/', isAuth, async (req, res) => {
    try {
        // Get user's tournaments
        const tournaments = await Tournament.find({
            $or: [
                { creator: req.user._id },
                { 'participants.userId': req.user._id }
            ]
        }).populate('creator', 'username')
          .populate('participants.userId', 'username')
          .sort('-createdAt');

        // Calculate statistics
        const stats = await calculateStats(req.user._id);

        res.render('dashboard', { 
            user: req.user,
            tournaments: tournaments,
            stats: stats
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error loading dashboard');
    }
});

// Calculate user's tournament statistics
async function calculateStats(userId) {
    try {
        // Get all tournaments where user is creator or participant
        const allTournaments = await Tournament.find({
            $or: [
                { creator: userId },
                { 'participants.userId': userId }
            ]
        });

        // Calculate statistics
        const stats = {
            totalTournaments: allTournaments.length,
            activeTournaments: allTournaments.filter(t => t.status === 'active').length,
            completedTournaments: allTournaments.filter(t => t.status === 'completed').length,
            totalParticipants: allTournaments.reduce((sum, t) => sum + t.participants.length, 0)
        };

        return stats;
    } catch (error) {
        console.error('Error calculating stats:', error);
        return {
            totalTournaments: 0,
            activeTournaments: 0,
            completedTournaments: 0,
            totalParticipants: 0
        };
    }
}

module.exports = router;