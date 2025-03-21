const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  paymentMethods: [
    {
      type: { type: String, enum: ['card', 'bank'], required: true },
      details: { type: String, required: true },
    },
  ],
  billingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  subscription: {
    active: { type: Boolean, default: false },
    nextPaymentDate: { type: Date },
    amount: { type: Number },
  },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);