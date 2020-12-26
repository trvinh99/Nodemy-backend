const { objectConstraints, isObjectId } = require("../../utils/validator");

const deleteRatingRequest = ({ params }) => {
  const { courseId } = objectConstraints(params, "Delete rating's params", ['courseId']);
  isObjectId(courseId, "course's id");
};

module.exports = deleteRatingRequest;
