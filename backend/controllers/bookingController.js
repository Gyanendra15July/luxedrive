const db = require('../config/db');

exports.bookCar = async (req, res) => {
    try {
        const { car_id, start_date, end_date } = req.body;
        const user_id = req.userId;
        
        const [result] = await db.execute(
            'INSERT INTO bookings (user_id, car_id, start_date, end_date) VALUES (?, ?, ?, ?)',
            [user_id, car_id, start_date, end_date]
        );
        
        res.status(201).json({ message: "Booking request submitted", bookingId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const [bookings] = await db.execute(
            `SELECT b.*, c.name as car_name, c.image as car_image 
             FROM bookings b 
             JOIN cars c ON b.car_id = c.id 
             WHERE b.user_id = ?`,
            [req.userId]
        );
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const [bookings] = await db.execute(
            `SELECT b.*, u.name as user_name, c.name as car_name 
             FROM bookings b 
             JOIN users u ON b.user_id = u.id 
             JOIN cars c ON b.car_id = c.id`
        );
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;
        
        await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
        res.json({ message: "Booking status updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
