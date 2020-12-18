const NodemyResponseError = require("../../utils/NodemyResponseError");

const updateGoogleRequest = ({ body = { fullname: '' } }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(400, 'Type of update account\'s body must be object!');
  }

  const { fullname, ...rest } = body;
  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, 'Update account\'s body has redundant field(s)!');
  }

  if (typeof fullname === 'undefined') {
    return true;
  }

  if (typeof fullname !== 'string') {
    throw new NodemyResponseError(400, 'Type of fullname must be string!');
  }

  if (!fullname.trim()) {
    throw new NodemyResponseError(400, 'Fullname is required!');
  }
};

module.exports = updateGoogleRequest;
