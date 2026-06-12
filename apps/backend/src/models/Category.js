// models/Category.js
import mongoose from "mongoose";
import slugify from "slugify";

const { Schema, model, models } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      // Auto-generated from name if not provided (see pre-save)
    },
    image: {
      url:      { 
        type: String,
        get: function(url) {
          if (url && url.startsWith('/uploads/')) {
            let baseUrl = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;
            if (baseUrl.endsWith('/')) {
              baseUrl = baseUrl.slice(0, -1);
            }
            if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
              baseUrl = `https://${baseUrl}`;
            }
            return `${baseUrl}${url}`;
          }
          return url;
        }
      },
      publicId: { type: String }, // Cloudinary / S3 key for deletion
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: { values: ["active", "inactive"], message: "Status must be active or inactive" },
      default: "active",
    },
    displayOrder: {
      type: Number,
      default: 0, // Lower = appears first in lists
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true, getters: true },
    toObject:   { virtuals: true, getters: true },
  }
);

// ── Indexes ──────────────────────────────────────────────
categorySchema.index({ slug: 1 });
categorySchema.index({ status: 1, displayOrder: 1 }); // Compound for sorted active category lists

// ── Virtual: product count (populated separately via aggregation) ─
// Use Category.aggregate with $lookup for real count; this is a placeholder
categorySchema.virtual("products", {
  ref:          "Product",
  localField:   "_id",
  foreignField: "category",
  count:        true, // Returns count instead of docs
});

// ── Pre-save: auto-generate slug from name ───────────────
categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Category = models.Category || model("Category", categorySchema);
export { Category };
export default Category;
