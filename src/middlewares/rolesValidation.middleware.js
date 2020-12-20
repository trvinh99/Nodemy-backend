const rolesValidation = (roles = []) => (req, res, next) => {
  for (let i = 0; i < roles.length; ++i) {
    if (roles[i] !== 'Teacher' && roles[i] !== 'Admin' && roles[i] !== 'Student') {
      return res.status(500).send({
        error: 'Internal Server Error',
      });
    }
  }

  if (roles.includes(req.user.accountType)) {
    return next();
  }

  res.status(401).send({
    error: 'Please authenticate!',
  });
};

module.exports = rolesValidation;
