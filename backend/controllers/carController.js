const db = require('../config/db');
const path = require('path');

// GET /api/cars  (public)
exports.getAllCars = async (req, res) => {
    try {
        console.log('[API HIT] GET /api/cars');
        const [cars] = await db.execute('SELECT * FROM cars ORDER BY id DESC');
        console.log(`[CARS] Returning ${cars.length} cars`);
        res.json(cars);
    } catch (error) {
        console.error('[CARS ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/cars  (admin only)
exports.addCar = async (req, res) => {
    try {
        const { name, price_per_day, description } = req.body;
        if (!name || !price_per_day) {
            return res.status(400).json({ message: 'Name and price are required' });
        }
        // Image path relative to /uploads served by express static
        const image = req.file ? req.file.filename : null;

        const [result] = await db.execute(
            'INSERT INTO cars (name, image, price_per_day, description) VALUES (?, ?, ?, ?)',
            [name, image, price_per_day, description || null]
        );
        console.log(`[CARS] Added car: ${name}`);
        res.status(201).json({ message: 'Car added successfully', carId: result.insertId });
    } catch (error) {
        console.error('[ADD CAR ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/cars/:id  (admin only)
exports.updateCar = async (req, res) => {
    try {
        const { name, price_per_day, description, available } = req.body;
        const carId = req.params.id;

        let query = 'UPDATE cars SET name=?, price_per_day=?, description=?, available=?';
        let params = [name, price_per_day, description, available == null ? 1 : available];

        if (req.file) {
            query += ', image=?';
            params.push(req.file.filename);
        }
        query += ' WHERE id=?';
        params.push(carId);

        await db.execute(query, params);
        res.json({ message: 'Car updated successfully' });
    } catch (error) {
        console.error('[UPDATE CAR ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/cars/:id  (admin only)
exports.deleteCar = async (req, res) => {
    try {
        const carId = req.params.id;
        await db.execute('DELETE FROM cars WHERE id = ?', [carId]);
        console.log(`[CARS] Deleted car id: ${carId}`);
        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        console.error('[DELETE CAR ERROR]', error.message);
        res.status(500).json({ message: error.message });
    }
};
