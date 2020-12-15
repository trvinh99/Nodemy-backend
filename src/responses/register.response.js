const registerError = (error) => {
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
