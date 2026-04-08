const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        // Validate role
        const allowedRoles = ['user', 'admin'];
        const userRole = allowedRoles.includes(role) ? role : 'user';

        // Check duplicate email
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, userRole]
        );

        console.log(`[REGISTER] New user: ${email} as ${userRole}`);
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error('[REGISTER ERROR]', error.message);
        res.status(500).json({ message: error.message || 'Internal server error during registration' });
    }
};

// POST /api/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // 3. Database Query
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = users[0];
        console.log('[DEBUG] User loaded:', { ...user, password_hash: '***' });
        
        // 5. Safety check before bcrypt.compare
        if (!user.password_hash) {
            console.error('[CRITICAL] password_hash column is missing or empty in DB');
            return res.status(500).json({ message: 'Database configuration error: Password missing' });
        }

        // 6. Safe bcrypt.compare using the correct column name
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 7. JWT Generation
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('[LOGIN SYSTEM ERROR]', error);
        res.status(500).json({ message: 'An unexpected error occurred during login' });
    }
};

// GET /api/me
exports.me = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error('[ME ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};
