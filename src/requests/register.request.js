const validator = require('validator');

const NodemyResponseError = require("../utils/NodemyResponseError");

const registerRequest = ({ body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(400, 'Type of register body is invalid!');
  }

  const {
    email,
    fullname,
    password,
    ...rest
  } = body;
  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, 'Register body is invalid!');
  }

  if (typeof email !== 'string') {
    throw new NodemyResponseError(400, 'Type of email is invalid!');
  }

  if (typeof fullname !== 'string') {
    throw new NodemyResponseError(400, 'Type of fullname is invalid!');
  }

  if (typeof password !== 'string') {
    throw new NodemyResponseError(400, 'Type of password is invalid!');
  }

  if (!validator.isEmail(email)) {
    throw new NodemyResponseError(400, 'Email is invalid!');
  }

  if (!fullname) {
    throw new NodemyResponseError(400, 'Fullname is empty!');
  }

  if (password.length < 8) {
    throw new NodemyResponseError(400, 'Password must contain at least 8 characters!');
  }
};

module.exports = registerRequest;
