const NodemyResponseError = require("../../utils/NodemyResponseError");

const updateRatingRequest = ({ body }) => {
    if (typeof body !== "object") {
        throw new NodemyResponseError(400, "Type of create rating's body must be object!");
    }
    const {
        courseId,
        title,
        description,
        rating,
        ...rest
    } = body;

    if (Object.keys(rest).length !== 0) {
        throw new NodemyResponseError(400, "Update rating's body has redundant field(s)!");
    }

    if (typeof courseId !== "string") {
        throw new NodemyResponseError(400,"Type of rating's course id must be string!");
    }
    
    if (courseId.length !== 24) {
      throw new NodemyResponseError(400, "Course id must contain 24 characters!");
    }

    if (typeof title !== "string") {
        throw new NodemyResponseError(400, "Type of rating's title must be string!");
    }

    if (typeof description !== "string") {
        throw new NodemyResponseError(400, "Type of rating's description must be string!");
    }

    if (typeof rating !== "number") {
        throw new NodemyResponseError(400, "Type of rating's rating must be number!");
    }
};

module.exports = updateRatingRequest;
