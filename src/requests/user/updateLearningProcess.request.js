const { objectConstraints, isObjectId } = require("../../utils/validator");

const updateLearningProcessRequest = ({ body }) => {
  const { courseId, lectureId } =
    objectConstraints(body, 'Update learning process\'s body', ['courseId', 'lectureId']);

  isObjectId(courseId, "course's id");
  isObjectId(lectureId, "current watching lecture's id");
};

module.exports = updateLearningProcessRequest;
