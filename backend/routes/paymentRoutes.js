const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addPaymentMethod,
  uploadEvidence,
  getTransactions,
  confirmPayment,
  rejectPayment,
  issueRefund,
  getTransactionReport,
} = require('../controllers/paymentController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post('/method', protect, addPaymentMethod);
router.post('/evidence', protect, upload.single('evidence'), uploadEvidence);
router.get('/transactions', protect, getTransactions);
router.put('/confirm/:id', protect, confirmPayment); // Admin only
router.put('/reject/:id', protect, rejectPayment);   // Admin only
router.post('/refund/:id', protect, issueRefund);    // Admin only
router.get('/report', protect, getTransactionReport); // Admin only

module.exports = router;