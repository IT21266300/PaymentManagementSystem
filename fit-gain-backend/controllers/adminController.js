const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { generateSalesReport } = require('../utils/generateReports');

const monitorTransactions = async (req, res) => {
  const transactions = await Transaction.find().populate('user order');
  const suspicious = transactions.filter(t => t.amount > 1000); // Mock fraud detection
  res.json({ transactions, suspicious });
};

const issueRefund = async (req, res) => {
  const { transactionId } = req.body;
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
  transaction.status = 'failed';
  const order = await Order.findById(transaction.order);
  order.status = 'cancelled';
  await transaction.save();
  await order.save();
  res.json({ message: 'Refund issued', transaction });
};

const getSalesReport = async (req, res) => {
  const report = await generateSalesReport();
  res.json(report);
};

const adjustOrderDetails = async (req, res) => {
  const { orderId, taxes, shippingFee, discountCode } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.taxes = taxes || order.taxes;
  order.shippingFee = shippingFee || order.shippingFee;
  order.discountCode = discountCode || order.discountCode;
  order.totalAmount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + order.taxes + order.shippingFee;
  if (order.discountCode) order.totalAmount *= 0.9; // 10% discount mock
  await order.save();
  res.json({ message: 'Order details adjusted', order });
};

module.exports = { monitorTransactions, issueRefund, getSalesReport, adjustOrderDetails };