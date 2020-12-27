const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints, isObjectId } = require("../../utils/validator");

const getRatingsRequest = ({ params, query }) => {
  const { courseId } = objectConstraints(params, "Get ratings's params", ['courseId']);
  isObjectId(courseId, "course's id");

  const { page } = objectConstraints(query, "Get ratings's query", ['page']);
  if (typeof page !== 'undefined') {
    const pageNumber = parseInt(page);

    if (pageNumber.toString() === 'NaN') {
      throw new NodemyResponseError(400, 'Page must be number!');
    }

    if (pageNumber <= 0) {
      throw new NodemyResponseError(400, 'Page must be greater than 0!');
    }
  }
};

module.exports = getRatingsRequest;
