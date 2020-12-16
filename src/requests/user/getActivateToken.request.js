const NodemyResponseError = require('../../utils/NodemyResponseError');

const getActivateTokenRequest = ({ params }) => {
  if (typeof params !== 'object') {
    throw new NodemyResponseError(400, 'Type of params is invalid!');
  }

  const { id } = params;
  if (typeof id !== 'string') {
    throw new NodemyResponseError(400, 'Type of user id is invalid!');
  }

  if (id.length !== 24) {
    throw new NodemyResponseError(400, 'Format of user id is invalid!');
  }
};

module.exports = getActivateTokenRequest;
