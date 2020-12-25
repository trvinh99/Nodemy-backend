const { objectConstraints, isObjectId, stringConstraints, checkType } = require("../../utils/validator");

const updateLecture = ({ body, params }) => {
  const { lectureName, canPreview } = objectConstraints(body, "Update lecture's body", ['lectureName', 'canPreview']);
  const { id } = objectConstraints(params, "Update lecture's params", ['id']);
  isObjectId(id, "lecture's id");

  if (typeof lectureName !== 'undefined') {
    stringConstraints(lectureName, "Lecture's name", { minLength: 1, maxLength: 100, isRequired: true });
  }

  if (typeof canPreview !== 'undefined') {
    checkType(canPreview, 'boolean', "can preview lecture");
  }
};

module.exports = updateLecture;