const { isEmail } = require('validator');

const NodemyResponseError = require('../../utils/NodemyResponseError');

const loginNodemyRequest = ({ body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(401, 'Unable to login!');
  }

  const { email, password, ...rest } = body;
  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(401, 'Unable to login!');
  }

  if (typeof email !== 'string') {
    throw new NodemyResponseError(401, 'Unable to login!');
  }

  if (typeof password !== 'string') {
    throw new NodemyResponseError(401, 'Unable to login!');
  }

  if (!isEmail(email)) {
    throw new NodemyResponseError(401, 'Unable to login!');
  }

  if (password.length < 8) {
    throw new NodemyResponseError(401, 'Unable to login!');
  }
};

module.exports = loginNodemyRequest;
