const registerError = (res, error) => {
  if (typeof error.code === 'number') {
    return res.status(error.code).send({
      error: error.message,
    });
  }

  let errorMessage = error.message;
  if (error.message.includes('required')) {
    errorMessage = "Register request's body is invalid!";
  }
  else if (error.message.includes('duplicate')) {
    errorMessage = 'email is already exists';
  }

  return errorMessage;
};

module.exports = {
  registerError,
};
