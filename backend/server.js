const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

// Import controllers
const authController    = require('./controllers/authController');
const carController     = require('./controllers/carController');
const bookingController = require('./controllers/bookingController');
const adminController   = require('./controllers/adminController');
const { authRequired, adminOnly } = require('./middleware/auth');

const app = express();

// ─── Core Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded car images from /uploads URL path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve all frontend files as static assets
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Multer (image upload) ────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads/'));
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },           // 5 MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'), false);
    }
});

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.post('/api/register', authController.register);
app.post('/api/login',    authController.login);
app.get( '/api/me',       authRequired, authController.me);

// ─── Car Routes ──────────────────────────────────────────────────────────────
app.get(   '/api/cars',     carController.getAllCars);
app.post(  '/api/cars',     authRequired, adminOnly, upload.single('image'), carController.addCar);
app.put(   '/api/cars/:id', authRequired, adminOnly, upload.single('image'), carController.updateCar);
app.delete('/api/cars/:id', authRequired, adminOnly, carController.deleteCar);

// ─── Booking Routes ───────────────────────────────────────────────────────────
app.post('/api/book',                  authRequired, bookingController.bookCar);
app.get( '/api/my-bookings',           authRequired, bookingController.getMyBookings);
app.get( '/api/all-bookings',          authRequired, adminOnly, bookingController.getAllBookings);
app.put( '/api/booking/:id/status',    authRequired, adminOnly, bookingController.updateBookingStatus);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
app.get('/api/admin/stats',            authRequired, adminOnly, adminController.getStats);
app.get('/api/admin/cars',             authRequired, adminOnly, adminController.listCars);
app.get('/api/admin/bookings',         authRequired, adminOnly, adminController.listAllBookings);
app.get('/api/admin/users',            authRequired, adminOnly, adminController.listUsers);

// ─── Frontend HTML Routes (fixes "Cannot GET /page") ─────────────────────────
const frontend = (file) => (req, res) =>
    res.sendFile(path.join(__dirname, '../frontend', file));

app.get('/',                frontend('index.html'));
app.get('/login',           frontend('login.html'));
app.get('/register',        frontend('register.html'));
app.get('/dashboard',       frontend('dashboard.html'));
app.get('/admin',           frontend('admin.html'));
app.get('/manage-bookings', frontend('manage-bookings.html'));
app.get('/bookings',        frontend('bookings.html'));
app.get('/profile',         frontend('profile.html'));
app.get('/cars',            frontend('cars.html'));
app.get('/contact',         frontend('contact.html'));

// ─── Global 404 & Error Handler ──────────────────────────────────────────────
app.use((req, res) => {
    console.warn(`[404] ${req.method} ${req.originalUrl}`);
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
    }
    res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use((err, req, res, _next) => {
    console.error('[SERVER ERROR]', err.message);
    res.status(500).json({ message: err.message || 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   DB_HOST: ${process.env.DB_HOST}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME}`);
    console.log(`   DB_PORT: ${process.env.DB_PORT}`);
});
