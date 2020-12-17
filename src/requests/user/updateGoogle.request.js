const NodemyResponseError = require("../../utils/NodemyResponseError");

const updateGoogleRequest = ({ body = { fullname: '' } }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(400, 'Type of update account\'s body is invalid!');
  }

  const { fullname, ...rest } = body;
  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, 'Update account\'s body is invalid!');
  }

  if (typeof fullname === 'undefined') {
    return true;
  }

  if (typeof fullname !== 'string') {
    throw new NodemyResponseError(400, 'Type of fullname is invalid!');
  }

  if (!fullname.trim()) {
    throw new NodemyResponseError(400, 'Fullname is empty!');
  }
};

module.exports = updateGoogleRequest;
