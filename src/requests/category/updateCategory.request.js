const NodemyResponseError = require('../../utils/NodemyResponseError');

const updateCategoryRequest = ({ params, body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(400,'Type of update category body must be object!');
  }

  if (typeof params !== 'object') {
    throw new NodemyResponseError(400,'Type of update category params must be object!');
  }

  if (params.id.length !== 24) {
    throw new NodemyResponseError(400, 'Category id must contain 24 characters');
  }

  const {
    name,
    parentCategory,
    description,
    subCategories,
    ...rest
  } = body;

  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, 'Create category\'s body has redundant field(s)!');
  }

  if (name !== undefined) {
    if (typeof name !== 'string') {
      throw new NodemyResponseError(400, 'Type of category\'s name must be string!');
    }
  }

  if (parentCategory !== undefined) {
    if (typeof parentCategory !== 'string') {
      throw new NodemyResponseError(400, 'Type of parent category must be string!');
    }
    if (parentCategory.length !== 24) {
      throw new NodemyResponseError(400, 'Parent category must contain 24 characters!')
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string') {
      throw new NodemyResponseError(400, 'Type of category\'s description must be string!');
    }
  }
};
module.exports = updateCategoryRequest;
