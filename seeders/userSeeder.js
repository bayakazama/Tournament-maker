const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config();

// Sample Discord users data
const sampleUsers = [
    {
        discordId: '123456789012345678',
        username: 'GamerPro123',
        avatar: '1a2b3c4d5e6f7g8h9i0j',
        discriminator: '1234'
    },
    {
        discordId: '234567890123456789',
        username: 'TournamentMaster',
        avatar: '2b3c4d5e6f7g8h9i0j1k',
        discriminator: '5678'
    },
    {
        discordId: '345678901234567890',
        username: 'EsportsChamp',
        avatar: '3c4d5e6f7g8h9i0j1k2l',
        discriminator: '9012'
    },
    {
        discordId: '456789012345678901',
        username: 'ProPlayer2024',
        avatar: '4d5e6f7g8h9i0j1k2l3m',
        discriminator: '3456'
    },
    {
        discordId: '567890123456789012',
        username: 'CompetitiveGamer',
        avatar: '5e6f7g8h9i0j1k2l3m4n',
        discriminator: '7890'
    },
    {
        discordId: '678901234567890123',
        username: 'SkillMaster',
        avatar: '6f7g8h9i0j1k2l3m4n5o',
        discriminator: '1357'
    },
    {
        discordId: '789012345678901234',
        username: 'ElitePlayer',
        avatar: '7g8h9i0j1k2l3m4n5o6p',
        discriminator: '2468'
    },
    {
        discordId: '890123456789012345',
        username: 'ChampionGamer',
        avatar: '8h9i0j1k2l3m4n5o6p7q',
        discriminator: '1111'
    },
    {
        discordId: '901234567890123456',
        username: 'TourneyKing',
        avatar: '9i0j1k2l3m4n5o6p7q8r',
        discriminator: '2222'
    },
    {
        discordId: '012345678901234567',
        username: 'VictorySeeker',
        avatar: '0j1k2l3m4n5o6p7q8r9s',
        discriminator: '3333'
    },
    {
        discordId: '112345678901234568',
        username: 'BattleRoyale',
        avatar: '1k2l3m4n5o6p7q8r9s0t',
        discriminator: '4444'
    },
    {
        discordId: '212345678901234569',
        username: 'DigitalWarrior',
        avatar: '2l3m4n5o6p7q8r9s0t1u',
        discriminator: '5555'
    },
    {
        discordId: '312345678901234570',
        username: 'GameMaster3000',
        avatar: '3m4n5o6p7q8r9s0t1u2v',
        discriminator: '6666'
    },
    {
        discordId: '412345678901234571',
        username: 'PowerPlayer',
        avatar: '4n5o6p7q8r9s0t1u2v3w',
        discriminator: '7777'
    },
    {
        discordId: '512345678901234572',
        username: 'LegendaryGamer',
        avatar: '5o6p7q8r9s0t1u2v3w4x',
        discriminator: '8888'
    },
    {
        discordId: '612345678901234573',
        username: 'UltimateChamp',
        avatar: '6p7q8r9s0t1u2v3w4x5y',
        discriminator: '9999'
    }
];

async function seedDatabase() {
    try {
        // Connect to database
        await connectDB();
        console.log('Connected to MongoDB');

        // Clear existing users (optional - remove if you want to keep existing users)
        console.log('Clearing existing users...');
        await User.deleteMany({});

        // Insert sample users
        console.log('Inserting sample users...');
        const insertedUsers = await User.insertMany(sampleUsers);
        
        console.log(`Successfully seeded ${insertedUsers.length} users:`);
        insertedUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username}#${user.discriminator} (ID: ${user._id})`);
        });

        console.log('\nDatabase seeding completed successfully!');
        
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Close database connection
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run seeder if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase, sampleUsers };
