const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  picture: {
    type: String
  },
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);