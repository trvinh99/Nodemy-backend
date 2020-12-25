const createRatingError = (error) => {
  let errorMessage = error.message;
  if (error.message.includes("required")) {
    errorMessage = "Create rating request's body is invalid!";
  }

  return errorMessage;
};

const updateRatingError = (error) => {
  let errorMessage = error.message;
  if (error.message.includes("required")) {
    errorMessage = "Update rating request's body is invalid!";
  }

  return errorMessage;
};

module.exports = {
  createRatingError,
  updateRatingError,
};