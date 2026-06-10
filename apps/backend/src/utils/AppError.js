// utils/AppError.js
// Centralized operational error class — distinguishes our errors from unexpected crashes

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Used in global error handler to decide what to expose

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
