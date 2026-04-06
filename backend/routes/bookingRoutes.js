const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authRequired, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/book', authRequired, bookingController.createBooking);
router.get('/bookings', authRequired, bookingController.getMyBookings);
router.delete('/bookings/:id', authRequired, bookingController.cancelBooking);
router.get('/admin/bookings', authRequired, adminOnly, bookingController.getAllBookings);

module.exports = router;
