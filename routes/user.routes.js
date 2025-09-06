const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

function isAuth(req, res, next) {
    if (req.user) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
}

// Search users by username for tournament participant suggestions
router.get('/search', isAuth, async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        
        if (!q || q.length < 2) {
            return res.json([]);
        }

        // Search users by username (case insensitive)
        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        })
        .select('username discordId avatar') // Only select needed fields
        .limit(parseInt(limit))
        .sort('username');

        // Format response for dropdown
        const suggestions = users.map(user => ({
            id: user._id,
            name: user.username,
            avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.webp?size=32` : null
        }));

        res.json(suggestions);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

// Get user details by ID
router.get('/:userId', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('username discordId avatar');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user._id,
            name: user.username,
            avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.webp?size=64` : null
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

module.exports = router;
