// middleware/errorHandler.js
import AppError from "../utils/AppError.js";

// ── Mongoose-specific error translators ──────────────────
const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists. Please use a different value.`, 409);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message).join(". ");
  return new AppError(`Validation failed: ${messages}`, 400);
};

// ── Response formatters ───────────────────────────────────
const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status:     err.status,
    message:    err.message,
    stack:      err.stack,
    error:      err,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    // Safe to expose — we created this error intentionally
    res.status(err.statusCode).json({
      status:  err.status,
      message: err.message,
    });
  } else {
    // Programming or unknown error — don't leak details
    console.error("UNEXPECTED ERROR:", err);
    res.status(500).json({
      status:  "error",
      message: "Something went wrong. Please try again later.",
    });
  }
};

// ── Global error handling middleware ─────────────────────
const errorHandler = (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status     = err.status     || "error";

  if (process.env.NODE_ENV === "development") {
    return sendDevError(err, res);
  }

  // Translate known Mongoose errors into operational AppErrors
  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
  if (error.name === "CastError")         error = handleCastError(error);
  if (error.code === 11000)               error = handleDuplicateKey(error);
  if (error.name === "ValidationError")   error = handleValidationError(error);

  sendProdError(error, res);
};

export default errorHandler;
