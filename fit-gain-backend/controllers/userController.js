const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a new payment method
exports.addPaymentMethod = async (req, res) => {
  try {
    const { methodType, cardNumberLastFour, bankAccountNumberLastFour, isDefault } = req.body;
    const user = await User.findById(req.user.id); // Assumes req.user from auth middleware

    const newPaymentMethod = {
      methodType,
      cardNumberLastFour: methodType !== 'bank_transfer' ? cardNumberLastFour : undefined,
      bankAccountNumberLastFour: methodType === 'bank_transfer' ? bankAccountNumberLastFour : undefined,
      isDefault: isDefault || user.paymentMethods.length === 0, // First method is default if not specified
    };

    user.paymentMethods.push(newPaymentMethod);
    await user.save();

    res.status(201).json({ message: 'Payment method added successfully', paymentMethod: newPaymentMethod });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a payment method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId, methodType, cardNumberLastFour, bankAccountNumberLastFour, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    const paymentMethod = user.paymentMethods.id(paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    paymentMethod.methodType = methodType || paymentMethod.methodType;
    paymentMethod.cardNumberLastFour = methodType !== 'bank_transfer' ? (cardNumberLastFour || paymentMethod.cardNumberLastFour) : undefined;
    paymentMethod.bankAccountNumberLastFour = methodType === 'bank_transfer' ? (bankAccountNumberLastFour || paymentMethod.bankAccountNumberLastFour) : undefined;
    if (isDefault !== undefined) paymentMethod.isDefault = isDefault;

    await user.save();
    res.status(200).json({ message: 'Payment method updated successfully', paymentMethod });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove a payment method
exports.removePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const user = await User.findById(req.user.id);

    const paymentMethod = user.paymentMethods.id(paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    user.paymentMethods.pull(paymentMethodId);
    await user.save();

    res.status(200).json({ message: 'Payment method removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user.paymentMethods);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update billing address
exports.updateBillingAddress = async (req, res) => {
  try {
    const { street, city, state, postalCode, country } = req.body;
    const user = await User.findById(req.user.id);

    user.billingAddress = {
      street: street || user.billingAddress.street,
      city: city || user.billingAddress.city,
      state: state || user.billingAddress.state,
      postalCode: postalCode || user.billingAddress.postalCode,
      country: country || user.billingAddress.country,
    };

    await user.save();
    res.status(200).json({ message: 'Billing address updated successfully', billingAddress: user.billingAddress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get billing address
exports.getBillingAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user.billingAddress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile (basic info)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;