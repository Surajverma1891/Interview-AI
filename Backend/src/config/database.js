const mongoose = require("mongoose")

function getMongoUriCandidates() {
    return [
        process.env.MONGO_URI,
        process.env.MONGO_URI_FALLBACK
    ].filter(Boolean)
}

async function connectToDB() {
    const mongoUris = getMongoUriCandidates()

    if (mongoUris.length === 0) {
        throw new Error("MONGO_URI is not configured.")
    }

    let lastError = null

    for (const mongoUri of mongoUris) {
        try {
            await mongoose.connect(mongoUri);
            console.log("Connected to Database");
            return mongoose.connection;
        } catch (err) {
            lastError = err
            console.log("Connection Error:", err.message);
        }
    }

    throw lastError || new Error("Database connection failed.")
}

module.exports = connectToDB
