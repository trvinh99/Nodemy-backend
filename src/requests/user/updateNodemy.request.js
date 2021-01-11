const { isEmail } = require('validator');

const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints, stringConstraints } = require('../../utils/validator');

const updateNodemyRequest = ({ body }) => {
  const { email, password, fullname, currentPassword } =
    objectConstraints(body, "Update account's body", ['email', 'password', 'fullname', 'currentPassword']);

  if (typeof email !== 'undefined') {
    stringConstraints(email, 'Email', { maxLength: 100, isRequired: true });

    if (!isEmail(email)) {
      throw new NodemyResponseError(400, 'Email is invalid!');
    }
  }

  if (typeof password !== 'undefined') {
    stringConstraints(password, 'Password', { minLength: 8, isRequired: true });

    if (password.length < 8) {
      throw new NodemyResponseError(400, 'Password must contain at least 8 characters!');
    }

    if (typeof currentPassword !== 'string' || currentPassword.length < 8)) {
      throw new NodemyResponseError(400, 'Old password does not match!');
    }
  }

  if (typeof fullname !== 'undefined') {
    stringConstraints(fullname, 'Fullname', { maxLength: 64, isRequired: true });
  }
};

module.exports = updateNodemyRequest;
