// models/Product.js
import mongoose from "mongoose";
import slugify from "slugify";

const { Schema, model, models } = mongoose;

const imageSchema = new Schema(
  {
    url:      { type: String, required: true },
    publicId: { type: String }, // Cloudinary / S3 key for deletion
    isPrimary: { type: Boolean, default: false },
    altText:  { type: String, trim: true },
  },
  { _id: true }
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ── Relationships ──────────────────────────────────
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    // ── Media ─────────────────────────────────────────
    images: {
      type: [imageSchema],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "A product cannot have more than 10 images",
      },
    },

    // ── Content ───────────────────────────────────────
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    specifications: {
      type: Schema.Types.Mixed, // Flexible key-value pairs (e.g. { material, weight, dimensions })
      default: {},
    },

    // ── Pricing & Inventory ───────────────────────────
    retailPrice: {
      type: Number,
      required: [true, "Retail price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: [1, "Minimum order quantity cannot be less than 1"],
    },
    unit: {
      type: String,
      default: "units",
      trim: true,
    },
    wholesalePricing: [
      {
        minQuantity: {
          type: Number,
          required: [true, "Wholesale tier minimum quantity is required"],
          min: [1, "Minimum quantity must be at least 1"],
        },
        pricePerUnit: {
          type: Number,
          required: [true, "Wholesale tier price per unit is required"],
          min: [0, "Price per unit cannot be negative"],
        },
      },
    ],

    // ── Visibility ────────────────────────────────────
    b2bVisible: { type: Boolean, default: true  }, // Visible to business/wholesale buyers
    b2cVisible: { type: Boolean, default: true  }, // Visible to retail customers

    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "draft", "out_of_stock"],
        message: "Invalid product status",
      },
      default: "draft",
    },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ b2bVisible: 1, b2cVisible: 1 });
productSchema.index({ featured: 1, status: 1 });           // Compound for featured-active listings
productSchema.index({ retailPrice: 1 });                    // For price-sort queries
productSchema.index({ name: "text", description: "text" }); // Full-text search

// ── Virtual: inStock flag ────────────────────────────────
productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

// ── Virtual: primary image ───────────────────────────────
productSchema.virtual("primaryImage").get(function () {
  const primary = this.images?.find((img) => img.isPrimary);
  return primary || this.images?.[0] || null;
});

// ── Pre-save: auto-generate slug ─────────────────────────
productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  // Auto-mark out_of_stock when stock hits 0
  if (this.isModified("stock") && this.stock === 0 && this.status === "active") {
    this.status = "out_of_stock";
  }
  next();
});

const Product = models.Product || model("Product", productSchema);
export { Product };
export default Product;
