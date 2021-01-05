const NodemyResponseError = require("../../utils/NodemyResponseError");

const getListCoursesRequest = ({ query }) => {
  const queryKeys = Object.keys(query);
  queryKeys.forEach((key) => {
    if (key !== 'title' && key !== 'page' && key !== 'category' && key !== 'sort') {
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

  if (query.sort && query.sort !== 'ratings' && query.sort !== 'price' && query.sort !== 'ratings,price' && query.sort !== 'price,ratings') {
    throw new NodemyResponseError(400, "Query's sort is invalid!");
  }
};

module.exports = getListCoursesRequest;
