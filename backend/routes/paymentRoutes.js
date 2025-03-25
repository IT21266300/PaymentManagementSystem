const express = require('express');
const router = express.Router();
const fs = require('fs'); 
const { protect } = require('../middleware/auth');
const {
  addPaymentMethod,
  uploadEvidence,
  getTransactions,
  confirmPayment,
  rejectPayment,
  issueRefund,
  getTransactionReport,
  getAllPayments,
  createRefundRequest, // New
  getRefundRequests,  // New
  handleRefundRequest,
} = require('../controllers/paymentController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  }
});

router.post('/method', protect, addPaymentMethod);
router.post('/evidence', protect, upload.single('evidence'), uploadEvidence);
router.get('/transactions', protect, getTransactions);
router.put('/confirm/:id', protect, confirmPayment); // Admin only
router.put('/reject/:id', protect, rejectPayment);   // Admin only
router.post('/refund/:id', protect, issueRefund);    // Admin only
router.get('/report', protect, getTransactionReport); // Admin only
router.get('/', protect, getAllPayments); 
router.post('/refund-request', protect, createRefundRequest); // New endpoint
router.get('/refund-requests', protect, getRefundRequests);  // New endpoint
router.post('/handle-refund-request', protect, handleRefundRequest); // New endpoint

module.exports = router;