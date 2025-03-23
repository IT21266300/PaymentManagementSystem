const express = require('express');
const router = express.Router();
const {
  loginUser,
  addPaymentMethod,
  updatePaymentMethod,
  removePaymentMethod,
  getPaymentMethods,
  updateBillingAddress,
  getBillingAddress,
  getProfile,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); // Assuming you have this

router.post('/login', loginUser);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, getProfile);
router.post('/payment-methods', authMiddleware, addPaymentMethod);
router.put('/payment-methods', authMiddleware, updatePaymentMethod);
router.delete('/payment-methods/:paymentMethodId', authMiddleware, removePaymentMethod);
router.get('/payment-methods', authMiddleware, getPaymentMethods);
router.put('/billing-address', authMiddleware, updateBillingAddress);
router.get('/billing-address', authMiddleware, getBillingAddress);

module.exports = router;