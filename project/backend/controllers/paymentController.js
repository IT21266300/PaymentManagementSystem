const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const fs = require('fs');
const path = require('path');

// Add a new payment method and create payment
exports.addPaymentMethod = async (req, res) => {
  try {
    const { accountNumber, amount } = req.body;
    const payment = new Payment({
      userId: req.user._id,
      accountNumber,
      amount,
    });
    await payment.save();

    const transaction = new Transaction({
      paymentId: payment._id,
      userId: req.user._id,
      amount,
    });
    await transaction.save();

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Upload payment evidence
exports.uploadEvidence = async (req, res) => {
  try {
    const paymentId = req.body.paymentId;
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.userId !== req.user._id) {
      return res.status(404).json({ message: 'Payment not found or unauthorized' });
    }
    payment.evidence = req.file.path;
    await payment.save();
    res.json({ message: 'Evidence uploaded successfully', payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all transactions (for user or admin)
exports.getTransactions = async (req, res) => {
  try {
    const query = req.user.isAdmin ? {} : { userId: req.user._id };
    const transactions = await Transaction.find(query).populate('paymentId');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Confirm payment (admin only)
exports.confirmPayment = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    payment.status = 'confirmed';
    await payment.save();

    const transaction = await Transaction.findOne({ paymentId: payment._id });
    transaction.status = 'completed';
    await transaction.save();

    res.json({ message: 'Payment confirmed', payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Reject payment (admin only)
exports.rejectPayment = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    payment.status = 'rejected';
    await payment.save();

    const transaction = await Transaction.findOne({ paymentId: payment._id });
    transaction.status = 'failed';
    await transaction.save();

    res.json({ message: 'Payment rejected', payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Issue refund (admin only)
exports.issueRefund = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const payment = await Payment.findById(req.params.id);
    if (!payment || payment.status !== 'confirmed') {
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

    const originalTransaction = await Transaction.findOne({ paymentId: payment._id, type: 'payment' });
    originalTransaction.status = 'refunded';
    await originalTransaction.save();

    res.json({ message: 'Refund issued', refundTransaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get transaction report (admin only)
exports.getTransactionReport = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const transactions = await Transaction.find().populate('paymentId');
    const report = {
      totalPayments: transactions.filter(t => t.type === 'payment').length,
      totalRefunds: transactions.filter(t => t.type === 'refund').length,
      totalAmount: transactions.reduce((sum, t) => sum + (t.type === 'payment' ? t.amount : -t.amount), 0),
      pending: transactions.filter(t => t.status === 'pending').length,
      completed: transactions.filter(t => t.status === 'completed').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      refunded: transactions.filter(t => t.status === 'refunded').length,
    };
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};