const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints, isObjectId, stringConstraints, numberConstraints } = require("../../utils/validator");

const createRatingRequest = ({ body }) => {
  const { courseId, description, rating } =
    objectConstraints(body, "Create rating's body", ['courseId', 'description', 'rating']);
  
  isObjectId(courseId, "course's id");

  stringConstraints(description, "Rating's description", { minLength: 1, maxLength: 500, isRequired: true });

  numberConstraints(rating, "Rating's value", { min: 1, max: 5 });

  if (rating !== 1 && rating !== 2 && rating !== 3 && rating !== 4 && rating !== 5) {
    throw new NodemyResponseError(400, "Rating's value must be 1, 2, 3, 4 or 5");
  }
};

module.exports = createRatingRequest;
