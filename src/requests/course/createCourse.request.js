const { isURL } = require('validator');

const NodemyResponseError = require("../../utils/NodemyResponseError");

const createCourseRequest = ({ body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(400, 'Type of create course\'s body is invalid!');
  }

  const {
    title,
    summary,
    description,
    coverImage,
    price,
    categories,
    isFinish,
    isPublic,
    ...rest
  } = body;

  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, 'Create course\'s body is invalid!');
  }

  if (typeof title !== 'string') {
    throw new NodemyResponseError(400, "Type of title is invalid!");
  }

  if (!title.trim()) {
    throw new NodemyResponseError(400, "Title is empty!");
  }

  if (typeof summary !== 'string') {
    throw new NodemyResponseError(400, "Type of summary is invalid!");
  }

  if (!summary.trim()) {
    throw new NodemyResponseError(400, "Summary is empty!");
  }

  if (typeof description !== 'string') {
    throw new NodemyResponseError(400, "Type of description is invalid!");
  }

  if (!description.trim()) {
    throw new NodemyResponseError(400, "Description is empty!");
  }

  if (typeof coverImage !== 'string') {
    throw new NodemyResponseError(400, "Type of cover image is invalid!");
  }

  if (!isURL(coverImage)) {
    throw new NodemyResponseError(400, "Cover image must be URL!");
  }

  if (!coverImage.includes('https://i.imgur.com/')) {
    throw new NodemyResponseError(400, "Format of cover image is invalid!");
  }

  if (typeof price !== 'number') {
    throw new NodemyResponseError(400, "Type of price is invalid!");
  }

  if (price < 0) {
    throw new NodemyResponseError(400, "Price can not less than 0!");
  }

  if (!Array.isArray(categories)) {
    throw new NodemyResponseError(400, "Type of categories is invalid!");
  }

  categories.forEach((category) => {
    if (typeof category !== 'string') {
      throw new NodemyResponseError(400, "Type of category is invalid!");
    }

    if (categories.length !== 24) {
      throw new NodemyResponseError(400, "Format of category is invalid!");
    }
  });

  if (typeof isFinish !== 'boolean') {
    throw new NodemyResponseError(400, "Type of is finish is invalid!");
  }

  if (typeof isPublic !== 'boolean') {
    throw new NodemyResponseError(400, "Type of is public is invalid!");
  }
};

module.exports = createCourseRequest;
