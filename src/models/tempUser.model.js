const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const tempUserSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid!');
      }
    },
  },
  fullname: {
    type: String,
    trim: true,
    required: true,
    minlength: 1,
    maxlength: 64,
  },
  password: {
    type: String,
    trim: true,
    minlength: 8,
  },
}, {
  timestamps: true,
});

tempUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

tempUserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const TempUser = mongoose.model('TempUser', tempUserSchema);
module.exports = TempUser;
