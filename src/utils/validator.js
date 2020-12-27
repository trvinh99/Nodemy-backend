const { isValidObjectId } = require('mongoose');
const { ObjectId } = require('mongoose').Types;

const NodemyResponseError = require('./NodemyResponseError');

const isObjectId = (id = '', name = '', customMessage = '') => {
  const error = customMessage || `Format of ${name}'s is invalid!`;

  try {
    checkType(id, 'string', name, error);

    if (id.length !== 24) {
      throw new NodemyResponseError(400, error);
    }

    if (!isValidObjectId(id)) {
      throw new NodemyResponseError(400, error);
    }

    const parsedId = new ObjectId(id);
    if (parsedId.toHexString() !== id) {
      throw new NodemyResponseError(400, error);
    }
  }
  catch {
    throw new NodemyResponseError(400, error);
  }
};

const checkType = (data, type = '', name = '', customMessage = '') => {
  if (type !== 'bigint' && type !== 'boolean' && type !== 'function' && type !== 'number'
    && type !== 'object' && type !== 'string' && type !== 'symbol' && type !== 'undefined') {
    throw new NodemyResponseError(500, 'Internal Server Error');
  }

  if (typeof data !== type) {
    throw new NodemyResponseError(400, customMessage || `Type of ${name} must be ${type}!`);
  }
};

const stringConstraints = (string = '', name = '', constraints = {
  minLength: 0,
  maxLength: 1000000,
  isRequired: false,
}, customMessage = '') => {
  checkType(string, 'string', name);

  const str = string.trim();
  
  if (typeof constraints.minLength === 'number' && constraints.minLength >= 0) {
    if (str.length < constraints.minLength) {
      throw new NodemyResponseError(400, customMessage || `${name} must not contain less than ${constraints.minLength} characters!`);
    }
  }

  if (typeof constraints.maxLength === 'number' && constraints.maxLength >= 0) {
    if (str.length > constraints.maxLength) {
      throw new NodemyResponseError(400, customMessage || `${name} must not contain more than ${constraints.maxLength} characters!`);
    }
  }

  if (constraints.isRequired && !str) {
    throw new NodemyResponseError(400, customMessage || `${name} is required!`);
  }
};

const numberConstraints = (number = '', name = '', constraints = {
  min: 0,
  max: Math.max(),
}, customMessage = '') => {
  checkType(number, 'number', name);

  if (typeof constraints.min === 'number' && number < constraints.min) {
    throw new NodemyResponseError(400, customMessage || `${name} must not less than ${constraints.min}!`);
  }

  if (typeof constraints.max === 'number' && number > constraints.max) {
    throw new NodemyResponseError(400, customMessage || `${name} must not greater than ${constraints.max}!`);
  }
};

const objectConstraints = (object = {}, name = '', requiredProps = [], customMessage = '') => {
  checkType(object, 'object', name);

  if (!Array.isArray(requiredProps)) {
    throw new NodemyResponseError(500, 'Internal Server Error');
  }

  const returnObject = {};

  Object.keys(object).forEach((prop) => {
    if (!requiredProps.includes(prop)) {
      throw new NodemyResponseError(400, customMessage || `${name}'s body has redundant field(s)!`);
    }
    returnObject[prop] = object[prop];
  });

  return returnObject;
};

module.exports = {
  isObjectId,
  checkType,
  stringConstraints,
  numberConstraints,
  objectConstraints,
};