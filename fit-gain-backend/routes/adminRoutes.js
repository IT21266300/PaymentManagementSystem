const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');


router.post('/configure-gateways', auth, adminController.configurePaymentGateways);
router.get('/transactions', auth, adminController.monitorTransactions);
router.post('/refund/:transactionId', auth, adminController.issueRefund);
router.post('/cancel/:orderId', auth, adminController.processCancellation);
router.get('/reports', auth, adminController.generateFinancialReport);
router.post('/resolve/:transactionId', auth, adminController.resolvePaymentDispute);
router.put('/adjust-order/:orderId', auth, adminController.adjustOrderDetails);

module.exports = router;