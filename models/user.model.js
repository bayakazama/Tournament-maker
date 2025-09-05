// user model
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    avatar: { type: String },
    discriminator: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
