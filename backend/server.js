const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const authController = require('./controllers/authController');
const carController = require('./controllers/carController');
const bookingController = require('./controllers/bookingController');
const { verifyToken, isAdmin } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Auth Routes
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// Car Routes
app.get('/api/cars', carController.getAllCars);
app.post('/api/cars', verifyToken, isAdmin, upload.single('image'), carController.addCar);
app.put('/api/cars/:id', verifyToken, isAdmin, upload.single('image'), carController.updateCar);
app.delete('/api/cars/:id', verifyToken, isAdmin, carController.deleteCar);

// Booking Routes
app.post('/api/book', verifyToken, bookingController.bookCar);
app.get('/api/my-bookings', verifyToken, bookingController.getMyBookings);
app.get('/api/all-bookings', verifyToken, isAdmin, bookingController.getAllBookings);
app.put('/api/booking/:id/status', verifyToken, isAdmin, bookingController.updateBookingStatus);

// HTML Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../frontend/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../frontend/register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dashboard.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../frontend/admin.html')));
app.get('/manage-bookings', (req, res) => res.sendFile(path.join(__dirname, '../frontend/manage-bookings.html')));
app.get('/bookings', (req, res) => res.sendFile(path.join(__dirname, '../frontend/bookings.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, '../frontend/profile.html')));
app.get('/cars', (req, res) => res.sendFile(path.join(__dirname, '../frontend/cars.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '../frontend/contact.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
