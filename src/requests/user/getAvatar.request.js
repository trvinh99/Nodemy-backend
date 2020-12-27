const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints, isObjectId } = require("../../utils/validator");

const getAvatarRequest = ({ params }) => {
  const { id } = objectConstraints(params, "Get avatar's params", ['id']);
  isObjectId(id, "get avatar's id");
};

module.exports = getAvatarRequest;
