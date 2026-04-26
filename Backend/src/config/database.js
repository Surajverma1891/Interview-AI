const mongoose = require("mongoose")

function normalizeMongoUri(value) {
    if (typeof value !== "string") {
        return ""
    }

    let normalizedValue = value.trim()

    if (
        (normalizedValue.startsWith('"') && normalizedValue.endsWith('"')) ||
        (normalizedValue.startsWith("'") && normalizedValue.endsWith("'"))
    ) {
        normalizedValue = normalizedValue.slice(1, -1).trim()
    }

    if (normalizedValue.startsWith("MONGO_URI=")) {
        normalizedValue = normalizedValue.slice("MONGO_URI=".length).trim()
    }

    if (normalizedValue.startsWith("MONGO_URI_FALLBACK=")) {
        normalizedValue = normalizedValue.slice("MONGO_URI_FALLBACK=".length).trim()
    }

    return normalizedValue
}

function getMongoUriCandidates() {
    return Array.from(new Set([
        process.env.MONGO_URI,
        process.env.MONGO_URI_FALLBACK
    ]
        .map(normalizeMongoUri)
        .filter(Boolean)))
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
