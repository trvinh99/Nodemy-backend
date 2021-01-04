const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints } = require("../../utils/validator");

const getUsersRequest = ({ query }) => {
  objectConstraints(query, "Get users's query", ['email', 'page']);
  
  if (typeof query.page !== 'undefined') {
    const pageNumber = parseInt(query.page);

    if (pageNumber.toString() === 'NaN') {
      throw new NodemyResponseError(400, 'Page must be number!');
    }

    if (pageNumber <= 0) {
      throw new NodemyResponseError(400, 'Page must be greater than 0!');
    }
  }
};

module.exports = getUsersRequest;
