const { objectConstraints, isObjectId } = require("../../utils/validator");

const deleteRatingRequest = ({ params }) => {
  const { id } = objectConstraints(params, "Delete rating's params", ['id']);
  isObjectId(id, "rating's id");
};

module.exports = deleteRatingRequest;
