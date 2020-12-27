const { objectConstraints, isObjectId } = require("../../utils/validator");

const buyCourseRequest = ({ params }) => {
  const { id } = objectConstraints(params, "Buy course's params", ['id']);
  isObjectId(id, "course's id");
};

module.exports = buyCourseRequest;
