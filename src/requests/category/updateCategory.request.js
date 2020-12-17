const NodemyResponseError = require("../../utils/NodemyResponseError");

const updateCategoryRequest = ({ params, body }) => {
  if (typeof body !== "object") {
    throw new NodemyResponseError(
      400,
      "Type of update category body is invalid!"
    );
  }

  if (typeof params !== "object") {
    throw new NodemyResponseError(
      400,
      "Type of update category params is invalid!"
    );
  }

  if (params.id.length !== 24) {
    throw new NodemyResponseError(400, "Category ID must have 24 characters");
  }

  const { name, parentCategory, description, subCategories, ...rest } = body;

  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, "Create category body is invalid!");
  }

  if (name !== undefined && typeof name !== "string") {
    throw new NodemyResponseError(400, "Type of name is invalid!");
  }

  if (
    parentCategory !== undefined &&
    (typeof parentCategory !== "string" || parentCategory.length !== 24)
  ) {
    throw new NodemyResponseError(400, "Type of parent category is invalid!");
  }

  if (description !== undefined && typeof description !== "string") {
    throw new NodemyResponseError(400, "Type of description is invalid!");
  }

  if (subCategories !== undefined && !Array.isArray(subCategories)) {
    throw new NodemyResponseError(400, "Type of sub categories is invalid!");
  }
};
module.exports = updateCategoryRequest;
