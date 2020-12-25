const { objectConstraints, isObjectId, stringConstraints } = require('../../utils/validator');

const updateCategoryRequest = ({ params, body }) => {
  const {
    name,
    parentCategory,
    description
  } = objectConstraints(body, "Update category's body", ['name', 'parentCategory', 'description']);

  const { id } = objectConstraints(params, "Update category's params", ['id']);
  isObjectId(id, "update category's id");

  if (name !== undefined) {
    stringConstraints(name, "Category's name", { minLength: 1, maxLength: 50, isRequired: true });
  }

  if (parentCategory !== undefined) {
    isObjectId(parentCategory, "parent category's id");
  }

  if (description !== undefined) {
    stringConstraints(description, "Create category's description", { minLength: 1, maxLength: 1000 });
  }
};
module.exports = updateCategoryRequest;
