const NodemyResponseError = require('../../utils/NodemyResponseError');

const loginGoogleRequest = ({ body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(400, 'Type of body is must be object!');
  }

  const { googleAccessToken } = body;
  if (typeof googleAccessToken !== 'string') {
    throw new NodemyResponseError(400, 'Type of Google\'s access token must be string!');
  }
};

module.exports = loginGoogleRequest;
