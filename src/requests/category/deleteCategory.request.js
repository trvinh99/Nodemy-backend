const { objectConstraints, isObjectId } = require("../../utils/validator");

const deleteCategoryRequest = ({ params }) => {
  const { id } = objectConstraints(params, "Delete category's params", ['id']);
  isObjectId(id, "delete category's id");
};

module.exports = deleteCategoryRequest;