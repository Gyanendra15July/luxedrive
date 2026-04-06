const { verifyToken } = require('../utils/token');

function authRequired(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const [scheme, token] = header.split(' ');
        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({ message: 'Missing Authorization: Bearer <token>' });
        }
        req.user = verifyToken(token);
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token', error: err.message });
    }
}

function adminOnly(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    return next();
}

module.exports = { authRequired, adminOnly };
