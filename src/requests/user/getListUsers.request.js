const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints } = require("../../utils/validator");

const getListUsers = ({ query }) => {
  const { page } = objectConstraints(query, "Get list users's query", ['page', 'email']);

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

module.exports = getListUsers;
