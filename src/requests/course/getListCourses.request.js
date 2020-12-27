const NodemyResponseError = require("../../utils/NodemyResponseError");

const getListCoursesRequest = ({ query }) => {
  const queryKeys = Object.keys(query);
  queryKeys.forEach((key) => {
    if (key !== 'title' && key !== 'page' && key !== 'category') {
      throw new NodemyResponseError(400, 'Get course\'s query has redundant field(s)!');
    }
  });

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

module.exports = getListCoursesRequest;
