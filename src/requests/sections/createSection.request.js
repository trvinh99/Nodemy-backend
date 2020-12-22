const NodemyResponseError = require("../../utils/NodemyResponseError");

const createSectionRequest = ({ body }) => {
  if (typeof body !== "object") {
    throw new NodemyResponseError(400, "Type of create section's body must be object!");
  }
  const {
    courseId,
    sectionName,
    lectures,
    ...rest
  } = body;

  if (Object.keys(rest).length !== 0) {
    throw new NodemyResponseError(400, "Create section's body has redundant field(s)!");
  }

  if (typeof sectionName !== "string") {
    throw new NodemyResponseError(400,"Type of section's name must be string!");
  }

  if (sectionName.length > 200) {
      throw new NodemyResponseError(400,"Section's name must not contain more than 200 characters!");
  }

  if (typeof lectures !== 'undefined') {
    if (!Array.isArray(lectures)) {
      throw new NodemyResponseError(400,"Type of section's lectures must be array!");
    }
  }

  if (typeof courseId !== "string") {
    throw new NodemyResponseError(400,"Type of section's course id must be string!");
  }
    
  if (courseId.length !== 24) {
      throw new NodemyResponseError(400, "Course id must contain 24 characters!");
    }
};

module.exports = createSectionRequest;
