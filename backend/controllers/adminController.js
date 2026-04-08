const db = require('../config/db');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const [[usersRow]]    = await db.execute('SELECT COUNT(*) AS total FROM users');
        const [[carsRow]]     = await db.execute('SELECT COUNT(*) AS total FROM cars');
        const [[bookingsRow]] = await db.execute('SELECT COUNT(*) AS total FROM bookings');

        const [mostBooked] = await db.execute(
            `SELECT c.id, c.name, COUNT(b.id) AS bookings_count
             FROM bookings b
             JOIN cars c ON c.id = b.car_id
             GROUP BY c.id, c.name
             ORDER BY bookings_count DESC
             LIMIT 1`
        );

        res.json({
            total_users:    usersRow.total,
            total_cars:     carsRow.total,
            total_bookings: bookingsRow.total,
            most_booked_car: mostBooked[0] || null
        });
    } catch (error) {
        console.error('[STATS ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/cars
exports.listCars = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM cars ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('[ADMIN LIST CARS ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/bookings
exports.listAllBookings = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT b.*, u.name AS user_name, u.email AS user_email,
                    c.name AS car_name, c.price_per_day
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN cars  c ON b.car_id  = c.id
             ORDER BY b.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('[ADMIN BOOKINGS ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/users
exports.listUsers = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('[ADMIN USERS ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};
