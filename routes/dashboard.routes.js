const express = require('express');
const router = express.Router();
const { Tournament } = require('../models/tournament.model');
const MongoDatabase = require('../utils/mongoDatabase');
const { BracketsManager } = require('brackets-manager');

// Initialize the database and brackets manager
const database = new MongoDatabase();
const manager = new BracketsManager(database);

function isAuth(req, res, next) {
    if (req.user) {
        return next();
    }
    res.redirect('/login');
}

// Dashboard main page - show user's tournaments
router.get('/', isAuth, async (req, res) => {
    try {
        const tournaments = await Tournament.find({ creator: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.render('dashboard', { 
            user: req.user,
            tournaments: tournaments
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.render('dashboard', { 
            user: req.user,
            tournaments: [],
            error: 'Failed to load tournaments'
        });
    }
});

// Create tournament page
router.get('/create-tournament', isAuth, (req, res) => {
    res.render('create-tournament', { user: req.user });
});

// Handle tournament creation
router.post('/create-tournament', isAuth, async (req, res) => {
    try {
        console.log('Received form data:', req.body); // Debug log
        console.log('Request headers:', req.headers['content-type']); // Debug log
        
        const { name, description, type, participantsList, settings } = req.body;
        
        // Additional validation
        if (!name || !type || !participantsList) {
            return res.render('create-tournament', {
                user: req.user,
                error: 'Please fill in all required fields (name, type, and participants)',
                formData: req.body
            });
        }
        
        // Parse participants from form input
        let participants = [];
        if (participantsList) {
            participants = participantsList.split('\n')
                .map(name => name.trim())
                .filter(name => name.length > 0)
                .map(name => ({ name }));
        }

        console.log('Parsed participants:', participants); // Debug log

        // Ensure we have participants
        if (!participants || participants.length === 0) {
            return res.render('create-tournament', {
                user: req.user,
                error: 'No participants found. Please add at least one participant.',
                formData: req.body
            });
        }

        // Validate minimum participants for tournament type
        const minParticipants = type === 'round_robin' ? 3 : 2;
        const originalParticipantCount = participants.length; // Save original count before padding
        
        if (originalParticipantCount < minParticipants) {
            return res.render('create-tournament', {
                user: req.user,
                error: `${type.replace('_', ' ')} tournaments require at least ${minParticipants} participants`,
                formData: req.body
            });
        }

        // For single/double elimination, pad to next power of 2
        if (type === 'single_elimination' || type === 'double_elimination') {
            const currentCount = participants.length;
            const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(currentCount)));
            
            console.log(`Current participants: ${currentCount}, padding to: ${nextPowerOfTwo}`);
            
            // Add BYE participants to reach power of 2
            const byeCount = nextPowerOfTwo - currentCount;
            for (let i = currentCount; i < nextPowerOfTwo; i++) {
                participants.push({ name: `BYE ${i - currentCount + 1}` });
            }
            
            console.log('Padded participants:', participants);
            
            // Store info for user feedback
            if (byeCount > 0) {
                console.log(`Added ${byeCount} BYE participants to reach required ${nextPowerOfTwo} slots`);
            }
        }

        // Create tournament metadata record (use original count, not padded)
        const tournament = new Tournament({
            name: name,
            description: description || '',
            creator: req.user._id,
            status: 'active',
            maxParticipants: originalParticipantCount
        });
        const savedTournament = await tournament.save();

        // Create tournament settings
        const tournamentSettings = {
            seedOrdering: settings?.seedOrdering ? [settings.seedOrdering] : ['natural']
        };

        if (type === 'single_elimination' || type === 'double_elimination') {
            tournamentSettings.grandFinal = settings?.grandFinal || 'simple';
            if (settings?.consolationFinal === 'true') {
                tournamentSettings.consolationFinal = true;
            }
        }

        // Create the tournament using brackets-manager ONLY
        // This will handle all the stage, group, round, match creation
        console.log('Creating tournament with data:', {
            tournamentId: savedTournament._id.toString(),
            name: name,
            type: type,
            seeding: participants,
            settings: tournamentSettings
        }); // Debug log

        // Test with simple participant format first
        const simpleSeeding = participants.map(p => p.name);
        console.log('Simple seeding format:', simpleSeeding);

        const stage = await manager.create.stage({
            tournamentId: savedTournament._id.toString(),
            name: name,
            type: type,
            seeding: simpleSeeding,  // Try with simple string array first
            settings: tournamentSettings
        });

        res.redirect(`/dashboard/tournament/${savedTournament._id}/manage`);

    } catch (error) {
        console.error('Error creating tournament:', error);
        res.render('create-tournament', {
            user: req.user,
            error: 'Failed to create tournament. Please try again.',
            formData: req.body
        });
    }
});

// Get tournament details for management
router.get('/tournament/:id/manage', isAuth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        
        if (!tournament) {
            return res.status(404).render('error', { 
                message: 'Tournament not found',
                user: req.user 
            });
        }

        // Check if user owns this tournament
        if (tournament.creator.toString() !== req.user._id.toString()) {
            return res.status(403).render('error', { 
                message: 'Access denied',
                user: req.user 
            });
        }

        // Get tournament data from brackets-manager
        const tournamentData = await manager.get.tournamentData(tournament._id.toString());
        
        res.render('tournament-manage', {
            user: req.user,
            tournament: tournament,
            tournamentData: tournamentData
        });

    } catch (error) {
        console.error('Error loading tournament management:', error);
        res.status(500).render('error', { 
            message: 'Failed to load tournament',
            user: req.user 
        });
    }
});

// Delete tournament
router.delete('/tournament/:id', isAuth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

        // Check if user owns this tournament
        if (tournament.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Reset tournament data in brackets-manager
        await manager.reset.tournamentData(tournament._id.toString());
        
        // Delete the tournament record
        await Tournament.findByIdAndDelete(req.params.id);

        res.json({ message: 'Tournament deleted successfully' });

    } catch (error) {
        console.error('Error deleting tournament:', error);
        res.status(500).json({ error: 'Failed to delete tournament' });
    }
});

module.exports = router;
