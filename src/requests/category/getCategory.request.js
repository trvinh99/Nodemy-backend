const { objectConstraints, isObjectId } = require("../../utils/validator");

const getCategoryRequest = ({ params }) => {
  const { id } = objectConstraints(params, "Get category's params", ['id']);
  isObjectId(id, "get category's id");
};

module.exports = getCategoryRequest;