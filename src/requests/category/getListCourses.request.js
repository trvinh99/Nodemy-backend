const NodemyResponseError = require("../../utils/NodemyResponseError");

const getListCoursesRequest = ({ query }) => {
  const queryKeys = Object.keys(query);
  queryKeys.forEach((key) => {
    if (key !== 'name' && key !== 'page') {
      throw new NodemyResponseError(400, 'Query has redundant field(s)!');
    }
  });

  if (typeof query.page !== 'undefined') {
    if (parseInt(query.page).toString() === 'NaN') {
      throw new NodemyResponseError(400, 'Page must be number!');
    }
  }
};

module.exports = getListCoursesRequest;
