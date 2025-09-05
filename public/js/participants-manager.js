class ParticipantsManager {
    constructor(tournamentId) {
        this.tournamentId = tournamentId;
        this.participantsList = document.getElementById('participantsList');
        this.participantInput = document.getElementById('participantName');
        this.addParticipantForm = document.getElementById('addParticipantForm');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.addParticipantForm.addEventListener('submit', (e) => this.handleAddParticipant(e));
        this.participantsList.addEventListener('click', (e) => this.handleRemoveParticipant(e));
    }

    async handleAddParticipant(e) {
        e.preventDefault();
        const participantName = this.participantInput.value.trim();
        if (!participantName) return;

        try {
            const response = await fetch(`/api/tournaments/${this.tournamentId}/participants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: participantName })
            });

            if (!response.ok) throw new Error('Failed to add participant');

            const result = await response.json();
            this.addParticipantToList(result.participant);
            this.participantInput.value = '';
            
            // Trigger bracket update if available
            if (window.bracketManager) {
                window.bracketManager.refreshBracket();
            }
        } catch (error) {
            console.error('Error adding participant:', error);
            alert('Failed to add participant. Please try again.');
        }
    }

    async handleRemoveParticipant(e) {
        if (!e.target.matches('.remove-participant')) return;
        
        const participantId = e.target.dataset.participantId;
        if (!participantId) return;

        try {
            const response = await fetch(`/api/tournaments/${this.tournamentId}/participants/${participantId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to remove participant');

            e.target.closest('.participant-item').remove();
            
            // Trigger bracket update if available
            if (window.bracketManager) {
                window.bracketManager.refreshBracket();
            }
        } catch (error) {
            console.error('Error removing participant:', error);
            alert('Failed to remove participant. Please try again.');
        }
    }

    addParticipantToList(participant) {
        const item = document.createElement('div');
        item.className = 'participant-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${participant.name}</span>
            <button 
                type="button" 
                class="btn btn-sm btn-outline-danger remove-participant" 
                data-participant-id="${participant._id}">
                Remove
            </button>
        `;
        this.participantsList.appendChild(item);
    }
}
