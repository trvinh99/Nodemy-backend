const NodemyResponseError = require("../../utils/NodemyResponseError");

const createCategoryRequest = ({ body }) => {
  if (typeof body !== "object") {
    throw new NodemyResponseError(
      400,
      "Type of create category body is invalid!"
    );
  }
  const { name, parentCategory, description, subCategories, ...rest } = body;

  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, "Create category body is invalid!");
  }

  if (typeof name !== "string") {
    throw new NodemyResponseError(400, "Type of category's name is invalid!");
  }

  if (typeof parentCategory !== "string") {
    throw new NodemyResponseError(400, "Type of parent category is invalid!");
  }
  if (parentCategory.length !== 24) {
    throw new NodemyResponseError(400, "Format of parent category is invalid!");
  }

  if (typeof description !== "string") {
    throw new NodemyResponseError(
      400,
      "Type of category description is invalid!"
    );
  }

  if (!Array.isArray(subCategories)) {
    throw new NodemyResponseError(
      400,
      "Type of category's sub categories is invalid!"
    );
  }
};

module.exports = createCategoryRequest;
