const allowedCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, HEAD, OPTIONS');
  next();
};

module.exports = allowedCrossDomain;
