const express = require('express');
const router = express.Router();
const Tournament = require('../../models/tournament.model');

// Middleware to check if user is authenticated
const isAuth = (req, res, next) => {
    if (req.user) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// Get all tournaments
router.get('/', async (req, res) => {
    try {
        const tournaments = await Tournament.find()
            .populate('creator', 'username')
            .sort('-createdAt');
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single tournament
router.get('/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('creator', 'username')
            .populate('participants.userId', 'username');
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        res.json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create tournament
router.post('/', isAuth, async (req, res) => {
    try {
        const tournament = new Tournament({
            ...req.body,
            creator: req.user._id
        });
        const savedTournament = await tournament.save();
        res.status(201).json(savedTournament);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update tournament
router.put('/:id', isAuth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        if (tournament.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        Object.assign(tournament, req.body);
        const updatedTournament = await tournament.save();
        res.json(updatedTournament);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update match result
router.patch('/:id/matches/:matchId', isAuth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Find and update the specific match
        let matchFound = false;
        tournament.rounds.forEach(round => {
            round.matches.forEach(match => {
                if (match._id.toString() === req.params.matchId) {
                    Object.assign(match, req.body);
                    matchFound = true;
                }
            });
        });

        if (!matchFound) {
            return res.status(404).json({ message: 'Match not found' });
        }

        const updatedTournament = await tournament.save();
        res.json(updatedTournament);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete tournament
router.delete('/:id', isAuth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        if (tournament.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        await tournament.deleteOne();
        res.json({ message: 'Tournament deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add participant to tournament
router.post('/:id/participants', isAuth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check if tournament is full
        if (tournament.maxParticipants && tournament.participants.length >= tournament.maxParticipants) {
            return res.status(400).json({ message: 'Tournament is full' });
        }

        // Check if user is already a participant
        if (tournament.participants.some(p => p.userId.toString() === req.user._id.toString())) {
            return res.status(400).json({ message: 'Already participating in this tournament' });
        }

        // Add participant
        tournament.participants.push({
            userId: req.user._id,
            name: req.user.username,
            seed: tournament.participants.length + 1
        });

        const updatedTournament = await tournament.save();
        res.json(updatedTournament);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Remove participant from tournament
router.delete('/:id/participants/:userId', isAuth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check if user is authorized (creator or the participant themselves)
        if (tournament.creator.toString() !== req.user._id.toString() && 
            req.params.userId !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Remove participant
        tournament.participants = tournament.participants.filter(
            p => p.userId.toString() !== req.params.userId
        );

        // Update seeds
        tournament.participants.forEach((p, index) => {
            p.seed = index + 1;
        });

        const updatedTournament = await tournament.save();
        res.json(updatedTournament);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update participant seed
router.patch('/:id/participants/:userId/seed', isAuth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Only tournament creator can update seeds
        if (tournament.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { seed } = req.body;
        if (!seed || seed < 1 || seed > tournament.participants.length) {
            return res.status(400).json({ message: 'Invalid seed number' });
        }

        // Update participant's seed
        const participant = tournament.participants.find(
            p => p.userId.toString() === req.params.userId
        );

        if (!participant) {
            return res.status(404).json({ message: 'Participant not found' });
        }

        participant.seed = seed;

        const updatedTournament = await tournament.save();
        res.json(updatedTournament);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
