// discord passport strategy
require('dotenv').config();


const { Strategy: DiscordStrategy } = require('passport-discord');
const passport = require('passport');
const User = require('../models/user.model'); // Adjust path as needed

const scopes = ['identify'];

passport.use(
    new DiscordStrategy(
        {
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_CALLBACK_URL,
            scope: scopes,
        },
        async function (accessToken, refreshToken, profile, cb) {
            try {
                const user = await User.findOneAndUpdate(
                    { discordId: profile.id },
                    {
                        discordId: profile.id,
                        username: profile.username,
                        avatar: profile.avatar,
                        discriminator: profile.discriminator,
                    },
                    { upsert: true, new: true }
                );
                return cb(null, user);
            } catch (err) {
                return cb(err, null);
            }
        }
    )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;

