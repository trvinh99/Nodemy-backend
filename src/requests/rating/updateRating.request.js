const NodemyResponseError = require("../../utils/NodemyResponseError");

const updateRatingRequest = ({ body }) => {
    if (typeof body !== "object") {
        throw new NodemyResponseError(400, "Type of update rating's body must be object!");
    }
    const {
        title,
        description,
        rating,
        ...rest
    } = body;

    if (Object.keys(rest).length !== 0) {
        throw new NodemyResponseError(400, "Update rating's body has redundant field(s)!");
    }
    if (title !== undefined) {
        if (typeof title !== "string") {
            throw new NodemyResponseError(400, "Type of rating's title must be string!");
        }
    }

    if (description !== undefined) {
        if (typeof description !== "string") {
            throw new NodemyResponseError(400, "Type of rating's description must be string!");
        }
    }

    if (rating !== undefined) {
        if (typeof rating !== "number") {
            throw new NodemyResponseError(400, "Type of rating's rating must be number!");
        }
    }
};

module.exports = updateRatingRequest;
