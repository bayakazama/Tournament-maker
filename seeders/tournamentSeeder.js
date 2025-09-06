const mongoose = require('mongoose');
const User = require('../models/user.model');
const { Tournament } = require('../models/tournament.model');
const connectDB = require('../config/db');
const { seedDatabase: seedUsers, sampleUsers } = require('./userSeeder');
const MongoDatabase = require('../utils/mongoDatabase');
const { BracketsManager } = require('brackets-manager');

async function seedTournaments() {
    try {
        // Connect to database
        await connectDB();
        console.log('Connected to MongoDB');

        // First seed users if they don't exist
        const existingUsers = await User.countDocuments();
        if (existingUsers === 0) {
            console.log('No users found, seeding users first...');
            await User.insertMany(sampleUsers);
        }

        // Get all users
        const users = await User.find().limit(16);
        console.log(`Found ${users.length} users for tournaments`);

        // Initialize brackets manager
        const database = new MongoDatabase();
        const manager = new BracketsManager(database);

        // Sample tournament configurations
        const sampleTournaments = [
            {
                name: 'Summer Championship 2025',
                description: 'The ultimate summer tournament for skilled players',
                type: 'single_elimination',
                participants: users.slice(0, 8).map(u => u.username),
                settings: { seedOrdering: ['natural'], grandFinal: 'simple' }
            },
            {
                name: 'Double Elimination Masters',
                description: 'High-stakes double elimination tournament',
                type: 'double_elimination', 
                participants: users.slice(0, 4).map(u => u.username),
                settings: { seedOrdering: ['natural'], grandFinal: 'double' }
            },
            {
                name: 'Round Robin League',
                description: 'Everyone plays everyone in this league format',
                type: 'round_robin',
                participants: users.slice(8, 14).map(u => u.username),
                settings: { seedOrdering: ['natural'] }
            }
        ];

        // Clear existing tournaments (optional)
        console.log('Clearing existing tournaments...');
        await Tournament.deleteMany({});

        // Create tournaments
        for (let i = 0; i < sampleTournaments.length; i++) {
            const tournamentConfig = sampleTournaments[i];
            console.log(`\nCreating tournament: ${tournamentConfig.name}`);

            try {
                // Create tournament metadata
                const tournament = new Tournament({
                    name: tournamentConfig.name,
                    description: tournamentConfig.description,
                    creator: users[i % users.length]._id, // Rotate through users as creators
                    status: 'active',
                    maxParticipants: tournamentConfig.participants.length
                });
                const savedTournament = await tournament.save();

                // Create participants array with proper format
                const participants = tournamentConfig.participants.map(name => ({ name }));

                // Create tournament structure with brackets-manager
                await manager.create.stage({
                    tournamentId: savedTournament._id.toString(),
                    name: tournamentConfig.name,
                    type: tournamentConfig.type,
                    seeding: tournamentConfig.participants, // Use simple string array
                    settings: tournamentConfig.settings
                });

                console.log(`✓ Created tournament: ${tournamentConfig.name} with ${participants.length} participants`);

            } catch (error) {
                console.error(`✗ Failed to create tournament: ${tournamentConfig.name}`, error.message);
            }
        }

        console.log('\n🎉 Tournament seeding completed successfully!');
        
    } catch (error) {
        console.error('Error seeding tournaments:', error);
    } finally {
        // Close database connection
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run seeder if this file is executed directly
if (require.main === module) {
    seedTournaments();
}

module.exports = { seedTournaments };
