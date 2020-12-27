const { objectConstraints } = require("../../utils/validator");

const getListCategoriesRequest = async ({ query }) => {
  objectConstraints(query, "Get list categories's query", ['name']);
};

module.exports = getListCategoriesRequest;
