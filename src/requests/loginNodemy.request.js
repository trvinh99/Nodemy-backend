const { isEmail } = require('validator');

const NodemyResponseError = require('../utils/NodemyResponseError');

const loginNodemyRequest = ({ body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError('Type of body is invalid!');
  }

  const { email, password, ...rest } = body;
  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError('Login body is invalid!');
  }

  if (typeof email !== 'string') {
    throw new NodemyResponseError('Type of email is invalid!');
  }

  if (typeof password !== 'string') {
    throw new NodemyResponseError('Type of password is invalid!');
  }

  if (!isEmail(email)) {
    throw new NodemyResponseError('Email is invalid!');
  }

  if (password.length < 8) {
    throw new NodemyResponseError('Unable to login!');
  }
};

module.exports = loginNodemyRequest;
