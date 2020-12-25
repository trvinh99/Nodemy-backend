const { objectConstraints, isObjectId } = require("../../utils/validator");

const deleteSectionRequest = ({ params }) => {
  const { id } = objectConstraints(params, "Delete section's params", ['id']);
  isObjectId(id, "section's id");
};

module.exports = deleteSectionRequest;
