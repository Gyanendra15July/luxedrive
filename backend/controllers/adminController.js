const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const [[usersRow]] = await db.execute('SELECT COUNT(*) AS total_users FROM users');
        const [[carsRow]] = await db.execute('SELECT COUNT(*) AS total_cars FROM cars');
        const [[bookingsRow]] = await db.execute('SELECT COUNT(*) AS total_bookings FROM bookings');

        const [mostBookedRows] = await db.execute(
            `SELECT c.id, c.car_name, c.brand, c.type, COUNT(b.id) AS bookings_count
             FROM bookings b
             JOIN cars c ON c.id = b.car_id
             GROUP BY c.id, c.car_name, c.brand, c.type
             ORDER BY bookings_count DESC
             LIMIT 1`
        );

        const most_booked_car = mostBookedRows.length
            ? {
                  id: mostBookedRows[0].id,
                  car_name: mostBookedRows[0].car_name,
                  brand: mostBookedRows[0].brand,
                  type: mostBookedRows[0].type,
                  bookings_count: mostBookedRows[0].bookings_count
              }
            : null;

        return res.json({
            total_users: usersRow.total_users,
            total_cars: carsRow.total_cars,
            total_bookings: bookingsRow.total_bookings,
            most_booked_car
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
    }
};

exports.getCarBookingCounts = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT c.id AS car_id, c.car_name, c.brand, c.type, c.availability_status,
                    COUNT(b.id) AS bookings_count,
                    COUNT(DISTINCT b.user_id) AS unique_users_count
             FROM cars c
             LEFT JOIN bookings b ON b.car_id = c.id
             GROUP BY c.id, c.car_name, c.brand, c.type, c.availability_status
             ORDER BY bookings_count DESC, c.id DESC`
        );
        return res.json(rows);
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error fetching car booking counts', error: error.message });
    }
};

exports.listCars = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM cars ORDER BY id DESC');
        return res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching cars', error: error.message });
    }
};

