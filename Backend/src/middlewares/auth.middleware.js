const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
    try {
        // Token dono jagah se check karo (Cookie ya Header)
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: Token not provided."
            });
        }

        // Sabse pehle blacklist check karo
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token: token });

        if (isTokenBlacklisted) {
            // Agar token mil gaya, matlab user logout kar chuka hai
            return res.status(401).json({
                message: "Unauthorized: This token is blacklisted."
            });
        }

        // Ab verify karo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();

    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized: Invalid or expired token."
        });
    }
}

module.exports = { authUser };