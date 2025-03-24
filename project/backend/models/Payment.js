const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Using string for demo (from frontend JSON)
  accountNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  evidence: { type: String }, // Path to uploaded file (PDF/image)
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);