// Bracket Viewer implementation
class BracketViewer {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            width: options.width || 800,
            height: options.height || 600,
            roundSpacing: options.roundSpacing || 50,
            matchSpacing: options.matchSpacing || 30,
            ...options
        };
        this.matches = [];
    }

    setData(tournamentData) {
        this.matches = this._formatMatchesData(tournamentData);
        this.render();
    }

    _formatMatchesData(tournament) {
        let matches = [];
        tournament.rounds.forEach(round => {
            round.matches.forEach(match => {
                matches.push({
                    id: match._id,
                    round: round.round,
                    player1: {
                        id: match.player1?.participantId,
                        name: this._getParticipantName(tournament, match.player1?.participantId),
                        score: match.player1?.score || 0
                    },
                    player2: {
                        id: match.player2?.participantId,
                        name: this._getParticipantName(tournament, match.player2?.participantId),
                        score: match.player2?.score || 0
                    },
                    winner: match.winner
                });
            });
        });
        return matches;
    }

    _getParticipantName(tournament, participantId) {
        const participant = tournament.participants.find(p => p._id.toString() === participantId?.toString());
        return participant ? participant.name : 'TBD';
    }

    render() {
        this.container.innerHTML = '';
        const bracketContainer = document.createElement('div');
        bracketContainer.className = 'bracket-container';
        
        // Group matches by rounds
        const roundsMap = this.matches.reduce((acc, match) => {
            if (!acc[match.round]) acc[match.round] = [];
            acc[match.round].push(match);
            return acc;
        }, {});

        // Create rounds
        Object.entries(roundsMap).forEach(([round, matches]) => {
            const roundElement = this._createRound(round, matches);
            bracketContainer.appendChild(roundElement);
        });

        this.container.appendChild(bracketContainer);
    }

    _createRound(roundNumber, matches) {
        const roundElement = document.createElement('div');
        roundElement.className = 'bracket-round';
        roundElement.dataset.round = roundNumber;

        matches.forEach(match => {
            const matchElement = this._createMatch(match);
            roundElement.appendChild(matchElement);
        });

        return roundElement;
    }

    _createMatch(match) {
        const matchElement = document.createElement('div');
        matchElement.className = 'bracket-match';
        matchElement.dataset.matchId = match.id;

        const player1Element = this._createPlayer(match.player1, match.winner === match.player1.id);
        const player2Element = this._createPlayer(match.player2, match.winner === match.player2.id);

        matchElement.appendChild(player1Element);
        matchElement.appendChild(player2Element);

        return matchElement;
    }

    _createPlayer(player, isWinner) {
        const playerElement = document.createElement('div');
        playerElement.className = `bracket-player ${isWinner ? 'winner' : ''}`;
        playerElement.dataset.playerId = player.id;

        const nameElement = document.createElement('span');
        nameElement.className = 'player-name';
        nameElement.textContent = player.name;

        const scoreElement = document.createElement('span');
        scoreElement.className = 'player-score';
        scoreElement.textContent = player.score;

        playerElement.appendChild(nameElement);
        playerElement.appendChild(scoreElement);

        return playerElement;
    }
}

// Export for use in browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BracketViewer;
} else {
    window.BracketViewer = BracketViewer;
}
