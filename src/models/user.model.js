const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  fullname: {
    type: String,
    trim: true,
    required: true,
  },
  accountType: {
    type: String,
    required: true,
    validate(value) {
      if (value !== 'Nodemy' && value !== 'Google') {
        throw new Error('Account type is invalid!');
      }
    },
  },
  password: {
    type: String,
    trim: true,
    minlength: 8,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
