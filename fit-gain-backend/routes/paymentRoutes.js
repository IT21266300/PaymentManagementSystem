const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { processPayment, cancelOrder } = require('../controllers/paymentController');

router.post('/process', auth, processPayment);
router.post('/cancel', auth, cancelOrder);

module.exports = router;