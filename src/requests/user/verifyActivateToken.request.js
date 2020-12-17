const NodemyResponseError = require("../../utils/NodemyResponseError");

const verifyActivateTokenRequest = ({ params, body }) => {
  if (typeof body !== 'object') {
    throw new NodemyResponseError(400, 'Type of body is invalid!');
  }

  if (typeof params !== 'object') {
    throw new NodemyResponseError(400, 'Type of params is invalid!');
  }

  const { id } = params;
  if (typeof id !== 'string') {
    throw new NodemyResponseError(400, 'Type of user id is invalid!');
  }

  if (id.length !== 24) {
    throw new NodemyResponseError(400, 'Format of user id is invalid!');
  }

  const { token, password, ...rest } = body;
  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, 'Verify activate token body is invalid!');
  }

  if (typeof token !== 'string') {
    throw new NodemyResponseError(400, 'Type of activate token is invalid!');
  }

  if (token.length !== 6) {
    throw new NodemyResponseError(400, 'Format of activate token is invalid!');
  }

  if (typeof password !== 'string') {
    throw new NodemyResponseError(400, 'Type of password is invalid!');
  }

  if (password.length < 8) {
    throw new NodemyResponseError(400, 'Password must contain at least 8 characters!');
  }
};

module.exports = verifyActivateTokenRequest;
