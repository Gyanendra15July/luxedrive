const express = require('express');
const adminController = require('../controllers/adminController');
const carController = require('../controllers/carController');
const { authRequired, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authRequired, adminOnly, adminController.getStats);
router.get('/car-bookings', authRequired, adminOnly, adminController.getCarBookingCounts);

router.get('/cars', authRequired, adminOnly, adminController.listCars);
router.post('/cars', authRequired, adminOnly, carController.addCar);
router.put('/cars/:id', authRequired, adminOnly, carController.updateCar);
router.delete('/cars/:id', authRequired, adminOnly, carController.deleteCar);

module.exports = router;

