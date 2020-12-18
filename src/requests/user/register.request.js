const validator = require('validator');

const NodemyResponseError = require("../../utils/NodemyResponseError");

const registerRequest = ({ body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(400, 'Type of register\'s body must be object!');
  }

  const {
    email,
    fullname,
    password,
    ...rest
  } = body;
  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, 'Register body has redundant field(s)!');
  }

  if (typeof email !== 'string') {
    throw new NodemyResponseError(400, 'Type of email must be string!');
  }

  if (typeof fullname !== 'string') {
    throw new NodemyResponseError(400, 'Type of fullname must be string!');
  }

  if (typeof password !== 'string') {
    throw new NodemyResponseError(400, 'Type of password must be string!');
  }

  if (!validator.isEmail(email)) {
    throw new NodemyResponseError(400, 'Email is invalid!');
  }

  if (!fullname.trim()) {
    throw new NodemyResponseError(400, 'Fullname is required!');
  }

  if (password.length < 8) {
    throw new NodemyResponseError(400, 'Password must contain at least 8 characters!');
  }
};

module.exports = registerRequest;
