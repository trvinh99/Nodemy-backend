const { isURL } = require('validator');

const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints, isObjectId, stringConstraints, numberConstraints } = require('../../utils/validator');

const updateCourseRequest = ({ params, body }) => {
  const {
    title,
    summary,
    description,
    coverImage,
    price,
    saleRatio,
    category,
    isFinish,
    isPublic,
  } = objectConstraints(body, "Update course's body", ['title', 'summary', 'description', 'coverImage', 'price', 'saleRatio', 'category', 'isFinish', 'isPublic']);

  const { id } = objectConstraints(params, "Update course's params", ['id']);
  isObjectId(id, "course's id");

  if (typeof title !== "undefined") {
    stringConstraints(title, "Course's title", { minLength: 1, maxLength: 60, isRequired: true });
  }

  if (typeof summary !== "undefined") {
    stringConstraints(summary, "Course's summary", { minLength: 1, maxLength: 400, isRequired: true });
  }

  if (typeof description !== "undefined") {
    stringConstraints(description, "Course's description", { minLength: 1, maxLength: 1000, isRequired: true });
  }

  if (typeof coverImage !== "undefined") {
    stringConstraints(coverImage, "Course's cover image", { minLength: 24, isRequired: true });

    if (!isURL(coverImage)) {
      throw new NodemyResponseError(400, "Cover image must be URL!");
    }

    if (!coverImage.includes('https://i.imgur.com/')) {
      throw new NodemyResponseError(400, "Format of cover image is invalid!");
    }
  }

  if (typeof price !== "undefined") {
    numberConstraints(price, "Course's price", { min: 0 });
  }

  if (typeof sale !== "undefined") {
    numberConstraints(saleRatio, "Course's sale", { min: 0, max: 100 });
  }

  if (typeof category !== "undefined") {
    isObjectId(category, "course's category");
  }

  if (typeof isFinish !== 'undefined' && typeof isFinish !== 'boolean') {
    throw new NodemyResponseError(400, "Type of 'is course finish' must be boolean!");
  }

  if (typeof isPublic !== 'undefined' && typeof isPublic !== 'boolean') {
    throw new NodemyResponseError(400, "Type of 'is course public' must be boolean!");
  }
};

module.exports = updateCourseRequest;
