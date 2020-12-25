const createSectionError = (error) => {
  let errorMessage = error.message;
  if (error.message.includes("required")) {
    errorMessage = "Create section request's body is invalid!";
  }

  return errorMessage;
};

const updateSectionError = (error) => {
  let errorMessage = error.message;
  if (error.message.includes("required")) {
    errorMessage = "Update section request's body is invalid!";
  }

  return errorMessage;
};

module.exports = {
  createSectionError,
  updateSectionError,
};
