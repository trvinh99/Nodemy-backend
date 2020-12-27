const { objectConstraints, isObjectId, stringConstraints } = require("../../utils/validator");

const createSectionRequest = ({ body }) => {
  const { courseId, sectionName } = objectConstraints(body, "Create section's body", ['courseId', 'sectionName']);

  isObjectId(courseId, "course's id");
  stringConstraints(sectionName, "Section's name", { minLength: 1, maxLength: 200, isRequired: true });
};

module.exports = createSectionRequest;
