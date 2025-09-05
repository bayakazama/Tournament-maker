class BracketAPI {
    constructor(tournamentId) {
        this.tournamentId = tournamentId;
        this.baseUrl = `/api/tournaments/${tournamentId}`;
    }

    async generateBracket() {
        try {
            const response = await fetch(`${this.baseUrl}/generate-bracket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate bracket');
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating bracket:', error);
            throw error;
        }
    }

    async updateMatchResult(matchId, player1Score, player2Score) {
        try {
            const response = await fetch(`${this.baseUrl}/matches/${matchId}/result`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    player1Score,
                    player2Score
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update match result');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating match result:', error);
            throw error;
        }
    }

    async getBracketState() {
        try {
            const response = await fetch(`${this.baseUrl}/bracket`);
            if (!response.ok) {
                throw new Error('Failed to fetch bracket state');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching bracket state:', error);
            throw error;
        }
    }
}

// Export for use in browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BracketAPI;
} else {
    window.BracketAPI = BracketAPI;
}
