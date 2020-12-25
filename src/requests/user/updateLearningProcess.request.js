const NodemyResponseError = require("../../utils/NodemyResponseError");

const updateLearningProcessRequest = ({ body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(400, 'Type of body must be object!');
  }

  const { courseId, currentWatchingLecture, currentWatchingTimepoint } = body;
};

module.exports = updateLearningProcessRequest;
