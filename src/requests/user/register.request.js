const validator = require('validator');

const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints, stringConstraints } = require('../../utils/validator');

const registerRequest = ({ body }) => {
  const {
    email,
    fullname,
  } = objectConstraints(body, "Register's body", ['email', 'fullname']);

  stringConstraints(email, 'Email', { maxLength: 100, isRequired: true });

  stringConstraints(fullname, 'Fullname', { maxLength: 64, isRequired: true });

  if (!validator.isEmail(email)) {
    throw new NodemyResponseError(400, 'Email is invalid!');
  }
};

module.exports = registerRequest;
