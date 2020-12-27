const { objectConstraints, isObjectId } = require("../../utils/validator");

const getSectionsRequest = ({ params }) => {
  const { courseId } = objectConstraints(params, "Get sections's params", ['courseId']);
  isObjectId(courseId, "course's id");
};

module.exports = getSectionsRequest;
