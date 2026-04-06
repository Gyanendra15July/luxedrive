const db = require('../config/db');

/**
 * Handle new luxury car booking requests.
 */
exports.createBooking = async (req, res, next) => {
    try {
        const userId = req.user && req.user.userId;
        const { car_id, pickup_date, return_date, total_price, pickup_location, destination } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!car_id || !pickup_date || !return_date || !total_price || !pickup_location) {
            return res.status(400).json({ message: 'Missing required fields: car_id, dates, price, or pickup location.' });
        }

        // 1. Validate dates logic
        const start = new Date(pickup_date);
        const end = new Date(return_date);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (start < now) {
            return res.status(400).json({ message: 'Pickup date cannot be in the past' });
        }
        if (start >= end) {
            return res.status(400).json({ message: 'Return date must be after pickup date' });
        }

        // 2. Locate Car and Check for Overlapping Bookings
        // Logic: Overlap exists if (existing.pickup_date <= new_return_date) AND (existing.return_date >= new_pickup_date)
        const [conflicts] = await db.execute(
            `SELECT id FROM bookings 
             WHERE car_id = ? 
             AND (pickup_date <= ? AND return_date >= ?) 
             LIMIT 1`,
            [car_id, return_date, pickup_date]
        );

        if (conflicts.length > 0) {
            return res.status(400).json({ 
                message: 'Car already booked for selected dates' 
            });
        }

        // 3. Confirm Car Availability
        const [cars] = await db.execute(
            'SELECT id, availability_status FROM cars WHERE id = ? LIMIT 1',
            [car_id]
        );
        if (!cars.length) return res.status(404).json({ message: 'Car not found' });
        if (cars[0].availability_status !== 'available') {
            return res.status(409).json({ message: 'This vehicle is currently unavailable' });
        }

        // 4. Record Booking with Location Details
        await db.execute(
            'INSERT INTO bookings (user_id, car_id, pickup_date, return_date, total_price, pickup_location, destination) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, car_id, pickup_date, return_date, total_price, pickup_location, destination || null]
        );

        return res.status(201).json({ message: 'Reservation confirmed! Your luxury experience starts soon.' });
    } catch (error) {
        next(error);
    }
};

/**
 * Get reservations for the currently authenticated client.
 */
exports.getMyBookings = async (req, res, next) => {
    try {
        const userId = req.user && req.user.userId;
        if (!userId) return res.status(401).json({ message: 'Authentication required' });

        const [rows] = await db.execute(
            `SELECT b.id, b.pickup_date, b.return_date, b.total_price, b.pickup_location, b.destination, b.status, b.created_at,
                    c.car_name, c.brand, c.image, c.type
             FROM bookings b
             JOIN cars c ON c.id = b.car_id
             WHERE b.user_id = ?
             ORDER BY b.pickup_date DESC`,
            [userId]
        );

        return res.json(rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Admin view for monitoring all reservations inclusive of location data.
 */
exports.getAllBookings = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT b.id, b.pickup_date, b.return_date, b.total_price, b.pickup_location, b.destination, b.status, b.created_at,
                    u.name AS user_name, u.email AS user_email, u.mobile AS user_mobile,
                    c.car_name, c.brand, c.image, c.type
             FROM bookings b
             JOIN users u ON u.id = b.user_id
             JOIN cars c ON c.id = b.car_id
             ORDER BY b.created_at DESC`
        );
        return res.json(rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Handle booking cancellation.
 */
exports.cancelBooking = async (req, res, next) => {
    try {
        const userId = req.user && req.user.userId;
        const bookingId = req.params.id;

        if (!userId) return res.status(401).json({ message: 'Authentication required' });

        // Verify booking belongs to user
        const [bookings] = await db.execute('SELECT id, status, pickup_date FROM bookings WHERE id = ? AND user_id = ? LIMIT 1', [bookingId, userId]);
        
        if (!bookings.length) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const booking = bookings[0];
        
        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        const pickupDate = new Date(booking.pickup_date);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (pickupDate <= now) {
            return res.status(400).json({ message: 'You cannot cancel a booking on or after the pickup date' });
        }

        // We use soft-delete by changing status to keep a history log
        await db.execute('UPDATE bookings SET status = ? WHERE id = ?', ['Cancelled', bookingId]);
        
        return res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        next(error);
    }
};
