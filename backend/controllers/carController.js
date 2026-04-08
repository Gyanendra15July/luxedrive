const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getAllCars = async (req, res) => {
    try {
        const [cars] = await db.execute('SELECT * FROM cars');
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addCar = async (req, res) => {
    try {
        const { name, price_per_day, description } = req.body;
        const image = req.file ? req.file.filename : null;
        
        const [result] = await db.execute(
            'INSERT INTO cars (name, image, price_per_day, description) VALUES (?, ?, ?, ?)',
            [name, image, price_per_day, description]
        );
        
        res.status(201).json({ message: "Car added successfully", carId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCar = async (req, res) => {
    try {
        const { name, price_per_day, description, available } = req.body;
        const carId = req.params.id;
        
        let query = 'UPDATE cars SET name=?, price_per_day=?, description=?, available=?';
        let params = [name, price_per_day, description, available];
        
        if (req.file) {
            query += ', image=?';
            params.push(req.file.filename);
        }
        
        query += ' WHERE id=?';
        params.push(carId);
        
        await db.execute(query, params);
        res.json({ message: "Car updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCar = async (req, res) => {
    try {
        const carId = req.params.id;
        await db.execute('DELETE FROM cars WHERE id = ?', [carId]);
        res.json({ message: "Car deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
