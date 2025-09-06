const mongoose = require('mongoose');

// Tournament Schema
const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
    maxParticipants: { type: Number },
    registrationStart: { type: Date },
    registrationEnd: { type: Date },
    tournamentStart: { type: Date },
    tournamentEnd: { type: Date }
}, { timestamps: true });

// Participant Schema
const participantSchema = new mongoose.Schema({
    tournament_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seed: { type: Number }
}, { timestamps: true });

// Stage Schema
const stageSchema = new mongoose.Schema({
    tournament_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    number: { type: Number, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true }, // single_elimination, double_elimination, round_robin, etc.
    settings: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Group Schema
const groupSchema = new mongoose.Schema({
    stage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', required: true },
    number: { type: Number, required: true }
}, { timestamps: true });

// Round Schema
const roundSchema = new mongoose.Schema({
    stage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', required: true },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    number: { type: Number, required: true }
}, { timestamps: true });

// Match Schema
const matchSchema = new mongoose.Schema({
    stage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', required: true },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    round_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Round', required: true },
    number: { type: Number, required: true },
    status: { type: Number, default: 0 }, // 0: pending, 1: running, 2: completed
    child_count: { type: Number, default: 0 },
    opponent1: { type: mongoose.Schema.Types.Mixed },
    opponent2: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Match Game Schema
const matchGameSchema = new mongoose.Schema({
    stage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', required: true },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    number: { type: Number, required: true },
    status: { type: Number, default: 0 }, // 0: pending, 1: running, 2: completed
    opponent1: { type: mongoose.Schema.Types.Mixed },
    opponent2: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Create indexes for better performance
tournamentSchema.index({ creator: 1, status: 1 });
participantSchema.index({ tournament_id: 1 });
stageSchema.index({ tournament_id: 1, number: 1 });
groupSchema.index({ stage_id: 1, number: 1 });
roundSchema.index({ stage_id: 1, group_id: 1, number: 1 });
matchSchema.index({ stage_id: 1, group_id: 1, round_id: 1, number: 1 });
matchGameSchema.index({ stage_id: 1, parent_id: 1, number: 1 });

// Create models
const Tournament = mongoose.model('Tournament', tournamentSchema);
const Participant = mongoose.model('Participant', participantSchema);
const Stage = mongoose.model('Stage', stageSchema);
const Group = mongoose.model('Group', groupSchema);
const Round = mongoose.model('Round', roundSchema);
const Match = mongoose.model('Match', matchSchema);
const MatchGame = mongoose.model('MatchGame', matchGameSchema);

module.exports = {
    Tournament,
    Participant,
    Stage,
    Group,
    Round,
    Match,
    MatchGame
};
