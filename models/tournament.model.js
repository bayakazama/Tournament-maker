const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date 
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        seed: Number
    }],
    rounds: [{
        round: Number,
        matches: [{
            player1: {
                participantId: mongoose.Schema.Types.ObjectId,
                score: Number
            },
            player2: {
                participantId: mongoose.Schema.Types.ObjectId,
                score: Number
            },
            winner: mongoose.Schema.Types.ObjectId,
            completed: {
                type: Boolean,
                default: false
            }
        }]
    }],
    status: {
        type: String,
        enum: ['pending', 'active', 'completed'],
        default: 'pending'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
