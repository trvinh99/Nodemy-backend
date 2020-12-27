const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints, isObjectId } = require("../../utils/validator");

const getCourseRequest = ({ params }) => {
  const { id } = objectConstraints(params, "Get course details's params", ['id']);
  isObjectId(id, "Course's id");
};

module.exports = getCourseRequest;
