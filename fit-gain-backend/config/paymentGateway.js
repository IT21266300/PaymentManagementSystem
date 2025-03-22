// Mock payment gateway configuration
const paymentGateways = {
  stripe: {
    name: 'Stripe',
    active: true,
    processPayment: (amount, paymentMethod) => {
      // Simulate payment processing with a 90% success rate
      const success = Math.random() > 0.1;
      return {
        success,
        transactionId: success ? `stripe_${Date.now()}` : null,
        error: success ? null : 'Payment declined by Stripe',
      };
    },
  },
  paypal: {
    name: 'PayPal',
    active: true,
    processPayment: (amount, paymentMethod) => {
      // Simulate payment processing with an 85% success rate
      const success = Math.random() > 0.15;
      return {
        success,
        transactionId: success ? `paypal_${Date.now()}` : null,
        error: success ? null : 'PayPal payment failed',
      };
    },
  },
  bank_transfer: {
    name: 'Bank Transfer',
    active: true,
    processPayment: (amount, paymentMethod) => {
      // Simulate bank transfer with a 95% success rate
      const success = Math.random() > 0.05;
      return {
        success,
        transactionId: success ? `bank_${Date.now()}` : null,
        error: success ? null : 'Bank transfer rejected',
      };
    },
  },
};

// Function to get active gateways
const getActiveGateways = () => {
  return Object.keys(paymentGateways).filter(gateway => paymentGateways[gateway].active);
};

// Function to process payment using a specific gateway
const processPayment = (gateway, amount, paymentMethod) => {
  if (!paymentGateways[gateway] || !paymentGateways[gateway].active) {
    return { success: false, error: 'Payment gateway not available' };
  }
  return paymentGateways[gateway].processPayment(amount, paymentMethod);
};

// Function to configure gateways (e.g., enable/disable)
const configureGateways = (config) => {
  Object.keys(config).forEach(gateway => {
    if (paymentGateways[gateway]) {
      paymentGateways[gateway].active = config[gateway].active !== undefined ? config[gateway].active : paymentGateways[gateway].active;
    }
  });
  return getActiveGateways();
};

module.exports = {
  getActiveGateways,
  processPayment,
  configureGateways,
};