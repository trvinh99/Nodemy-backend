const jwt = require('jsonwebtoken');

const User = require('../models/user.model');

const authentication = async (req, res, next) => {
  try {
    let token = req.header('Nodemy-Authentication');
    if (!token || typeof token !== 'string') {
      throw new Error();
    }

    token = token.replace('Bearer ', '');

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode._id);

    if (!user) {
      throw new Error();
    }

    req.accessToken = token;
    req.user = user;

    next();
  }
  catch {
    res.status(403).send({
      error: 'Please authenticate!',
    });
  }
};

module.exports = authentication;
