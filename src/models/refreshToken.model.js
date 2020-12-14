const mongoose = require('mongoose');
const randToken = require('rand-token');

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  expiredAt: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

refreshTokenSchema.methods.toJSON = function () {
  const refreshToken = this;
  const refreshTokenObject = refreshToken.toObject();

  delete refreshToken.createdAt;
  delete refreshToken.updatedAt;
  delete refreshToken.__v;

  return refreshTokenObject;
};

refreshTokenSchema.statics.generateRefreshToken = async (user) => {
  const token = randToken.generate(64);
  const expiredAt = (new Date()).valueOf() + 31536000000; // 1 year in miliseconds
  const refreshToken = new RefreshToken({
    userId: user._id.toString(),
    token,
    expiredAt,
  });
  await refreshToken.save();

  return {
    token,
    expiredAt,
  };
};

refreshTokenSchema.statics.validateRefreshToken = async (token = '') => {
  try {
    if (typeof token !== 'string' || token.length !== 64) {
      throw new Error();
    }

    const refreshToken = await RefreshToken.findOne({ token });
    if (!refreshToken) {
      throw new Error();
    }

    const current = (new Date()).valueOf();
    if (current >= refreshToken.expiredAt - 60000) {
      await refreshToken.delete(); // delete if it is going to be expired soon
      throw new Error();
    }

    return refreshToken.userId;
  }
  catch {
    throw new Error('Refresh token is invalid!');
  }
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;
