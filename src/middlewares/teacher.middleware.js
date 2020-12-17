const teacher = (req, res, next) => {
  if (req.user.accountType === 'Teacher') {
    next();
  }

  res.status(401).send({
    error: 'Please authenticate!',
  });
};

module.exports = teacher;
