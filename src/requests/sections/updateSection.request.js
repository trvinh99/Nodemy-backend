const NodemyResponseError = require("../../utils/NodemyResponseError");

const updateSectionRequest = ({ body }) => {
    if (typeof body !== "object") {
        throw new NodemyResponseError(400, "Type of update section's body must be object!");
    }
    const {
        courseId,
        sectionName,
        lectures,
        ...rest
    } = body;

    if (Object.keys(rest).length !== 0) {
        throw new NodemyResponseError(400, "Update section's body has redundant field(s)!");
    }
    if (sectionName !== undefined) {
        if (typeof sectionName !== "string") {
            throw new NodemyResponseError(400, "Type of section's name must be string!");
        }

        if (sectionName.length > 200) {
            throw new NodemyResponseError(400, "Section's name must contain less than 200 characters!");
        }
    }

    if (lectures !== undefined) {
        if (typeof lectures !== 'undefined') {
            if (!Array.isArray(lectures)) {
                throw new NodemyResponseError(400, "Type of section's lectures must be array!");
            }
        }
    }

    if (courseId !== undefined) {
        if (typeof courseId !== "string") {
            throw new NodemyResponseError(400, "Type of section's course id must be string!");
        }
    
        if (courseId.length !== 24) {
            throw new NodemyResponseError(400, "Course id must contain 24 characters!");
        }
    }
};

module.exports = updateSectionRequest;
