const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  methodType: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal'], // Supported payment methods
  },
  cardNumberLastFour: { // For display purposes (e.g., "ending in 1234")
    type: String,
    match: /^\d{4}$/, // Ensures it’s exactly 4 digits
    required: function() { return this.methodType !== 'bank_transfer'; },
  },
  bankAccountNumberLastFour: { // For bank transfers
    type: String,
    match: /^\d{4}$/,
    required: function() { return this.methodType === 'bank_transfer'; },
  },
  isDefault: {
    type: Boolean,
    default: false, // Marks the default payment method for faster checkout
  },
  addedOn: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate emails
    match: [/.+\@.+\..+/, 'Please enter a valid email address'], // Basic email validation
  },
  fullName: {
    type: String,
    required: true,
  },
  password: { // Hashed password (for auth purposes)
    type: String,
    required: true,
  },
  paymentMethods: [paymentMethodSchema], // Array of payment methods
  billingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  loyaltyPoints: {
    type: Number,
    default: 0, // For applying loyalty rewards during checkout
    min: 0,
  },
  subscription: {
    isActive: {
      type: Boolean,
      default: false, // Indicates if user has a recurring subscription
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly', null],
      default: null,
    },
    nextPaymentDate: {
      type: Date,
      default: null, // For automated reminders
    },
  },
  role: {
    type: String,
    enum: ['customer', 'admin'], // Differentiates between customers and admins
    default: 'customer',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Ensure only one payment method is default
userSchema.pre('save', function(next) {
  if (this.paymentMethods.length > 0) {
    const defaultMethod = this.paymentMethods.find(method => method.isDefault);
    if (defaultMethod) {
      this.paymentMethods.forEach(method => {
        if (method._id !== defaultMethod._id) method.isDefault = false;
      });
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;