const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    let token = req.header("Authorization");
    if (!token) return res.status(401).json({ msg: "No token" });
    // Accept Bearer token
    if (token.startsWith("Bearer ")) {
        token = token.slice(7);
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: "Server configuration error" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ msg: "Invalid token" });
    }
};