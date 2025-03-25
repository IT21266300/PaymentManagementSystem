const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  userId: { type: String, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RefundRequest', refundRequestSchema);