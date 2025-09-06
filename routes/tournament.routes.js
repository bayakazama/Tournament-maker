
const express = require('express');
const router = express.Router();
const { BracketsManager } = require('brackets-manager');
const MongoDatabase = require('../utils/mongoDatabase');
const { Tournament } = require('../models/tournament.model');

// Initialize the database and brackets manager
const database = new MongoDatabase();
const manager = new BracketsManager(database);

// Get all tournaments (public listing)
router.get('/', async (req, res) => {
    try {
        const tournaments = await Tournament.find()
            .populate('creator', 'username')
            .sort({ createdAt: -1 });
        
        res.render('tournaments-list', { 
            tournaments: tournaments,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error getting tournaments:', error);
        res.render('tournaments-list', { 
            tournaments: [],
            user: req.user || null,
            error: 'Failed to load tournaments'
        });
    }
});

// Get tournament brackets view (individual tournament page)
router.get('/:id', async (req, res) => {
    try {
        const tournamentId = req.params.id;
        
        // Get all the data components needed by brackets-viewer
        const participants = await database.select('participant', { tournament_id: tournamentId });
        const stages = await database.select('stage', { tournament_id: tournamentId });
        const matches = await database.select('match', { stage_id: stages?.[0]?.id });
        const matchGames = await database.select('match_game', { stage_id: stages?.[0]?.id });
        
        const bracketsData = {
            participant: participants || [],
            stage: stages || [],
            match: matches || [],
            match_game: matchGames || []
        };
        
        console.log('Brackets data structure:', JSON.stringify(bracketsData, null, 2)); // Debug log
        
        res.render('brackets', { 
            bracketsData: bracketsData,
            tournamentId: tournamentId,
        });
    } catch (error) {
        console.error('Error loading tournament brackets:', error);
        res.status(500).render('error', { 
            message: 'Failed to load tournament brackets',
            user: req.user || null 
        });
    }
});

// Update match result (needed for tournament management)
router.put('/match/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;
        const { opponent1, opponent2 } = req.body;

        await manager.update.match({
            id: matchId,
            opponent1: opponent1,
            opponent2: opponent2
        });

        res.json({ message: 'Match updated successfully' });
    } catch (error) {
        console.error('Error updating match:', error);
        res.status(500).json({ error: 'Failed to update match' });
    }
});

module.exports = router;

