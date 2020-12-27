const NodemyResponseError = require('../../utils/NodemyResponseError');

const loginGoogleRequest = ({ body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(401, 'Unable to login!');
  }

  const { googleAccessToken } = body;
  if (typeof googleAccessToken !== 'string') {
    throw new NodemyResponseError(401, 'Unable to login!');
  }
};

module.exports = loginGoogleRequest;
