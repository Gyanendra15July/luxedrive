const db = require('../config/db');

function normalizeAvailability(status) {
    return status === 'unavailable' ? 'unavailable' : 'available';
}

function toInt(val) {
    const n = Number.parseInt(val, 10);
    return Number.isFinite(n) ? n : NaN;
}

// Get all cars from the database
exports.getAllCars = async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM cars WHERE availability_status = 'available' ORDER BY id DESC"
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching cars:', error);
        res.status(500).json({ message: 'Error fetching cars', error: error.message });
    }
};

exports.getCarById = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM cars WHERE id = ? LIMIT 1', [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: 'Car not found' });
        return res.json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching car', error: error.message });
    }
};

exports.addCar = async (req, res) => {
    try {
        const car_name = String(req.body.car_name || '').trim();
        const brand = String(req.body.brand || '').trim();
        const price_per_day = toInt(req.body.price_per_day);
        const image = String(req.body.image || '').trim();
        const description = String(req.body.description || '').trim();
        const type = String(req.body.type || 'Luxury').trim() || 'Luxury';
        const availability_status = normalizeAvailability(req.body.availability_status);

        if (!car_name || !brand || !Number.isFinite(price_per_day) || price_per_day <= 0) {
            return res.status(400).json({ message: 'car_name, brand, price_per_day are required' });
        }

        await db.execute(
            'INSERT INTO cars (car_name, brand, price_per_day, image, description, type, availability_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [car_name, brand, price_per_day, image, description, type, availability_status]
        );
        return res.status(201).json({ message: 'Car added successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error adding car', error: error.message });
    }
};

exports.updateCar = async (req, res) => {
    try {
        const carId = req.params.id;
        const [existingRows] = await db.execute('SELECT * FROM cars WHERE id = ? LIMIT 1', [carId]);
        if (!existingRows.length) return res.status(404).json({ message: 'Car not found' });
        const existing = existingRows[0];

        const car_name = String(req.body.car_name ?? existing.car_name ?? '').trim();
        const brand = String(req.body.brand ?? existing.brand ?? '').trim();
        const price_per_day = Number.isFinite(toInt(req.body.price_per_day))
            ? toInt(req.body.price_per_day)
            : toInt(existing.price_per_day);
        const image = String(req.body.image ?? existing.image ?? '').trim();
        const description = String(req.body.description ?? existing.description ?? '').trim();
        const type = String(req.body.type ?? existing.type ?? 'Luxury').trim() || 'Luxury';
        const availability_status = normalizeAvailability(
            req.body.availability_status ?? existing.availability_status
        );

        if (!car_name || !brand || !Number.isFinite(price_per_day) || price_per_day <= 0) {
            return res.status(400).json({ message: 'car_name, brand, price_per_day are required' });
        }

        await db.execute(
            'UPDATE cars SET car_name = ?, brand = ?, price_per_day = ?, image = ?, description = ?, type = ?, availability_status = ? WHERE id = ?',
            [car_name, brand, price_per_day, image, description, type, availability_status, carId]
        );
        return res.json({ message: 'Car updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating car', error: error.message });
    }
};

exports.deleteCar = async (req, res) => {
    try {
        const carId = req.params.id;

        const [cntRows] = await db.execute('SELECT COUNT(*) AS cnt FROM bookings WHERE car_id = ?', [
            carId
        ]);
        const cnt = cntRows && cntRows[0] ? cntRows[0].cnt : 0;
        if (cnt > 0) {
            return res.status(409).json({
                message: 'Car has existing bookings. Set availability to unavailable instead of deleting.'
            });
        }

        await db.execute('DELETE FROM cars WHERE id = ?', [carId]);
        return res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting car', error: error.message });
    }
};
