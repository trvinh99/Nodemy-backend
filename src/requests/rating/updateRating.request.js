const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints, isObjectId, stringConstraints, numberConstraints } = require("../../utils/validator");

const updateRatingRequest = ({ params, body }) => {
  const { id } = objectConstraints(params, "Update rating's params", ['id']);
  isObjectId(id, "rating's id");

  const { description, rating } = objectConstraints(body, "Create rating's body", ['description', 'rating']);

  stringConstraints(description, "Rating's description", { minLength: 1, maxLength: 500, isRequired: true });

  numberConstraints(rating, "Rating's value", { min: 1, max: 5 });

  if (rating !== 1 && rating !== 2 && rating !== 3 && rating !== 4 && rating !== 5) {
    throw new NodemyResponseError(400, "Rating's value must be 1, 2, 3, 4 or 5");
  }
};

module.exports = updateRatingRequest;