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
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
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
        // 1. Debug logs for incoming request
        console.log('[LOGIN ATTEMPT] Body:', { ...req.body, password: '***' });

        const { email, password } = req.body;

        // 2. Input Validation (Prevent undefined password)
        if (!email || !password) {
            console.warn('[LOGIN FAIL] Missing email or password');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // 3. Database Query
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        // 4. Detailed Debug logs for Query result
        console.log('[LOGIN DB RESULT] Rows found:', users.length);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' }); // Generic message for security
        }

        const user = users[0];
        
        // 5. Final safety check before bcrypt.compare
        // This prevents the "Illegal arguments: string, undefined" error
        if (!user.password || typeof password !== 'string') {
            console.error('[CRITICAL] Password data is invalid or missing in DB/Request');
            console.log('[DEBUG] User object keys:', Object.keys(user));
            return res.status(500).json({ message: 'Internal authentication error' });
        }

        // 6. Safe bcrypt.compare
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.warn(`[LOGIN FAIL] Password mismatch for: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 7. JWT Generation
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`[LOGIN SUCCESS] ${email} (${user.role})`);
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
        // Improved error logging
        console.error('[LOGIN SYSTEM ERROR]', error);
        res.status(500).json({ 
            message: 'An unexpected error occurred during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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
