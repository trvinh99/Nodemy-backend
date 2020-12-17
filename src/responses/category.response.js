const createCategoryError = (error) => {
  let errorMessage = error.message;
  if (error.message.includes("required")) {
    errorMessage = "Create category request's body is invalid!";
  } else if (error.message.includes("duplicate")) {
    errorMessage = "Name is already exists";
  }

  return errorMessage;
};

const updateCategoryError = (error) => {
  let errorMessage = error.message;
  if (error.message.includes("required")) {
    errorMessage = "Update category request's body is invalid!";
  } else if (error.message.includes("duplicate")) {
    errorMessage = "Name is already exists";
  }

  return errorMessage;
};

module.exports = {
  createCategoryError,
  updateCategoryError,
};
