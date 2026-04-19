const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true, // Extra spaces hata dega
        lowercase: true // Sab lowercase mein save hoga
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
})
const userModel = mongoose.model("users", userSchema)

module.exports = userModel