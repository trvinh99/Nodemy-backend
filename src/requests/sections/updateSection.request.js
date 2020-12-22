const NodemyResponseError = require("../../utils/NodemyResponseError");

const updateSectionRequest = ({ body }) => {
    if (typeof body !== "object") {
        throw new NodemyResponseError(400, "Type of update section's body must be object!");
    }
    const {
        sectionName,
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
            throw new NodemyResponseError(400, "Section's name must not contain more than 200 characters!");
        }
    }
};

module.exports = updateSectionRequest;
