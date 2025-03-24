const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  accountNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  evidence: { 
    type: String,
    validate: {
      validator: function(v) {
        // Simple check for path format
        return v === null || typeof v === 'string';
      },
      message: props => `${props.value} is not a valid file path!`
    }
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);