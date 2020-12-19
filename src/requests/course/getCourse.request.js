const NodemyResponseError = require("../../utils/NodemyResponseError");

const getCourseRequest = ({ params }) => {
  const { id } = params;
  if (typeof id !== 'string') {
    throw new NodemyResponseError(400, 'Type of course id must be string!');
  }

  if (id.length !== 24) {
    throw new NodemyResponseError(400, 'Format of course id is invalid!');
  }
};

module.exports = getCourseRequest;
