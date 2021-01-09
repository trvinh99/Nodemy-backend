const { objectConstraints, isObjectId } = require("../../utils/validator");

const getOwnRatingRequest = ({ params }) => {
  const { courseId } = objectConstraints(params, "Get ratings's params", ['courseId']);
  isObjectId(courseId, "course's id");
};

module.exports = getOwnRatingRequest;
