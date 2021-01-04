const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

const bypassAuthentication = async (req, res, next) => {
  try {
    let token = req.header("Nodemy-Authentication");
    if (!token || typeof token !== "string") {
      throw new Error();
    }

    token = token.replace("Bearer ", "");

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
    req.user = null;
    next();
  }
};

module.exports = bypassAuthentication;
