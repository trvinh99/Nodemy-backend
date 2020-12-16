const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');

const RefreshToken = require('./refreshToken.model');

const userSchema = new mongoose.Schema({
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
    maxlength: 36,
  },
  accountHost: {
    type: String,
    required: true,
    validate(value) {
      if (value !== 'Nodemy' && value !== 'Google') {
        throw new Error('Account host is invalid!');
      }
    },
  },
  password: {
    type: String,
    trim: true,
    minlength: 8,
  },
  avatar: {
    type: Buffer,
    required: true,
    default: Buffer.from('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', 'base64'),
  },
  accountType: {
    type: String,
    required: true,
    validate(value) {
      if (value !== 'Student' && value !== 'Teacher' && value !== 'Admin') {
        throw new Error('Account type is invalid!');
      }
    },
    default: 'Student',
  },
  wishlist: [{
    courseId: {
      type: String,
      trim: true,
    },
  }],
  boughtCourses: [{
    courseId: {
      type: String,
      trim: true,
    },
    currentWatchingLecture: {
      type: String,
      trim: true,
    },
    currentWatchingTimepoint: {
      type: Number,
      min: 0,
    },
  }],
  isActivated: {
    type: Boolean,
    required: true,
    default: false,
  },
  activateToken: {
    token: {
      type: String,
      minlength: 6,
      maxlength: 6,
    },
    expiredAt: {
      type: Number,
    },
  },
}, {
  timestamps: true,
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.activateToken;
  delete userObject.avatar;
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject.__v;

  userObject.avatar = `${process.env.HOST}/users/${user._id.toString()}/avatar`;

  return userObject;
};

userSchema.statics.generateAccessToken = async (refreshToken = '') => {
  const userId = await RefreshToken.validateRefreshToken(refreshToken);
  const user = await User.findById(userId);
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "1800000", // 30 min in ms
  });

  return token;
};

// validate account that belongs to Nodemy
userSchema.statics.findByCredentials = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error();
    }

    if (user.accountHost === 'Google') {
      throw new Error();
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error();
    }

    return user;
  }
  catch {
    throw new Error('Unable to login!');
  }
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  if (user.accountHost === 'Google') {
    delete user.password;
  }

  next();
});

userSchema.statics.generateResetPasswordToken = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error();
    }

    const token = jwt.sign({ _id: user._id.toString(), usage: 'reset' }, process.env.JWT_SECRET, { expiresIn: "600000" });

    return token;
  }
  catch {
    throw new Error('Found no user!');
  }
};

userSchema.statics.generateActivateToken = async (userId) => {
  let user;

  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  }
  catch {
    throw new Error('Found no user!');
  }

  if (user.isActivated) {
    throw new Error('Can not generate activate token for an activated user!');
  }

  const token = randToken.generate(6, '0123456789');
  const expiredAt = (new Date()).valueOf() + 600000;

  user.activateToken = { token, expiredAt };
  await user.save();

  return {
    token,
    email: user.email,
  };
};

userSchema.statics.validateActivateToken = async (userId, token) => {
  let user;

  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  }
  catch {
    throw new Error('Found no user!');
  }

  if (user.isActivated) {
    return true;
  }

  if (typeof user.activateToken !== 'object') {
    throw new Error('Activate token is not generated!');
  }

  if (user.activateToken.token !== token) {
    throw new Error('Activate token is not correct!');
  }

  const current = (new Date()).valueOf();
  if (current > user.activateToken.expiredAt) {
    throw new Error('Activate token is expired!');
  }

  user.isActivated = true;
  user.activateToken = undefined; // remove activateToken field from this user
  await user.save();
  return true;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
