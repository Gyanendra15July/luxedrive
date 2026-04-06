const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authRequired } = require('../middleware/auth');

// All user routes must be protected
router.use(authRequired);

router.get('/profile', userController.getProfile);
router.put('/update', userController.updateProfile);
router.post('/upload-photo', userController.uploadPhoto);
router.post('/send-otp', userController.sendOtp);
router.post('/verify-otp', userController.verifyOtp);
router.delete('/delete', userController.deleteAccount);

module.exports = router;
