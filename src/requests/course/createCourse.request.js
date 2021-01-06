const { isURL } = require('validator');

const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints, stringConstraints, numberConstraints, isObjectId, checkType } = require('../../utils/validator');

const createCourseRequest = ({ body }) => {
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
  } = objectConstraints(body, "Create course's body", ['title', 'summary', 'description', 'coverImage', 'price', 'saleRatio', 'category', 'isFinish', 'isPublic']);

  stringConstraints(title, "Course's title", { minLength: 1, maxLength: 60, isRequired: true });

  stringConstraints(summary, "Course's summary", { minLength: 1, maxLength: 400, isRequired: true });

  stringConstraints(description, "Course's description", { minLength: 1, maxLength: 1000, isRequired: true });

  stringConstraints(coverImage, "Course's cover image", { minLength: 24, isRequired: true });

  if (!isURL(coverImage)) {
    throw new NodemyResponseError(400, "Cover image must be URL!");
  }

  if (!coverImage.includes('https://i.imgur.com/')) {
    throw new NodemyResponseError(400, "Format of cover image is invalid!");
  }

  numberConstraints(price, "Course's price", { min: 0 });

  numberConstraints(saleRatio, "Course's sale", { min: 0, max: 100 });

  isObjectId(category, "course's category");

  checkType(isFinish, 'boolean', "'is course finish'");

  checkType(isPublic, 'boolean', "'is course public'");
};

module.exports = createCourseRequest;
