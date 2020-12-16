const NodemyResponseError = require("../utils/NodemyResponseError");

const createCategoryRequest = ({ body }) => {
  if (typeof body !== "object") {
    throw new NodemyResponseError(
      400,
      "Type of create category body is invalid!"
    );
  }
  const { name, parentCategory, description, ...rest } = body;

  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, "Create category body is invalid!");
  }

  if (typeof name !== "string") {
    throw new NodemyResponseError(400, "Type of name is invalid!");
  }

  if (typeof parentCategory !== "string") {
    throw new NodemyResponseError(400, "Type of name is invalid!");
  }

  if (typeof description !== "string") {
    throw new NodemyResponseError(400, "Type of name is invalid!");
  }
};

module.exports = createCategoryRequest;
