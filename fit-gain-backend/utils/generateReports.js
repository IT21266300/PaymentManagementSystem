const Transaction = require('../models/Transaction');

const generateSalesReport = async () => {
  const transactions = await Transaction.find({ status: 'success' });
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  return { totalRevenue, transactionCount: transactions.length, transactions };
};

module.exports = { generateSalesReport };