class BracketManager {
    constructor(tournament) {
        this.tournament = tournament;
        this.rounds = tournament.rounds || [];
    }

    generateBracket(participants) {
        const numParticipants = participants.length;
        const numRounds = Math.ceil(Math.log2(numParticipants));
        const totalSlots = Math.pow(2, numRounds);
        
        // Sort participants by seed
        participants.sort((a, b) => (a.seed || Infinity) - (b.seed || Infinity));
        
        // Generate rounds
        this.rounds = [];
        for (let r = 0; r < numRounds; r++) {
            const round = {
                round: r + 1,
                matches: []
            };
            
            const matchesInRound = totalSlots / Math.pow(2, r + 1);
            for (let m = 0; m < matchesInRound; m++) {
                round.matches.push({
                    player1: { participantId: null, score: null },
                    player2: { participantId: null, score: null },
                    winner: null,
                    completed: false
                });
            }
            this.rounds.push(round);
        }
        
        // Seed first round
        const firstRound = this.rounds[0];
        for (let i = 0; i < Math.min(numParticipants, totalSlots); i++) {
            const matchIndex = Math.floor(i / 2);
            const isPlayer1 = i % 2 === 0;
            
            if (isPlayer1) {
                firstRound.matches[matchIndex].player1.participantId = participants[i]._id;
            } else {
                firstRound.matches[matchIndex].player2.participantId = participants[i]._id;
            }
        }
        
        return this.rounds;
    }

    updateMatch(roundIndex, matchIndex, player1Score, player2Score) {
        const match = this.rounds[roundIndex].matches[matchIndex];
        match.player1.score = player1Score;
        match.player2.score = player2Score;
        
        // Determine winner
        if (player1Score > player2Score) {
            match.winner = match.player1.participantId;
        } else if (player2Score > player1Score) {
            match.winner = match.player2.participantId;
        }
        match.completed = true;
        
        // Advance winner to next round if available
        if (roundIndex < this.rounds.length - 1) {
            const nextRoundMatch = Math.floor(matchIndex / 2);
            const isPlayer1 = matchIndex % 2 === 0;
            
            if (isPlayer1) {
                this.rounds[roundIndex + 1].matches[nextRoundMatch].player1.participantId = match.winner;
            } else {
                this.rounds[roundIndex + 1].matches[nextRoundMatch].player2.participantId = match.winner;
            }
        }
        
        return this.rounds;
    }

    getParticipantById(participantId) {
        return this.tournament.participants.find(p => p._id === participantId);
    }

    getRoundProgress(roundIndex) {
        const round = this.rounds[roundIndex];
        if (!round) return 0;
        
        const completedMatches = round.matches.filter(m => m.completed).length;
        return (completedMatches / round.matches.length) * 100;
    }

    isComplete() {
        return this.rounds.every(round => 
            round.matches.every(match => 
                match.completed || (!match.player1.participantId && !match.player2.participantId)
            )
        );
    }
}
