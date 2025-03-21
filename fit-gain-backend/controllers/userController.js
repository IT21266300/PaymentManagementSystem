const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { sendEmailNotification } = require('../utils/emailService');

const addPaymentMethod = async (req, res) => {
  const { email, type, details } = req.body;
  const user = await User.findOne({ email }) || new User({ email });
  user.paymentMethods.push({ type, details });
  await user.save();
  res.status(201).json({ message: 'Payment method added', paymentMethods: user.paymentMethods });
};

const updatePaymentMethod = async (req, res) => {
  const { email, oldDetails, newType, newDetails } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const index = user.paymentMethods.findIndex(pm => pm.details === oldDetails);
  if (index === -1) return res.status(404).json({ message: 'Payment method not found' });
  user.paymentMethods[index] = { type: newType, details: newDetails };
  await user.save();
  res.json({ message: 'Payment method updated', paymentMethods: user.paymentMethods });
};

const removePaymentMethod = async (req, res) => {
  const { email, details } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.paymentMethods = user.paymentMethods.filter(pm => pm.details !== details);
  await user.save();
  res.json({ message: 'Payment method removed', paymentMethods: user.paymentMethods });
};

const getBillingDetails = async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email }).populate('billingHistory');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ billingHistory: user.billingHistory });
};

const setupRecurringPayment = async (req, res) => {
  const { email, amount } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.subscription = {
    active: true,
    nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    amount,
  };
  await user.save();
  sendEmailNotification(email, 'Subscription Setup', 'Your recurring payment is set up!');
  res.json({ message: 'Recurring payment set up', subscription: user.subscription });
};

module.exports = { addPaymentMethod, updatePaymentMethod, removePaymentMethod, getBillingDetails, setupRecurringPayment };