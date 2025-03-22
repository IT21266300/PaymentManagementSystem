const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Order = require('../models/Order');
const { sendEmail } = require('../utils/emailService'); // Mock email utility
const { processPayment } = require('../config/paymentGateway');

// Mock payment gateway function (for academic purposes)
const mockPaymentGateway = (amount, paymentMethod) => {
  return Math.random() > 0.1 // 90% success rate for simulation
    ? { success: true, transactionId: `mock_${Date.now()}` }
    : { success: false, error: 'Payment declined' };
};

// Process a payment for an order
exports.processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethodId, gateway } = req.body;
    const user = await User.findById(req.user.id); // Assumes req.user from auth middleware
    const order = await Order.findById(orderId);
    if (!order || order.userId.toString() !== user._id.toString()) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const paymentMethod = user.paymentMethods.id(paymentMethodId);
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method not found' });
    }

    const paymentResult = processPayment(gateway || 'stripe', order.finalAmount, paymentMethod.methodType);
    const transaction = new Transaction({
      userId: user._id,
      orderId: order._id,
      amount: order.finalAmount,
      paymentMethod: paymentMethod.methodType,
      status: paymentResult.success ? 'completed' : 'failed',
      errorMessage: paymentResult.error,
    });

    await transaction.save();
    
    if (paymentResult.success) {
      order.transactionId = transaction._id;
      order.status = 'processing';
      await order.save();
      sendEmail(user.email, 'Payment Confirmation', `Your payment of $${order.finalAmount} was successful!`);
    } else {
      sendEmail(user.email, 'Payment Failed', `Error: ${paymentResult.error}. Please try again.`);
    }

    res.status(200).json({ message: paymentResult.success ? 'Payment successful' : 'Payment failed', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set up recurring payment
exports.setupRecurringPayment = async (req, res) => {
  try {
    const { paymentMethodId, plan } = req.body; // 'monthly' or 'yearly'
    const user = await User.findById(req.user.id);

    const paymentMethod = user.paymentMethods.id(paymentMethodId);
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method not found' });
    }

    user.subscription.isActive = true;
    user.subscription.plan = plan;
    user.subscription.nextPaymentDate = new Date(Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000);
    await user.save();

    res.status(200).json({ message: `Recurring ${plan} payment set up successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel recurring payment
exports.cancelRecurringPayment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.subscription.isActive) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    user.subscription.isActive = false;
    user.subscription.plan = null;
    user.subscription.nextPaymentDate = null;
    await user.save();

    res.status(200).json({ message: 'Recurring payment cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).populate('orderId', 'items finalAmount');
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order || order.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: 'Order not found' });
    }

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

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const transactions = await Transaction.find().populate('userId', 'email fullName').populate('orderId', 'finalAmount');
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Issue a refund
exports.issueRefund = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const transaction = await Transaction.findById(req.params.transactionId).populate('userId', 'email');
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

// Admin: Generate payment report
exports.generatePaymentReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const transactions = await Transaction.find();
    const totalRevenue = transactions.reduce((sum, t) => t.status === 'completed' ? sum + t.amount : sum, 0);
    const report = {
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(t => t.status === 'completed').length,
      totalRevenue,
      failedTransactions: transactions.filter(t => t.status === 'failed').length,
    };
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Resolve payment issue
exports.resolvePaymentIssue = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const { resolution } = req.body; // e.g., "Retry payment" or "Contact support"
    const transaction = await Transaction.findById(req.params.transactionId).populate('userId', 'email');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.status !== 'failed') {
      return res.status(400).json({ message: 'Can only resolve failed transactions' });
    }

    transaction.errorMessage = `${transaction.errorMessage} - Resolved: ${resolution}`;
    await transaction.save();

    sendEmail(transaction.userId.email, 'Payment Issue Resolved', `Your payment issue has been resolved: ${resolution}`);
    res.status(200).json({ message: 'Payment issue resolved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};