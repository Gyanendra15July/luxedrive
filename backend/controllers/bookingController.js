const db = require('../config/db');

// POST /api/book
exports.bookCar = async (req, res) => {
    try {
        console.log('[API HIT] POST /api/book');
        const { car_id, start_date, end_date } = req.body;
        const user_id = req.user.id; // FIX: was req.userId

        if (!car_id || !start_date || !end_date) {
            return res.status(400).json({ message: 'car_id, start_date, end_date are required' });
        }

        const [result] = await db.execute(
            'INSERT INTO bookings (user_id, car_id, start_date, end_date) VALUES (?, ?, ?, ?)',
            [user_id, car_id, start_date, end_date]
        );

        res.status(201).json({ message: 'Booking request submitted', bookingId: result.insertId });
    } catch (error) {
        console.error('[BOOK ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/my-bookings
exports.getMyBookings = async (req, res) => {
    try {
        console.log('[API HIT] GET /api/my-bookings');
        const user_id = req.user.id; // FIX: was req.userId

        const [bookings] = await db.execute(
            `SELECT b.*, c.name AS car_name, c.image AS car_image, c.price_per_day
             FROM bookings b
             JOIN cars c ON b.car_id = c.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC`,
            [user_id]
        );
        res.json(bookings);
    } catch (error) {
        console.error('[MY BOOKINGS ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/all-bookings  (admin)
exports.getAllBookings = async (req, res) => {
    try {
        console.log('[API HIT] GET /api/all-bookings');
        const [bookings] = await db.execute(
            `SELECT b.*, u.name AS user_name, u.email AS user_email,
                    c.name AS car_name, c.price_per_day
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN cars  c ON b.car_id  = c.id
             ORDER BY b.created_at DESC`
        );
        res.json(bookings);
    } catch (error) {
        console.error('[ALL BOOKINGS ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/booking/:id/status  (admin)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;
        const allowed = ['pending', 'approved', 'rejected', 'cancelled'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
        res.json({ message: 'Booking status updated' });
    } catch (error) {
        console.error('[STATUS ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};
