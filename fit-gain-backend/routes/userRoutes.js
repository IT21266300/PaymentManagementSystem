const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { addPaymentMethod, updatePaymentMethod, removePaymentMethod, getBillingDetails, setupRecurringPayment } = require('../controllers/userController');

router.post('/payment-methods', auth, addPaymentMethod);
router.put('/payment-methods', auth, updatePaymentMethod);
router.delete('/payment-methods', auth, removePaymentMethod);
router.get('/billing', auth, getBillingDetails);
router.post('/subscription', auth, setupRecurringPayment);

module.exports = router;