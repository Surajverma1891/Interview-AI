const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const multer = require("multer")
const mongoose = require("mongoose")

const app = express()
app.set("trust proxy", 1)

function normalizeOrigin(value) {
    return typeof value === "string" ? value.trim().replace(/\/$/, "") : ""
}

function getConfiguredOrigins() {
    return Array.from(new Set([
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        process.env.CLIENT_URL,
        ...(process.env.CLIENT_URLS || "").split(",")
    ]
        .map(normalizeOrigin)
        .filter(Boolean)))
}

function isAllowedOrigin(origin) {
    const normalizedOrigin = normalizeOrigin(origin)

    if (!normalizedOrigin) {
        return true
    }

    const allowedOrigins = getConfiguredOrigins()

    if (allowedOrigins.includes(normalizedOrigin)) {
        return true
    }

    return /^https:\/\/interview-ai(?:[-a-z0-9]+)?\.vercel\.app$/i.test(normalizedOrigin)
}

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true)
        }

        return callback(new Error("CORS origin not allowed"))
    },
    credentials: true
}

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

app.get("/healthz", (req, res) => {
    const isDatabaseConnected = mongoose.connection.readyState === 1

    res.status(isDatabaseConnected ? 200 : 503).json({
        status: isDatabaseConnected ? "ok" : "degraded",
        database: isDatabaseConnected ? "connected" : "disconnected"
    })
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "PDF size 10MB se zyada nahi honi chahiye."
            })
        }

        return res.status(400).json({
            message: err.message || "File upload failed."
        })
    }

    if (err?.message === "Only PDF files allowed") {
        return res.status(400).json({
            message: "Sirf PDF file upload kar sakte hain."
        })
    }

    if (err?.message === "CORS origin not allowed") {
        return res.status(403).json({
            message: "Request blocked due to CORS policy."
        })
    }

    if (err) {
        console.error("Unhandled error:", err)
        return res.status(500).json({
            message: "Unexpected server error."
        })
    }

    next()
})


module.exports = app
