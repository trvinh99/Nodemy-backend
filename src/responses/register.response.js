const registerError = (res, { code = 400, message = '' }) => {
  if (typeof code === 'number'
    && (code === 400 || code === 401 || code === 403 || code === 404 || code === 500)) {
    return res.status(code).send({
      error: message,
    });
  }

  let errorMessage = message;
  if (message.includes('required')) {
    errorMessage = "Register request's body is invalid!";
  }
  else if (message.includes('duplicate')) {
    errorMessage = 'email is already exists';
  }

  res.status(400).send({
    error: errorMessage,
  });
};

module.exports = {
  registerError,
};
