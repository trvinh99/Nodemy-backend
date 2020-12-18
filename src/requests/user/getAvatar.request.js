const NodemyResponseError = require("../../utils/NodemyResponseError");

const getAvatarRequest = ({ params }) => {
  if (typeof params !== 'object') {
    throw new NodemyResponseError(400, 'Type of params must be object!');
  }

  const { id } = params;
  if (typeof id !== 'string') {
    throw new NodemyResponseError(400, 'Type of user id must be string!');
  }

  if (id.length !== 24) {
    throw new NodemyResponseError(404, 'Found no user!');
  }
};

module.exports = getAvatarRequest;
