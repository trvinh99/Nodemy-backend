const NodemyResponseError = require("../../utils/NodemyResponseError");

const createLectureRequest = ({ body }) => {
  const {
    courseId,
    sectionId,
    lectureName,
    canPreview
  } = body;

  if (courseId.length !== 24) {
    throw new NodemyResponseError(400, 'Course\'s id is invalid!');
  }

  if (sectionId.length !== 24) {
    throw new NodemyResponseError(400, 'Section\'s id is invalid!');
  }

  if (lectureName.length > 200) {
    throw new NodemyResponseError(400, 'Lecture\'s name can not contain more than 200 characters!');
  }

  if (canPreview !== 'Yes' && canPreview !== 'No') {
    throw new NodemyResponseError(400, 'Can preview must be "Yes" or "No"!');
  }
};

module.exports = createLectureRequest;
