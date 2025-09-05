const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    id: String,
    tournament_id: mongoose.Schema.Types.ObjectId,
    name: String,
    seed: Number
});

const matchGameSchema = new mongoose.Schema({
    id: String,
    match_id: String,
    stage_id: String,
    tournament_id: mongoose.Schema.Types.ObjectId,
    number: Number,
    scores: {
        opponent1: Number,
        opponent2: Number
    }
});

const matchSchema = new mongoose.Schema({
    id: String,
    stage_id: String,
    tournament_id: mongoose.Schema.Types.ObjectId,
    number: Number,
    round_id: String,
    opponent1: {
        id: String,
        score: Number,
        result: String
    },
    opponent2: {
        id: String,
        score: Number,
        result: String
    },
    status: {
        type: String,
        enum: ['pending', 'running', 'completed'],
        default: 'pending'
    }
});

const roundSchema = new mongoose.Schema({
    id: String,
    stage_id: String,
    tournament_id: mongoose.Schema.Types.ObjectId,
    number: Number,
    matches: [String] // Array of match IDs
});

const stageSchema = new mongoose.Schema({
    id: String,
    tournament_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament'
    },
    name: String,
    type: {
        type: String,
        enum: ['single_elimination', 'double_elimination', 'round_robin'],
        default: 'single_elimination'
    },
    number: Number,
    status: {
        type: String,
        enum: ['pending', 'running', 'completed'],
        default: 'pending'
    },
    settings: {
        seedOrdering: [String],
        grandfinal: String
    }
});

const Participant = mongoose.model('Participant', participantSchema);
const MatchGame = mongoose.model('MatchGame', matchGameSchema);
const Match = mongoose.model('Match', matchSchema);
const Round = mongoose.model('Round', roundSchema);
const Stage = mongoose.model('Stage', stageSchema);

module.exports = {
    Participant,
    MatchGame,
    Match,
    Round,
    Stage
};
