const NodemyResponseError = require('../utils/NodemyResponseError');

const loginGoogleRequest = ({ body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(400, 'Type of body is invalid!');
  }

  const { googleAccessToken } = body;
  if (typeof googleAccessToken !== 'string') {
    throw new NodemyResponseError(400, 'Type of Google\'s access token is invalid!');
  }
};

module.exports = loginGoogleRequest;
