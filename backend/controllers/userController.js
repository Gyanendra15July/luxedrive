const db = require('../config/db');

// Setup multer for local profile image uploads
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload dir if it doesn't exist
const uploadDir = path.join(__dirname, '../../frontend/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if(file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed!'), false);
    }
}).single('profile_image');

exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const [rows] = await db.query('SELECT name, email, mobile, profile_image FROM users WHERE id = ?', [userId]);
        if (!rows.length) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        
        await db.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), userId]);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
};

exports.uploadPhoto = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        try {
            const userId = req.user.userId;
            const imageUrl = `/uploads/${req.file.filename}`;
            await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [imageUrl, userId]);
            res.json({ message: 'Profile photo updated', profile_image: imageUrl });
        } catch (error) {
            next(error);
        }
    });
};

exports.sendOtp = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ message: 'Mobile number is required' });

        // Generate a random 6-digit OTP
        const otpPattern = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Expiration in 5 minutes
        const expiresAt = new Date(Date.now() + 5 * 60000);

        // Delete old OTPs for user
        await db.query('DELETE FROM otps WHERE user_id = ?', [userId]);
        
        // Add new OTP
        await db.query('INSERT INTO otps (user_id, otp_code, expires_at) VALUES (?, ?, ?)', [userId, otpPattern, expiresAt]);

        // In a real production app, integrate Twilio/SNS here
        console.log(`[DEBUG OTP] Sending OTP ${otpPattern} to ${mobile}`);

        res.json({ message: 'OTP sent successfully to your mobile number (Check console in dev mode)' });
    } catch (error) {
        next(error);
    }
};

exports.verifyOtp = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { mobile, otp } = req.body;

        if (!mobile || !otp) return res.status(400).json({ message: 'Mobile and OTP required' });

        const [rows] = await db.query('SELECT * FROM otps WHERE user_id = ? AND otp_code = ? AND expires_at > NOW()', [userId, otp]);
        
        if (!rows.length) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP Valid. Update User mobile.
        await db.query('UPDATE users SET mobile = ? WHERE id = ?', [mobile, userId]);
        await db.query('DELETE FROM otps WHERE user_id = ?', [userId]);

        res.json({ message: 'Mobile number verified and updated successfully' });
    } catch (error) {
        next(error);
    }
};

exports.deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        // The foreign key ON DELETE CASCADE safely removes bookings & OTPs.
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'Account successfully deleted' });
    } catch (error) {
        next(error);
    }
};
