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
    sale,
    category,
    isFinish,
    isPublic,
    ...rest
  } = body;

  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, 'Create course\'s body must be object!');
  }

  if (typeof title !== 'string') {
    throw new NodemyResponseError(400, "Type of title must be string!");
  }

  if (!title.trim()) {
    throw new NodemyResponseError(400, "Title is required!");
  }

  if (title.trim().length > 60) {
    throw new NodemyResponseError(400, "Title must not have more than 60 characters!");
  }

  if (typeof summary !== 'string') {
    throw new NodemyResponseError(400, "Type of summary must be string!");
  }

  if (!summary.trim()) {
    throw new NodemyResponseError(400, "Summary is required!");
  }

  if (summary.trim().length > 400) {
    throw new NodemyResponseError(400, "Summary must not have more than 400 characters!");
  }

  if (typeof description !== 'string') {
    throw new NodemyResponseError(400, "Type of description must be string!");
  }

  if (!description.trim()) {
    throw new NodemyResponseError(400, "Description is required!");
  }

  if (description.trim().length > 1000) {
    throw new NodemyResponseError(400, "Description must not have more than 1000 characters!");
  }

  if (typeof coverImage !== 'string') {
    throw new NodemyResponseError(400, "Type of cover image must be string!");
  }

  if (!isURL(coverImage)) {
    throw new NodemyResponseError(400, "Cover image must be URL!");
  }

  if (!coverImage.includes('https://i.imgur.com/')) {
    throw new NodemyResponseError(400, "Format of cover image is invalid!");
  }

  if (typeof price !== 'number') {
    throw new NodemyResponseError(400, "Type of price must be number!");
  }

  if (price < 0) {
    throw new NodemyResponseError(400, "Price can not less than 0!");
  }

  if (typeof sale !== 'number') {
    throw new NodemyResponseError(400, "Type of sale must be string!");
  }

  if (price < 0) {
    throw new NodemyResponseError(400, "Sale can not less than 0!");
  }

  if (typeof category !== 'string') {
    throw new NodemyResponseError(400, "Type of category is string!");
  }

  if (category.length !== 24) {
    throw new NodemyResponseError(400, "Format of category is invalid!");
  }

  if (typeof isFinish !== 'boolean') {
    throw new NodemyResponseError(400, "Type of is finish must be boolean!");
  }

  if (typeof isPublic !== 'boolean') {
    throw new NodemyResponseError(400, "Type of is public must be boolean!");
  }
};

module.exports = createCourseRequest;
