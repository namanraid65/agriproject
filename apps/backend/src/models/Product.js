// models/Product.js
import mongoose from "mongoose";
import slugify from "slugify";

const { Schema, model, models } = mongoose;

const imageSchema = new Schema(
  {
    url:      { 
      type: String, 
      required: true,
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
    isPrimary: { type: Boolean, default: false },
    altText:  { type: String, trim: true },
  },
  { _id: true, toJSON: { getters: true }, toObject: { getters: true } }
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
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator: function (value) {
          if (value !== undefined && value !== null) {
            return value < this.retailPrice;
          }
          return true;
        },
        message: "Discount price must be less than regular retail price"
      }
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
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating must be at most 5'],
      set: val => Math.round(val * 10) / 10
    },
    numReviews: {
      type: Number,
      default: 0
    },
    faqs: {
      type: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true }
        }
      ],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true, getters: true },
    toObject:   { virtuals: true, getters: true },
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

// ── Helper to generate default trust FAQs ─────────────────
const generateFAQsForProduct = (product) => {
  const commonFAQs = [
    {
      question: "How is the quality of this product verified?",
      answer: "All our agricultural products undergo strict quality checks. We source directly from certified manufacturers and authorized distributors to ensure 100% authenticity, purity, and effectiveness."
    },
    {
      question: "What is the return or refund policy for this product?",
      answer: "We offer a hassle-free 7-day return policy for unopened and unused items. If you receive a damaged package or have quality concerns, please contact our support team immediately for a replacement or refund."
    }
  ];

  const seedsFAQs = [
    {
      question: "What is the germination rate of these seeds?",
      answer: "Our seeds are tested regularly and maintain a germination rate of 85% to 95% under standard nursery conditions. Ensure proper soil moisture and planting depth for best results."
    },
    {
      question: "How should these seeds be stored if not used immediately?",
      answer: "Store seeds in a cool, dry, and dark place (ideally in an airtight container) away from direct sunlight and moisture to maintain their viability for up to 12-18 months."
    }
  ];

  const toolsFAQs = [
    {
      question: "Does this farming tool come with any warranty?",
      answer: "Yes, all our agricultural tools and equipment come with a 6-month warranty covering manufacturing defects. We also provide replacement parts if needed."
    },
    {
      question: "Is this tool suitable for heavy clay soil?",
      answer: "Yes, this tool is constructed using heavy-duty reinforced carbon steel, making it highly durable and suitable for all agricultural soil types, including hard clay."
    }
  ];

  const fertilizerFAQs = [
    {
      question: "Is this product safe for organic farming?",
      answer: (product.name?.toLowerCase().includes("organic") || product.description?.toLowerCase().includes("organic"))
        ? "Yes, this product is 100% organic and OMRI-listed/NPOP-certified, making it completely safe and recommended for organic farming."
        : "This is a high-grade mineral/chemical nutrient. While highly effective for crop yield, please refer to the application guide for recommended safety intervals before harvest."
    },
    {
      question: "What is the correct dosage and application frequency?",
      answer: "Application rates vary by crop. Generally, mix as per instructions (usually 2-3g per liter of water) and apply every 14-21 days during the active growth stages. Avoid over-application."
    }
  ];

  let categoryFAQs = [];
  const nameLower = product.name?.toLowerCase() || "";
  
  if (nameLower.includes("seed")) {
    categoryFAQs = seedsFAQs;
  } else if (nameLower.includes("tool") || nameLower.includes("shovel") || nameLower.includes("pruner") || nameLower.includes("sickle") || nameLower.includes("sprayer") || nameLower.includes("wheelbarrow")) {
    categoryFAQs = toolsFAQs;
  } else if (nameLower.includes("fertilizer") || nameLower.includes("oil") || nameLower.includes("nutrient") || nameLower.includes("npk") || nameLower.includes("urea") || nameLower.includes("growth") || nameLower.includes("pesticide")) {
    categoryFAQs = fertilizerFAQs;
  } else {
    categoryFAQs = [
      {
        question: "Is this product sourced direct from local farmers?",
        answer: "Yes, we prioritize fair-trade sourcing. This product is sourced directly from smallholder farmers and agricultural cooperatives, ensuring fair wages and authentic local quality."
      }
    ];
  }

  return [...categoryFAQs, ...commonFAQs];
};

// ── Pre-save: auto-generate slug ─────────────────────────
productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  // Auto-mark out_of_stock when stock hits 0
  if (this.isModified("stock") && this.stock === 0 && this.status === "active") {
    this.status = "out_of_stock";
  }
  // Auto-populate trust-building FAQs if empty
  if (!this.faqs || this.faqs.length === 0) {
    this.faqs = generateFAQsForProduct(this);
  }
  next();
});

const Product = models.Product || model("Product", productSchema);
export { Product };
export default Product;
