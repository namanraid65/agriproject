// routes/auth.routes.js
import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateMe,
  changePassword,
  getAllUsers,
  toggleUserStatus,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} from "../controllers/auth.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { validateRegister, validateLogin } from "../middleware/validate.js";

const router = express.Router();

// ── Public routes ─────────────────────────────────────────
router.post("/register", validateRegister, register);
router.post("/login",    validateLogin,    login);

// ── Private: any authenticated user ──────────────────────
router.post  ("/logout",          protect, logout);
router.get   ("/me",              protect, getMe);
router.patch ("/me",              protect, updateMe);
router.patch ("/change-password", protect, changePassword);

// ── Admin only ────────────────────────────────────────────
router.get  ("/admin/users",                  protect, adminOnly, getAllUsers);
router.post ("/admin/users",                  protect, adminOnly, createUserByAdmin);
router.patch("/admin/users/:id/toggle-status",protect, adminOnly, toggleUserStatus);
router.patch("/admin/users/:id",              protect, adminOnly, updateUserByAdmin);
router.delete("/admin/users/:id",             protect, adminOnly, deleteUserByAdmin);

export default router;
