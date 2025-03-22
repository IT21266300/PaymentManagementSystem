const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', // Reference to the Order model
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0, // Ensures amount is non-negative
  },
  currency: {
    type: String,
    default: 'LKR', // Default currency, can be changed as needed
    enum: ['LKR', 'USD', 'INR'], // Restrict to specific currencies (optional)
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal'], // Supported payment methods
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'], // Transaction statuses
    default: 'pending',
  },
  transactionDate: {
    type: Date,
    default: Date.now, // Automatically set to current date/time
  },
  discountApplied: {
    type: Number,
    default: 0, // Amount of discount applied (e.g., from promo codes)
    min: 0,
  },
  isRecurring: {
    type: Boolean,
    default: false, // Indicates if this is part of a subscription
  },
  recurringInterval: {
    type: String,
    enum: ['monthly', 'yearly', null], // For recurring payments, if applicable
    default: null,
  },
  errorMessage: {
    type: String,
    default: null, // Stores error details for failed transactions
  },
  invoiceId: {
    type: String,
    unique: true, // Unique identifier for the invoice
    sparse: true, // Allows null values while maintaining uniqueness
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Index for faster queries on userId and orderId
transactionSchema.index({ userId: 1, orderId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;