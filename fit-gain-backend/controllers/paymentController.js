const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const User = require('../models/User');
const { processMockPayment } = require('../config/paymentGateway');
const { sendEmailNotification } = require('../utils/emailService');

const processPayment = async (req, res) => {
  const { email, orderId, paymentMethod, discountCode } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  let amount = order.totalAmount;
  if (discountCode) amount *= 0.9; // 10% discount mock

  const status = processMockPayment(amount, paymentMethod);
  const transaction = new Transaction({ user: user._id, order: order._id, amount, paymentMethod, status });
  await transaction.save();

  if (status === 'success') {
    user.billingHistory.push(transaction._id);
    order.status = 'completed';
    await user.save();
    await order.save();
    sendEmailNotification(email, 'Payment Confirmation', 'Your payment was successful!');
    res.json({ message: 'Payment processed successfully', transaction });
  } else {
    sendEmailNotification(email, 'Payment Failed', 'Payment failed. Please check your details and try again.');
    res.status(400).json({ message: 'Payment failed', transaction });
  }
};

const cancelOrder = async (req, res) => {
  const { email, orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order || order.user.toString() !== (await User.findOne({ email }))._id.toString())
    return res.status(404).json({ message: 'Order not found or unauthorized' });
  order.status = 'cancelled';
  await order.save();
  res.json({ message: 'Order cancelled', order });
};

const checkSubscriptions = async () => {
  const users = await User.find({ 'subscription.active': true });
  users.forEach(async user => {
    if (new Date() >= user.subscription.nextPaymentDate) {
      const status = processMockPayment(user.subscription.amount, user.paymentMethods[0]?.type || 'card');
      const transaction = new Transaction({
        user: user._id,
        amount: user.subscription.amount,
        paymentMethod: user.paymentMethods[0]?.type || 'card',
        status,
      });
      await transaction.save();
      user.billingHistory.push(transaction._id);
      user.subscription.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await user.save();
      sendEmailNotification(user.email, 'Subscription Payment', `Payment ${status === 'success' ? 'successful' : 'failed'}.`);
    } else if (new Date().getTime() + 24 * 60 * 60 * 1000 >= user.subscription.nextPaymentDate.getTime()) {
      sendEmailNotification(user.email, 'Payment Reminder', 'Your subscription payment is due soon.');
    }
  });
};

setInterval(checkSubscriptions, 24 * 60 * 60 * 1000); // Check daily

module.exports = { processPayment, cancelOrder };