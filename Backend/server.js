require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

const PORT = process.env.PORT || 3000
const DB_RETRY_DELAY_MS = 5000

let isDatabaseConnecting = false

async function connectToDatabaseWithRetry() {
    if (isDatabaseConnecting) {
        return
    }

    isDatabaseConnecting = true

    try {
        await connectToDB()
    } catch (error) {
        console.error(`Retrying database connection in ${DB_RETRY_DELAY_MS / 1000} seconds...`)
        setTimeout(() => {
            isDatabaseConnecting = false
            connectToDatabaseWithRetry()
        }, DB_RETRY_DELAY_MS)
        return
    }

    isDatabaseConnecting = false
}

async function startServer() {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })

        connectToDatabaseWithRetry()
    } catch (error) {
        console.error("Server startup failed:", error.message)
        process.exit(1)
    }
}

startServer()
