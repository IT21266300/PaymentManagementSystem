const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth'); // Authentication middleware

// Customer Routes
router.post('/process', auth, paymentController.processPayment); // Process a payment for an order
router.post('/recurring/setup', auth, paymentController.setupRecurringPayment); // Set up recurring payment
router.put('/recurring/cancel', auth, paymentController.cancelRecurringPayment); // Cancel recurring payment
router.get('/history', auth, paymentController.getPaymentHistory); // View transaction history
router.post('/cancel/:orderId', auth, paymentController.cancelOrder); // Cancel an order and request refund

// Admin Routes
router.get('/admin/transactions', auth, paymentController.getAllTransactions); // Monitor all transactions
router.post('/admin/refund/:transactionId', auth, paymentController.issueRefund); // Issue a refund
router.get('/admin/reports', auth, paymentController.generatePaymentReport); // Generate sales/transaction report
router.post('/admin/resolve/:transactionId', auth, paymentController.resolvePaymentIssue); // Resolve failed transaction

module.exports = router;