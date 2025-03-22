const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Order = require('../models/Order');
const { sendEmail } = require('../utils/emailService'); // Mock email utility
const { configureGateways, getActiveGateways } = require('../config/paymentGateway');

exports.configurePaymentGateways = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const { gateways } = req.body; // e.g., { stripe: { active: false }, paypal: { active: true } }

    const updatedGateways = configureGateways(gateways);
    res.status(200).json({ message: 'Payment gateways configured successfully', acceptedGateways: updatedGateways });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Monitor all transactions
exports.monitorTransactions = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const transactions = await Transaction.find()
      .populate('userId', 'email fullName')
      .populate('orderId', 'items finalAmount status');

    // Basic fraud detection (e.g., multiple failed transactions from same user)
    const suspicious = transactions.filter(t => t.status === 'failed').reduce((acc, t) => {
      acc[t.userId] = (acc[t.userId] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({ transactions, suspiciousUsers: Object.keys(suspicious).filter(id => suspicious[id] > 2) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Issue a refund
exports.issueRefund = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId).populate('userId', 'email');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status !== 'completed') {
      return res.status(400).json({ message: 'Cannot refund non-completed transaction' });
    }

    transaction.status = 'refunded';
    await transaction.save();

    const order = await Order.findById(transaction.orderId);
    if (order) {
      order.status = 'refunded';
      await order.save();
    }

    sendEmail(transaction.userId.email, 'Refund Issued', `Your refund of $${transaction.amount} has been processed.`);
    res.status(200).json({ message: 'Refund issued successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Process a cancellation
exports.processCancellation = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('userId', 'email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel shipped or delivered order' });
    }

    order.status = 'cancelled';
    await order.save();

    if (order.transactionId) {
      const transaction = await Transaction.findById(order.transactionId);
      transaction.status = 'cancelled';
      await transaction.save();
    }

    sendEmail(order.userId.email, 'Order Cancelled', `Your order #${orderId} has been cancelled.`);
    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate financial reports
exports.generateFinancialReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const transactions = await Transaction.find();

    const report = {
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => t.status === 'completed' ? sum + t.amount : sum, 0),
      totalRefunds: transactions.reduce((sum, t) => t.status === 'refunded' ? sum + t.amount : sum, 0),
      completedTransactions: transactions.filter(t => t.status === 'completed').length,
      failedTransactions: transactions.filter(t => t.status === 'failed').length,
      cancelledOrders: (await Order.find({ status: 'cancelled' })).length,
    };

    res.status(200).json({ message: 'Financial report generated', report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Resolve payment dispute or failed transaction
exports.resolvePaymentDispute = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const { transactionId } = req.params;
    const { resolution } = req.body; // e.g., "Retry payment" or "Contact support"

    const transaction = await Transaction.findById(transactionId).populate('userId', 'email');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status !== 'failed') {
      return res.status(400).json({ message: 'Can only resolve failed transactions' });
    }

    transaction.errorMessage = `${transaction.errorMessage} - Resolved: ${resolution}`;
    await transaction.save();

    sendEmail(transaction.userId.email, 'Payment Issue Resolved', `Your payment issue has been resolved: ${resolution}`);
    res.status(200).json({ message: 'Payment dispute resolved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Adjust taxes, shipping fees, or discounts for an order
exports.adjustOrderDetails = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const { orderId } = req.params;
    const { taxAmount, shippingFee, discountApplied } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.taxAmount = taxAmount !== undefined ? taxAmount : order.taxAmount;
    order.shippingFee = shippingFee !== undefined ? shippingFee : order.shippingFee;
    order.discountApplied = discountApplied !== undefined ? discountApplied : order.discountApplied;

    await order.save(); // pre-save hook recalculates finalAmount
    res.status(200).json({ message: 'Order details adjusted', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;