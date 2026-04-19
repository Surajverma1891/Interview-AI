const mongoose = require("mongoose")



async function connectToDB() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI); // Debugging line
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Database");
    } catch (err) {
        console.log("Connection Error:", err.message);
    }
}

module.exports = connectToDB