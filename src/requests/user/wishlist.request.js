const { objectConstraints, isObjectId } = require("../../utils/validator");

const wishlistRequest = ({ body }) => {
  const { courseId } = objectConstraints(body, "Wishlist's body", ['courseId']);
  isObjectId(courseId, "course's id");
};

module.exports = wishlistRequest;
