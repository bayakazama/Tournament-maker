const express = require('express');
const router = express.Router();
const Tournament = require('../../models/tournament.model');
const bracketsService = require('../../services/brackets.service');

// Middleware to check if user is authenticated
const isAuth = (req, res, next) => {
    if (req.user) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// Generate tournament bracket
router.post('/:id/generate-bracket', isAuth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('participants.userId', 'username');
            
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check if user is tournament creator
        if (tournament.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check participants
        if (tournament.participants.length < 2) {
            return res.status(400).json({ message: 'Not enough participants' });
        }

        // Generate bracket using brackets-manager
        const bracketData = await bracketsService.createTournamentStage(tournament);
        
        // Update tournament status
        tournament.status = 'active';
        await tournament.save();

        res.json(bracketData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update match result
router.patch('/:id/matches/:matchId/result', isAuth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        const { player1Score, player2Score } = req.body;
        
        // Update match using brackets-manager
        const updatedData = await bracketsService.updateMatchResult(
            tournament._id,
            req.params.matchId,
            player1Score,
            player2Score
        );

        // Check if tournament is completed
        const stage = updatedData.stage;
        if (stage.state === 'completed') {
            tournament.status = 'completed';
            tournament.endDate = new Date();
            await tournament.save();
        }

        res.json(updatedData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get bracket state
router.get('/:id/bracket', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Get bracket data from the service
        const bracketData = await bracketsService.getStageData(tournament._id);
        res.json(bracketData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
