// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserRoles } from "@open-agri/shared";

const { Schema, model, models } = mongoose;

const addressSchema = new Schema(
  {
    line1:    { type: String, trim: true },
    line2:    { type: String, trim: true },
    city:     { type: String, trim: true },
    state:    { type: String, trim: true },
    pincode:  { type: String, trim: true, match: [/^\d{6}$/, "Invalid pincode"] },
    country:  { type: String, trim: true, default: "India" },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRoles),
        message: `Role must be one of: ${Object.values(UserRoles).join(", ")}`
      },
      default: UserRoles.CUSTOMER,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid 10-digit Indian phone number"],
    },
    address: addressSchema,

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    // Password reset flow
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ─────────────────────────────────────────────
userSchema.index({ email: 1 });          // unique already creates this, but explicit for clarity
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ── Virtual: full display name (extensible) ──────────────
userSchema.virtual("displayName").get(function () {
  return this.name;
});

// ── Pre-save: hash password only when modified ───────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare passwords ──────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: check if password changed after JWT ─
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    return parseInt(this.passwordChangedAt.getTime() / 1000, 10) > jwtTimestamp;
  }
  return false;
};

const User = models.User || model("User", userSchema);
export { User };
export default User;
