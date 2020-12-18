const { isEmail } = require('validator');

const NodemyResponseError = require("../../utils/NodemyResponseError");

const updateNodemyRequest = ({ body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(400, 'Type of update account\'s body must be object!');
  }

  const {
    email,
    password,
    fullname,
    ...rest
  } = body;
  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, 'Update account\'s body has redundant field(s)!');
  }

  if (typeof email !== 'undefined') {
    if (typeof email !== 'string') {
      throw new NodemyResponseError(400, 'Type of email must be string!');
    }

    if (!isEmail(email)) {
      throw new NodemyResponseError(400, 'Email is invalid!');
    }
  }

  if (typeof password !== 'undefined') {
    if (typeof password !== 'string') {
      throw new NodemyResponseError(400, 'Type of password must be string!');
    }

    if (password.length < 8) {
      throw new NodemyResponseError(400, 'Password must contain at least 8 characters!');
    }
  }

  if (typeof fullname !== 'undefined') {
    if (typeof fullname !== 'string') {
      throw new NodemyResponseError(400, 'Type of fullname must be string!');
    }

    if (!fullname.trim()) {
      throw new NodemyResponseError(400, 'Fullname is required!!');
    }
  }
};

module.exports = updateNodemyRequest;
