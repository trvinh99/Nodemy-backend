const NodemyResponseError = require("../utils/NodemyResponseError");

const updateCategoryRequest = ({ body }) => {
  if (typeof body !== "object") {
    throw new NodemyResponseError("Type of update category body is invalid!");
  }

  const { name, parentCategory, description, ...rest } = body;

  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, "Create category body is invalid!");
  }

  if (name !== undefined && typeof name !== "string") {
    throw new NodemyResponseError(400, "Type of name is invalid!");
  }

  if (parentCategory !== undefined && typeof parentCategory !== "string") {
    throw new NodemyResponseError(400, "Type of name is invalid!");
  }

  if (description !== undefined && typeof description !== "string") {
    throw new NodemyResponseError(400, "Type of name is invalid!");
  }
};

module.exports = updateCategoryRequest;
