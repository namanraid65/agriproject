// controllers/auth.controller.js
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import generateToken from "../utils/generateToken.js";
import { UserRoles } from "@open-agri/shared";

// ─────────────────────────────────────────────────────────────
// REGISTER
// POST /api/auth/register
// Public
// ─────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    // ── Check for duplicate email ─────────────────────────
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("An account with this email already exists.", 409));
    }

    // ── Validate and restrict role registration ───────────
    const roleToSet = (role && Object.values(UserRoles).includes(role) && role !== UserRoles.ADMIN)
      ? role
      : UserRoles.CUSTOMER;

    // ── Create user (password hashed in User pre-save hook) ─
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: roleToSet,
      address,
    });

    // ── Issue token ───────────────────────────────────────
    const token = generateToken(res, user._id, user.role);

    // ── Respond (never send password back) ───────────────
    res.status(201).json({
      status: "success",
      token,  // For API clients; browser clients use the cookie
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (err) {
    // Mongoose duplicate key (race condition after our check)
    if (err.code === 11000) {
      return next(new AppError("An account with this email already exists.", 409));
    }
    // Mongoose validation errors (schema-level)
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message).join(". ");
      return next(new AppError(messages, 400));
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// Public
// ─────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ── Fetch user WITH password (select: false on schema) ─
    const user = await User.findOne({ email }).select("+password");

    // ── Deliberate vague message — prevents user enumeration ─
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Incorrect email or password.", 401));
    }

    // ── Reject deactivated accounts ───────────────────────
    if (!user.isActive) {
      return next(new AppError("Your account has been deactivated. Please contact support.", 403));
    }

    // ── Stamp last login ──────────────────────────────────
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false }); // Skip full validation on stamp

    // ── Issue token ───────────────────────────────────────
    const token = generateToken(res, user._id, user.role);

    res.status(200).json({
      status: "success",
      token,
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// LOGOUT
// POST /api/auth/logout
// Private (protect middleware)
// ─────────────────────────────────────────────────────────────
export const logout = (_req, res) => {
  // Overwrite the cookie with an expired one — browser discards it immediately
  res.cookie("jwt", "loggedout", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0), // Epoch — expired immediately
  });

  res.status(200).json({ status: "success", message: "Logged out successfully." });
};

// ─────────────────────────────────────────────────────────────
// GET ME
// GET /api/auth/me
// Private (protect middleware)
// ─────────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by protect middleware
    // Re-fetch to get fresh data (e.g. name change by admin since token issued)
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    res.status(200).json({
      status: "success",
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE ME
// PATCH /api/auth/me
// Private (protect middleware)
// ─────────────────────────────────────────────────────────────
export const updateMe = async (req, res, next) => {
  try {
    // ── Block password changes via this route ─────────────
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError("This route is not for password updates. Use /change-password.", 400)
      );
    }

    // ── Block role changes via this route ─────────────────
    if (req.body.role) {
      return next(new AppError("You cannot change your own role.", 403));
    }

    // ── Only allow safe fields ────────────────────────────
    const allowedFields = ["name", "phone", "address"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message).join(". ");
      return next(new AppError(messages, 400));
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// PATCH /api/auth/change-password
// Private (protect middleware)
// ─────────────────────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError("Current password and new password are required.", 400));
    }
    if (newPassword.length < 8) {
      return next(new AppError("New password must be at least 8 characters.", 400));
    }
    if (currentPassword === newPassword) {
      return next(new AppError("New password must be different from the current password.", 400));
    }

    // ── Fetch with password ───────────────────────────────
    const user = await User.findById(req.user._id).select("+password");

    // ── Verify current password ───────────────────────────
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError("Current password is incorrect.", 401));
    }

    // ── Update (pre-save hook re-hashes automatically) ────
    user.password = newPassword;
    user.passwordChangedAt = new Date(); // Invalidates all existing JWTs
    await user.save();

    // ── Issue fresh token ─────────────────────────────────
    const token = generateToken(res, user._id, user.role);

    res.status(200).json({
      status: "success",
      token,
      message: "Password changed successfully.",
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN: GET ALL USERS
// GET /api/auth/admin/users
// Private + Admin only
// ─────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Hard cap at 100
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.role)   filter.role     = req.query.role;
    if (req.query.active) filter.isActive = req.query.active === "true";

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      status: "success",
      results: users.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      data: { users: users.map(sanitizeUser) },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN: TOGGLE USER ACTIVE STATUS
// PATCH /api/auth/admin/users/:id/toggle-status
// Private + Admin only
// ─────────────────────────────────────────────────────────────
export const toggleUserStatus = async (req, res, next) => {
  try {
    // ── Prevent self-deactivation ─────────────────────────
    if (req.params.id === req.user._id.toString()) {
      return next(new AppError("You cannot deactivate your own account.", 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError("User not found.", 404));

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully.`,
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// PRIVATE HELPER
// Strips internal fields before sending user data to client
// ─────────────────────────────────────────────────────────────
const sanitizeUser = (user) => ({
  _id:       user._id,
  name:      user.name,
  email:     user.email,
  role:      user.role,
  phone:     user.phone,
  address:   user.address,
  isActive:  user.isActive,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
