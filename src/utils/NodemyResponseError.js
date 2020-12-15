class NodemyResponseError extends Error {
  constructor(code = 400, message = 'Unexpected error') {
    super(message);

    this.code = code;
    this.message = message;
  }

  toString() {
    return `Code ${this.code}\nMessage: ${this.message}`;
  }
}

module.exports = NodemyResponseError;
