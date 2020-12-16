const RefreshToken = require('../models/refreshToken.model');

const authorization = async (req, res, next) => {
  try {
    let token = req.header('Nodemy-Authorization');
    if (!token || typeof token !== 'string') {
      throw new Error();
    }

    token = token.replace('Bearer ', '');

    const accessData = await RefreshToken.findOne({ token });
    if (!accessData) {
      throw new Error();
    }

    if ((new Date()).valueOf() > accessData.expiredAt) {
      throw new Error();
    }

    req.userId = accessData.userId;
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
