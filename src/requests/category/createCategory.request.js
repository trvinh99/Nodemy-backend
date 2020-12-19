const NodemyResponseError = require("../../utils/NodemyResponseError");

const createCategoryRequest = ({ body }) => {
  if (typeof body !== "object") {
    throw new NodemyResponseError(400, "Type of create category's body must be object!");
  }
  const {
    name,
    parentCategory,
    description,
    subCategories,
    ...rest
  } = body;

  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, "Create category's body has redundant field(s)!");
  }

  if (typeof name !== "string") {
    throw new NodemyResponseError(400,"Type of category's name must be string!");
  }

  if (typeof parentCategory !== "string") {
    throw new NodemyResponseError(400,"Type of parent's category must be string!");
  }
  if (parentCategory.length !== 24) {
    throw new NodemyResponseError(400, "Parent category must contain 24 characters!");
  }

  if (typeof description !== "string") {
    throw new NodemyResponseError(400,"Type of category's description must be string!");
  }

  if (!Array.isArray(subCategories)) {
    throw new NodemyResponseError(400,"Type of category's sub categories must be array!");
  }
};

module.exports = createCategoryRequest;
