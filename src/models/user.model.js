const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcrypt');

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
    minlength: 1,
    maxlength: 64,
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

const User = mongoose.model('User', userSchema);
module.exports = User;
