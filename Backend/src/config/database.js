const mongoose = require("mongoose")

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Database");
        return mongoose.connection;
    } catch (err) {
        console.log("Connection Error:", err.message);
        throw err;
    }
}

module.exports = connectToDB
