const RefreshToken = require('../models/refreshToken.model');

const authorization = async (req, res, next) => {
  try {
    let token = req.header('Nodemy-Authorization');
    if (!token || typeof token !== 'string') {
      throw new Error();
    }

    token = token.replace('Bearer ', '');

    const userId = await RefreshToken.validateRefreshToken(token);

    req.userId = userId;
    req.refreshToken = token;

    next();
  }
  catch {
    res.status(401).send({
      error: 'Please authorize.',
    });
  }
};

module.exports = authorization;
