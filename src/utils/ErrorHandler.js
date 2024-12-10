class ErrorHandler extends Error {
  constructor(statusCode, message = "something went wrong", errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }
}
module.exports = ErrorHandler;
