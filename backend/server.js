const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const carRoutes = require('./routes/carRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const ensureSchema = require('./config/ensureSchema');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = Number.parseInt(process.env.PORT, 10) || 5000;

// Enhanced Production Middleware
// Configure CORS for production domains
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*', // Set this to your Render frontend domain if decoupled
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());

// Debug & Logging middleware for API Tracking
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../frontend/uploads'))); // Serve uploads

// API Routes
app.use('/api/cars', carRoutes);
app.use('/api', authRoutes);
app.use('/api', bookingRoutes);
app.use('/api', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Serve Frontend Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend', 'index.html')));
app.get('/cars', (req, res) => res.sendFile(path.join(__dirname, '../frontend', 'cars.html')));
app.get('/booking', (req, res) => res.sendFile(path.join(__dirname, '../frontend', 'booking.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../frontend', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../frontend', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend', 'dashboard.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, '../frontend', 'profile.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend', 'admin-dashboard.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '../frontend', 'contact.html')));

// Error handling middleware
app.use(errorHandler);

async function start() {
    await ensureSchema();
    const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Stop the other process and retry.`);
            process.exit(1);
        }
        throw err;
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});
