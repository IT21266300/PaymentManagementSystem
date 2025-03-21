const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { monitorTransactions, issueRefund, getSalesReport, adjustOrderDetails } = require('../controllers/adminController');

router.get('/transactions', adminAuth, monitorTransactions);
router.post('/refund', adminAuth, issueRefund);
router.get('/sales-report', adminAuth, getSalesReport);
router.put('/order-details', adminAuth, adjustOrderDetails);

module.exports = router;