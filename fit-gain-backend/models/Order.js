const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Hypothetical Product model for gym equipment/supplements
    required: true,
  },
  productName: {
    type: String,
    required: true, // Stored for reference even if Product is deleted
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0, // Price per unit at the time of purchase
  },
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to User model
    required: true,
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction', // Links to Transaction model
    required: false, // Set after payment is processed
  },
  items: [orderItemSchema], // Array of purchased items
  totalAmount: {
    type: Number,
    required: true,
    min: 0, // Total before discounts/taxes
  },
  discountApplied: {
    type: Number,
    default: 0, // Discount from promo codes or loyalty points
    min: 0,
  },
  taxAmount: {
    type: Number,
    default: 0, // Tax calculated during checkout
    min: 0,
  },
  shippingFee: {
    type: Number,
    default: 0, // Shipping cost
    min: 0,
  },
  finalAmount: {
    type: Number,
    required: true, // Total after discounts, taxes, and shipping
    min: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending', // Tracks order lifecycle
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  orderDate: {
    type: Date,
    default: Date.now, // When the order was placed
  },
  promoCode: {
    type: String,
    default: null, // Optional promo code applied
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Calculate finalAmount before saving
orderSchema.pre('save', function(next) {
  this.finalAmount = (this.totalAmount - this.discountApplied) + this.taxAmount + this.shippingFee;
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;