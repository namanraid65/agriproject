// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { UserRoles } from "@open-agri/shared";

/**
 * protect
 * Verifies the JWT from either:
 *   1. httpOnly cookie  (browser clients)
 *   2. Authorization: Bearer <token> header  (mobile / API clients)
 *
 * Attaches the full user document to req.user on success.
 */
export const protect = async (req, _res, next) => {
  try {
    // ── 1. Extract token ────────────────────────────────
    let token;

    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in. Please log in to continue.", 401));
    }

    // ── 2. Verify signature + expiry ────────────────────
    let decoded;
    try {
      if (!process.env.JWT_SECRET) throw new AppError('JWT_SECRET is not configured on this server.', 500);
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new AppError("Your session has expired. Please log in again.", 401));
      }
      if (err.name === "JsonWebTokenError") {
        return next(new AppError("Invalid token. Please log in again.", 401));
      }
      throw err; // Unexpected error — let global handler catch it
    }

    // ── 3. Check user still exists ──────────────────────
    const user = await User.findById(decoded.id).select("+passwordChangedAt");
    if (!user) {
      return next(new AppError("The account belonging to this token no longer exists.", 401));
    }

    // ── 4. Check account is active ──────────────────────
    if (!user.isActive) {
      return next(new AppError("Your account has been deactivated. Please contact support.", 403));
    }

    // ── 5. Guard against password-changed-after-issue ───
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("Password was recently changed. Please log in again.", 401));
    }

    // ── 6. Attach user + decoded payload to request ─────
    req.user = user;
    req.tokenPayload = decoded;

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * adminOnly
 * Must be used AFTER protect — protect guarantees req.user exists.
 * Restricts the route to users with role === 'admin'.
 */
export const adminOnly = (req, _res, next) => {
  if (req.user.role !== UserRoles.ADMIN) {
    return next(
      new AppError("You do not have permission to perform this action.", 403)
    );
  }
  next();
};

/**
 * restrictTo(...roles)
 * More flexible version of adminOnly — allows multiple allowed roles.
 * Usage: router.delete('/users/:id', protect, restrictTo('admin'), deleteUser)
 */
export const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
};
