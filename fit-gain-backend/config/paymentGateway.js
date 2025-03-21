// Mock payment gateway configuration for academic purposes
const paymentGateways = ['card', 'bank'];

const processMockPayment = (amount, method) => {
  // Simulate payment processing
  return Math.random() > 0.1 ? 'success' : 'failed'; // 90% success rate
};

module.exports = { paymentGateways, processMockPayment };