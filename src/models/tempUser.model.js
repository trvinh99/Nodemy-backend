const mongoose = require('mongoose');
const validator = require('validator');

const NodemyResponseError = require('../utils/NodemyResponseError');

const User = require('./user.model');

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
    maxlength: 100,
  },
  fullname: {
    type: String,
    trim: true,
    required: true,
    minlength: 1,
    maxlength: 64,
  },
  activateToken: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 6,
  },
}, {
  timestamps: true,
});

tempUserSchema.methods.toJSON = function () {
  const tempUser = this;
  const tempUserObj = tempUser.toObject();

  delete tempUserObj.activateToken;
  delete tempUserObj.createdAt;
  delete tempUserObj.updatedAt;
  delete tempUserObj.__v;

  return tempUserObj;
};

tempUserSchema.statics.validateActivateToken = async (userId, token, password) => {
  const tempUser = await TempUser.findById(userId);
  if (!tempUser) {
    throw new NodemyResponseError(400, 'Activate token is expired!');
  }

  if (token !== tempUser.activateToken) {
    throw new NodemyResponseError(400, 'Activate token is not correct!');
  }

  if ((new Date()).valueOf > (new Date(tempUser.createdAt)).valueOf() + 600000) {
    throw new NodemyResponseError(400, 'Activate token is expired!');
  }

  const user = new User({
    email: tempUser.email,
    fullname: tempUser.fullname,
    password,
    accountHost: 'Nodemy',
  });
  await user.save();
  await tempUser.delete();

  return user;
};

const TempUser = mongoose.model('TempUser', tempUserSchema);
module.exports = TempUser;
