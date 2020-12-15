const requestBodyValidation = (validator) => (req, res, next) => {
  try {
    validator(req);
    next();
  }
  catch (error) {
    res.status(error.code).send({
      error: error.message,
    });
  }
};

module.exports = requestBodyValidation;
