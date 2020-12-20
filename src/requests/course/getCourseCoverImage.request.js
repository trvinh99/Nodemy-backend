const NodemyResponseError = require("../../utils/NodemyResponseError");

const getCourseCoverImageRequest = ({ params }) => {
  if (typeof params !== 'object') {
    throw new NodemyResponseError(400, 'Type of params must be object!');
  }

  const { id } = params;
  if (typeof id !== 'string') {
    throw new NodemyResponseError(400, 'Type of course\'s id must be string!');
  }

  if (id.length !== 24) {
    throw new NodemyResponseError(400, 'Format of course\'s id is invalid!');
  }
};

module.exports = getCourseCoverImageRequest;
