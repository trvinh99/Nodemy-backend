const { objectConstraints, isObjectId } = require("../../utils/validator");

const updateLearningProcessRequest = ({ body }) => {
  const { courseId, currentWatchingLecture } =
    objectConstraints(body, 'Update learning process\'s body', ['courseId', 'currentWatchingLecture']);

  isObjectId(courseId, "course's id");
  isObjectId(currentWatchingLecture, "current watching lecture's id");
};

module.exports = updateLearningProcessRequest;
