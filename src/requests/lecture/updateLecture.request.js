const NodemyResponseError = require("../../utils/NodemyResponseError");

const updateLecture = ({ body, params }) => {
  const { lectureName, canPreview } = body;

  const { id } = params;
  if (id.length !== 24) {
    throw new NodemyResponseError(400, 'Format of lecture\'s id is invalid!');
  }

  if (typeof lectureName !== 'undefined') {
    if (typeof lectureName !== 'string') {
      throw new NodemyResponseError(400, 'Type of lecture\'s name must be string!');
    }

    if (lectureName.length > 100) {
      throw new NodemyResponseError(400, 'Lecture\'s name must not contain more than 100 characters!');
    }
  }

  if (typeof canPreview !== 'undefined') {
    if (typeof canPreview !== 'boolean') {
      throw new NodemyResponseError(400, 'Type of can preview must be boolean!');
    }
  }
};

module.exports = updateLecture;