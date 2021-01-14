const NodemyResponseError = require("../../utils/NodemyResponseError");
const { objectConstraints, isObjectId, stringConstraints } = require("../../utils/validator");

const createLectureRequest = ({ body }) => {
  const {
    sectionId,
    lectureName,
    canPreview
  } = objectConstraints(body, "Create lecture's body", ['sectionId', 'lectureName', 'canPreview']);

  isObjectId(sectionId, "section's id");

  stringConstraints(lectureName, "Lecture's name", { minLength: 1, maxLength: 100, isRequired: true });

  if (canPreview !== 'Yes' && canPreview !== 'No') {
    throw new NodemyResponseError(400, 'Can preview must be "Yes" or "No"!');
  }
};

module.exports = createLectureRequest;
