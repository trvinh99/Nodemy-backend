const { objectConstraints, isObjectId, numberConstraints } = require("../../utils/validator");

const updateLearningProcessRequest = ({ body }) => {
  const { courseId, currentWatchingLecture, currentWatchingTimepoint } =
    objectConstraints(body, 'Update learning process\'s body', ['courseId', 'currentWatchingLecture', 'currentWatchingTimepoint']);

  isObjectId(courseId, "course's id");
  isObjectId(currentWatchingLecture, "current watching lecture's id");
  numberConstraints(currentWatchingTimepoint, 'Current watching timepoint', { min: 0 });
};

module.exports = updateLearningProcessRequest;
