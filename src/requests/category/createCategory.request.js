const { objectConstraints, stringConstraints, isObjectId } = require("../../utils/validator");

const createCategoryRequest = ({ body }) => {
  const {
    name,
    parentCategory,
    description,
  } = objectConstraints(body, "Create category's body", ['name', 'parentCategory', 'description']);

  stringConstraints(name, "Category's name", { minLength: 1, maxLength: 50, isRequired: true });

  if (typeof parentCategory !== 'undefined') {
    isObjectId(parentCategory, "parent category's id");
  }

  stringConstraints(description, "Create category's description", { minLength: 1, maxLength: 1000 });
};

module.exports = createCategoryRequest;
