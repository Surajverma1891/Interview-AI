const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token is required to be added in blacklist"],
        unique: true // Same token dobara add na ho
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours (in seconds) - iske baad data auto-delete ho jayega
    }
});

module.exports = mongoose.model("blacklistTokens", blacklistTokenSchema);