const db = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/token');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

/**
 * Register a new user.
 * SECURITY: Role is always forced to 'user'. Admin accounts must be created via DB/internal tools.
 * IMPROVEMENT: Now returns a JWT token so the frontend can auto-login after registration.
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email: rawEmail, password, mobile } = req.body;
        const email = normalizeEmail(rawEmail);

        if (!name || !email || !password || !mobile) {
            return res.status(400).json({ message: 'All fields (name, email, password, mobile) are required' });
        }

        if (mobile.length > 40) {
            return res.status(400).json({ message: 'Mobile number is too long' });
        }

        // 1. Check if email already exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (existing.length) {
            return res.status(409).json({ message: 'Email address already in use' });
        }

        // 2. Hash password securely with bcrypt
        const password_hash = await hashPassword(password);
        
        // 3. Force role to 'user' — no privilege escalation allowed
        const role = 'user';

        // 4. Save User
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, mobile, role) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), email, password_hash, mobile.trim(), role]
        );

        // 5. Auto-login: Generate JWT token immediately after registration
        const token = signToken({
            userId: result.insertId,
            role: role,
            name: name.trim(),
            email: email
        });

        return res.status(201).json({
            message: 'Registration successful!',
            token,
            role,
            name: name.trim()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Log in an existing user.
 */
exports.login = async (req, res, next) => {
    try {
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || '');

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // 1. Find user
        const [rows] = await db.execute(
            'SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
            [email]
        );
        if (!rows.length) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];

        // 2. Verify hashed password
        const isMatch = await verifyPassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Generate secure JWT
        const token = signToken({ 
            userId: user.id, 
            role: user.role, 
            name: user.name, 
            email: user.email 
        });

        return res.json({ 
            token, 
            role: user.role, 
            name: user.name 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile (protected).
 */
exports.me = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        return res.json({ user: req.user });
    } catch (error) {
        next(error);
    }
};
