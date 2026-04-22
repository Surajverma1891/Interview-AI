const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const multer = require("multer")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

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

    if (err) {
        console.error("Unhandled error:", err)
        return res.status(500).json({
            message: "Unexpected server error."
        })
    }

    next()
})


module.exports = app
