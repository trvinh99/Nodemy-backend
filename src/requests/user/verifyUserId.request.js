const { objectConstraints, isObjectId } = require("../../utils/validator");

const verifyUserId = ({ body }) => {
  const { userId } = objectConstraints(body, "Body request", ['userId']);
  isObjectId(userId, "user's id");
};

module.exports = verifyUserId;