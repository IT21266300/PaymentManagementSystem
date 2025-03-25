const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const RefundRequest = require('../models/RefundRequest');
const fs = require('fs');
const path = require('path');

// Add a new payment method and create payment
exports.addPaymentMethod = async (req, res) => {
  try {
    console.log('Received payment method data:', req.body);
    console.log('Authenticated user ID:', req.user._id);
    
    const { accountNumber, amount } = req.body;
    const payment = new Payment({
      userId: req.user._id,
      accountNumber,
      amount,
    });
    await payment.save();
    console.log('Created payment:', payment);

    const transaction = new Transaction({
      paymentId: payment._id,
      userId: req.user._id,
      amount,
    });
    await transaction.save();
    console.log('Created transaction:', transaction);

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error in addPaymentMethod:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Upload payment evidence
// In your paymentController.js
exports.uploadEvidence = async (req, res) => {
  try {
    console.log('Upload request received. Files:', req.file); // Debug log
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No evidence file provided' });
    }

    const paymentId = req.body.paymentId;
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      // Clean up the uploaded file if payment not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Payment not found' });
    }

    // If there was previous evidence, delete it
    if (payment.evidence) {
      try {
        fs.unlinkSync(payment.evidence);
      } catch (err) {
        console.error('Error deleting old evidence:', err);
      }
    }

    payment.evidence = req.file.path;
    await payment.save();
    
    console.log('Evidence saved to payment:', payment); // Debug log
    res.json({ message: 'Evidence uploaded successfully', payment });
  } catch (error) {
    console.error('Error in uploadEvidence:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all transactions (for user or admin)
// In your paymentController.js
exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = req.user.isAdmin ? {} : { userId: req.user._id };
    const total = await Transaction.countDocuments(query);
    
    const transactions = await Transaction.find(query)
      .skip(skip)
      .limit(limit)
      .populate('paymentId');

    res.json({
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Confirm payment (admin only)
exports.confirmPayment = async (req, res) => {
  try {
    console.log(`Admin ${req.user._id} confirming payment ${req.params.id}`);
    
    if (!req.user.isAdmin) {
      console.warn('Non-admin attempt to confirm payment:', req.user);
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const payment = await Payment.findById(req.params.id);
    console.log('Payment found for confirmation:', payment);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    payment.status = 'confirmed';
    await payment.save();
    console.log('Updated payment status:', payment.status);

    const transaction = await Transaction.findOne({ paymentId: payment._id });
    transaction.status = 'completed';
    await transaction.save();
    console.log('Updated transaction status:', transaction.status);

    res.json({ message: 'Payment confirmed', payment });
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Reject payment (admin only)
exports.rejectPayment = async (req, res) => {
  try {
    console.log(`Admin ${req.user._id} rejecting payment ${req.params.id}`);
    
    if (!req.user.isAdmin) {
      console.warn('Non-admin attempt to reject payment:', req.user);
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const payment = await Payment.findById(req.params.id);
    console.log('Payment found for rejection:', payment);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    payment.status = 'rejected';
    await payment.save();
    console.log('Updated payment status:', payment.status);

    const transaction = await Transaction.findOne({ paymentId: payment._id });
    transaction.status = 'failed';
    await transaction.save();
    console.log('Updated transaction status:', transaction.status);

    res.json({ message: 'Payment rejected', payment });
  } catch (error) {
    console.error('Error in rejectPayment:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Issue refund (admin only)
exports.issueRefund = async (req, res) => {
  try {
    console.log(`Admin ${req.user._id} issuing refund for payment ${req.params.id}`);
    
    if (!req.user.isAdmin) {
      console.warn('Non-admin attempt to issue refund:', req.user);
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const payment = await Payment.findById(req.params.id);
    console.log('Payment status for refund:', payment?.status);
    
    if (!payment || payment.status !== 'confirmed') {
      console.warn('Invalid refund attempt:', { paymentExists: !!payment, status: payment?.status });
      return res.status(400).json({ message: 'Cannot refund unconfirmed payment' });
    }

    const refundTransaction = new Transaction({
      paymentId: payment._id,
      userId: payment.userId,
      amount: payment.amount,
      status: 'refunded',
      type: 'refund',
    });
    await refundTransaction.save();
    console.log('Created refund transaction:', refundTransaction);

    const originalTransaction = await Transaction.findOne({ paymentId: payment._id, type: 'payment' });
    originalTransaction.status = 'refunded';
    await originalTransaction.save();
    console.log('Updated original transaction:', originalTransaction);

    res.json({ message: 'Refund issued', refundTransaction });
  } catch (error) {
    console.error('Error in issueRefund:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get transaction report (admin only)
exports.getTransactionReport = async (req, res) => {
  try {
    console.log(`Admin ${req.user._id} requesting transaction report`);
    
    if (!req.user.isAdmin) {
      console.warn('Non-admin attempt to get report:', req.user);
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const transactions = await Transaction.find().populate('paymentId');
    console.log('Total transactions found for report:', transactions.length);
    
    const report = {
      totalPayments: transactions.filter(t => t.type === 'payment').length,
      totalRefunds: transactions.filter(t => t.type === 'refund').length,
      totalAmount: transactions.reduce((sum, t) => sum + (t.type === 'payment' ? t.amount : -t.amount), 0),
      pending: transactions.filter(t => t.status === 'pending').length,
      completed: transactions.filter(t => t.status === 'completed').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      refunded: transactions.filter(t => t.status === 'refunded').length,
    };
    
    console.log('Generated report:', report);
    
    res.json(report);
  } catch (error) {
    console.error('Error in getTransactionReport:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// paymentController.js - Add this new endpoint
exports.getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments();
    const payments = await Payment.find()
      .skip(skip)
      .limit(limit);

    res.json({
      payments,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.createRefundRequest = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;
    const transaction = await Transaction.findById(transactionId).populate('paymentId');
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    if (transaction.userId !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized to request refund for this transaction' });
    }
    if (transaction.status !== 'completed') {
      return res.status(400).json({ message: 'Can only request refunds for completed transactions' });
    }
    const existingRequest = await RefundRequest.findOne({ transactionId, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'A pending refund request already exists for this transaction' });
    }

    const refundRequest = new RefundRequest({
      transactionId,
      userId: req.user._id,
      reason,
    });
    await refundRequest.save();
    res.status(201).json({ message: 'Refund request submitted successfully', refundRequest });
  } catch (error) {
    console.error('Error creating refund request:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Fetch all refund requests (admin only)
exports.getRefundRequests = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const refundRequests = await RefundRequest.find()
      .populate({
        path: 'transactionId',
        populate: { path: 'paymentId' },
      })
      .lean();
    res.json(refundRequests);
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Approve or reject a refund request (admin only)
exports.handleRefundRequest = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { requestId, action } = req.body; // action: 'approve' or 'reject'
    const refundRequest = await RefundRequest.findById(requestId);
    if (!refundRequest) {
      return res.status(404).json({ message: 'Refund request not found' });
    }
    if (refundRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Refund request has already been processed' });
    }

    refundRequest.status = action === 'approve' ? 'approved' : 'rejected';
    await refundRequest.save();

    if (action === 'approve') {
      // Trigger the refund process
      const transaction = await Transaction.findById(refundRequest.transactionId).populate('paymentId');
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      const payment = transaction.paymentId;
      if (payment.status !== 'confirmed' && payment.status !== 'pending') {
        return res.status(400).json({ 
          message: `Cannot refund a payment with status "${payment.status}". Only "confirmed" or "pending" payments can be refunded.` 
        });
      }

      const refundTransaction = new Transaction({
        paymentId: payment._id,
        userId: payment.userId,
        amount: payment.amount,
        status: 'refunded',
        type: 'refund',
      });
      await refundTransaction.save();

      transaction.status = 'refunded';
      await transaction.save();
    }

    res.json({ message: `Refund request ${action} successfully`, refundRequest });
  } catch (error) {
    console.error('Error handling refund request:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};