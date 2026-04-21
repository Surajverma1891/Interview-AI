const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please provide all details" })
        }
        const isUserAlreadyExists = await userModel.findOne({ $or: [{ username }, { email }] })
        if (isUserAlreadyExists) {
            return res.status(400).json({ message: "Account already exists" })
        }
        const hash = await bcrypt.hash(password, 10)
        const user = await userModel.create({ username, email, password: hash })
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" })
        res.cookie("token", token)
        res.status(201).json({ message: "User registered successfully", user: { id: user._id, username, email } })
    } catch (err) {
        res.status(500).json({ message: "Server error" })
    }
}

async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        // 1. Pehla check: Kya data aa raha hai?
        if (!email || !password) {
            return res.status(400).json({ message: "Email aur Password dono bharo bhai!" });
        }

        // 2. Database mein user ko dhundo
        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            // AGAR USER NAHI MILA, TOH RETURN KARO (Aage mat badho)
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Password match karo
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // AGAR PASSWORD GALAT HAI, TOH YAHI SE RETURN KARO
            // Bina 'return' ke code niche chala jayega aur token bana dega
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 4. AGAR SAB SAHI HAI, TABHI YE TOKEN BANEGA
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token);
        return res.status(200).json({
            message: "User loggedIn successfully.",
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function logoutUserController(req, res) {
    try {
        // Postman ke liye Header se bhi token check karo
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        if (token) {
            await tokenBlacklistModel.create({ token })
        }
        res.clearCookie("token")
        res.status(200).json({ message: "User logged out successfully" })
    } catch (err) {
        res.status(500).json({ message: "Logout error" })
    }
}

async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)
        res.status(200).json({
            message: "User details fetched successfully",
            user: { id: user._id, username: user.username, email: user.email }
        })
    } catch (err) {
        res.status(500).json({ message: "Server error" })
    }
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController }