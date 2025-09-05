const { BracketsManager } = require('brackets-manager');
const { Stage, Match, Round, Participant, MatchGame, Group } = require('../models/bracket.model');

// Create a MongoDB implementation of the CrudInterface
class MongoDBStorage {
    async insert(table, value) {
        const model = this._getModel(table);
        const doc = new model(value);
        await doc.save();
        return value;
    }

    async select(table, where = {}) {
        const model = this._getModel(table);
        const results = await model.find(where).lean();
        return results;
    }

    async update(table, values, where = {}) {
        const model = this._getModel(table);
        await model.updateMany(where, { $set: values });
        return values;
    }

    async delete(table, where = {}) {
        const model = this._getModel(table);
        await model.deleteMany(where);
    }

    _getModel(table) {
        switch (table) {
            case 'participant':
                return Participant;
            case 'match_game':
                return MatchGame;
            case 'match':
                return Match;
            case 'round':
                return Round;
            case 'group':
                return Group;
            case 'stage':
                return Stage;
            default:
                throw new Error(`Unknown table: ${table}`);
        }
    }
}

class BracketsService {
    constructor() {
        this.storage = new MongoDBStorage();
        this.manager = new BracketsManager(this.storage);
    }

    async createTournamentStage(tournament) {
        try {
            // Format participants for the brackets manager
            const seeding = tournament.participants.map(p => ({
                id: p.userId.toString(),
                name: p.name || p.userId.username
            }));

            // Create a stage for the tournament
            const stage = await this.manager.create({
                name: tournament.name,
                tournamentId: tournament._id.toString(),
                type: 'single_elimination',
                seeding: seeding,
                settings: {
                    seedOrdering: ['natural'], // Use natural ordering for seeding
                    grandfinal: 'none', // No grand final match
                }
            });

            // Return the created stage data
            return await this.getStageData(tournament._id);
        } catch (error) {
            console.error('Error creating tournament stage:', error);
            throw error;
        }
    }

    async updateMatchResult(tournamentId, matchId, score1, score2) {
        try {
            // Get the stage for this tournament
            const [stage] = await this.storage.select('stage', { tournament_id: tournamentId.toString() });
            if (!stage) {
                throw new Error('Tournament stage not found');
            }

            // Update the match result
            await this.manager.update.match({
                id: matchId,
                opponent1: { score: score1 },
                opponent2: { score: score2 }
            });

            // Return updated stage data
            return await this.getStageData(tournamentId);
        } catch (error) {
            console.error('Error updating match result:', error);
            throw error;
        }
    }

    async getStageData(tournamentId) {
        try {
            // Get the stage for this tournament
            const [stage] = await this.storage.select('stage', { tournament_id: tournamentId.toString() });
            if (!stage) {
                throw new Error('Tournament stage not found');
            }

            // Get all the data needed for the viewer
            const [
                matches,
                matchGames,
                participants
            ] = await Promise.all([
                this.storage.select('match', { stage_id: stage.id }),
                this.storage.select('match_game', { stage_id: stage.id }),
                this.storage.select('participant', { tournament_id: tournamentId.toString() })
            ]);

            // Format the data for the viewer
            return {
                stage: stage,
                matches: matches,
                matchGames: matchGames,
                participants: participants
            };
        } catch (error) {
            console.error('Error getting stage data:', error);
            throw error;
        }
    }

    // Reset or delete a tournament's bracket
    async resetTournament(tournamentId) {
        try {
            const [stage] = await this.storage.select('stage', { tournament_id: tournamentId.toString() });
            if (stage) {
                await this.manager.delete.stage(stage.id);
            }
        } catch (error) {
            console.error('Error resetting tournament:', error);
            throw error;
        }
    }
}

module.exports = new BracketsService();
