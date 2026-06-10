// models/Enquiry.js
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const enquirySchema = new Schema(
  {
    type: {
      type: String,
      required: [true, "Enquiry type is required"],
      enum: {
        values: ["product", "bulk", "general"],
        message: "Type must be product, bulk, or general",
      },
    },

    // ── Optional product reference (for type: 'product' | 'bulk') ──
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    // ── Contact details ─────────────────────────────────
    companyName: {
      type: String,
      trim: true,
      // Required only for bulk enquiries (validated below)
    },
    contactPerson: {
      type: String,
      required: [true, "Contact person name is required"],
      trim: true,
      maxlength: [100, "Contact person name too long"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid 10-digit phone number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    // ── Enquiry body ─────────────────────────────────────
    quantity: {
      type: Number,
      min: [1, "Quantity must be at least 1"],
    },
    message: {
      type: String,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },

    // ── Workflow status ───────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ["pending", "reviewed", "closed"],
        message: "Status must be pending, reviewed, or closed",
      },
      default: "pending",
    },
    adminNotes: {
      type: String, // Internal notes, never exposed to customer
      select: false,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────
enquirySchema.index({ status: 1 });
enquirySchema.index({ type: 1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ product: 1 });
enquirySchema.index({ createdAt: -1 }); // Latest enquiries first in admin panel

// ── Custom validation: companyName required for bulk ────
enquirySchema.pre("validate", function (next) {
  if (this.type === "bulk" && !this.companyName?.trim()) {
    this.invalidate("companyName", "Company name is required for bulk enquiries");
  }
  if (this.type === "product" && !this.product) {
    this.invalidate("product", "Product reference is required for product-specific enquiries");
  }
  next();
});

// ── Pre-save: stamp reviewedAt when status changes ──────
enquirySchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "reviewed" && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

const Enquiry = models.Enquiry || model("Enquiry", enquirySchema);
export { Enquiry };
export default Enquiry;
