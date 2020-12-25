const { objectConstraints, stringConstraints } = require("../../utils/validator");

const updateGoogleRequest = ({ body = { fullname: '' } }) => {
  const { fullname } = objectConstraints(body, "Update account's body", ['fullname']);

  if (typeof fullname === 'undefined') {
    return true;
  }

  stringConstraints(fullname, 'Fullname', { maxLength: 64, isRequired: true });
};

module.exports = updateGoogleRequest;
