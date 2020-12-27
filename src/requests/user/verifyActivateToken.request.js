const { objectConstraints, isObjectId, stringConstraints } = require("../../utils/validator");

const verifyActivateTokenRequest = ({ params, body }) => {
  const { token, password } = objectConstraints(body, "Activate token's body", ['token', 'password']);
  const { id } = objectConstraints(params, "Activate token's params", ['id']);

  isObjectId(id, "user's id");

  stringConstraints(token, 'Activate token', { minLength: 6, maxLength: 6, isRequired: true });

  stringConstraints(password, 'Password', { minLength: 8, isRequired: true });
};

module.exports = verifyActivateTokenRequest;
