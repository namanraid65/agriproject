// middleware/validate.js
import AppError from "../utils/AppError.js";

// Lightweight validation helper — avoids pulling in express-validator for simple cases
// Each validator is a plain function: (value, fieldName) => throws AppError or returns clean value

const isEmail = (val) => /^\S+@\S+\.\S+$/.test(val);

/**
 * validateRegister
 * Checks all required fields before the request reaches the controller.
 */
export const validateRegister = (req, _res, next) => {
  const { name, email, password } = req.body;

  if (!name?.trim()) {
    return next(new AppError("Name is required", 400));
  }
  if (name.trim().length < 2) {
    return next(new AppError("Name must be at least 2 characters", 400));
  }
  if (!email?.trim()) {
    return next(new AppError("Email is required", 400));
  }
  if (!isEmail(email.trim())) {
    return next(new AppError("Please provide a valid email address", 400));
  }
  if (!password) {
    return next(new AppError("Password is required", 400));
  }
  if (password.length < 8) {
    return next(new AppError("Password must be at least 8 characters", 400));
  }
  // Sanitize before passing downstream
  req.body.name  = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
};

/**
 * validateLogin
 */
export const validateLogin = (req, _res, next) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return next(new AppError("Email and password are required", 400));
  }
  if (!isEmail(email.trim())) {
    return next(new AppError("Please provide a valid email address", 400));
  }
  req.body.email = email.trim().toLowerCase();

  next();
};
