const express = require('express');
const { createMessage } = require('../controllers/contactController');

const router = express.Router();

router.post('/contact', createMessage);

module.exports = router;

