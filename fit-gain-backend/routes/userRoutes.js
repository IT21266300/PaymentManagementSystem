const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.post('/payment-methods', auth, userController.addPaymentMethod);
router.put('/payment-methods', auth, userController.updatePaymentMethod);
router.delete('/payment-methods/:paymentMethodId', auth, userController.removePaymentMethod);
router.get('/payment-methods', auth, userController.getPaymentMethods);
router.put('/billing-address', auth, userController.updateBillingAddress);
router.get('/billing-address', auth, userController.getBillingAddress);
router.get('/profile', auth, userController.getProfile);

module.exports = router;