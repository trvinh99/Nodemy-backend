const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints, isObjectId, stringConstraints } = require("../../utils/validator");

const updateSectionRequest = ({ params, body }) => {
  const { id } = objectConstraints(params, "Update section's params", ['id']);
  isObjectId(id, "section's id");

  const { sectionName } = objectConstraints(body, "Update section's body", ['sectionName']);
  if (typeof sectionName !== 'undefined') {
    stringConstraints(sectionName, "Section's name", { minLength: 1, maxLength: 200, isRequired: true });
  }
};

module.exports = updateSectionRequest;
