const jwt = require('jsonwebtoken');

const authRequired = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized!" });
        }
        req.user = decoded; // Store entire decoded object (id, role)
        next();
    });
};

const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Require Admin Role!" });
    }
    next();
};

module.exports = { authRequired, adminOnly };
