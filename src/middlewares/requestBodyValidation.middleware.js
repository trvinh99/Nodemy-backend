const Ajv = require('ajv');

const requestBodyValidation = (schema) => (req, res, next) => {
  const { message, ..._schema } = schema;

  const validator = new Ajv({ allErrors: true });
  const validate = validator.compile(_schema);
  const valid = validate(req.body);
  if (!valid) {
    return res.status(400).send({
      error: message,
    });
  }

  next();
};

module.exports = requestBodyValidation;
