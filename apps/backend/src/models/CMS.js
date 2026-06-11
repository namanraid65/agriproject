// models/CMS.js
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const cmsImageSchema = new Schema(
  {
    url: {
      type: String,
      get: function(url) {
        if (url && url.startsWith('/uploads/')) {
          const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
          return `${baseUrl}${url}`;
        }
        return url;
      }
    },
    publicId: String,
    altText: String
  },
  { _id: false, toJSON: { getters: true }, toObject: { getters: true } }
);

// ── Sub-schemas ──────────────────────────────────────────
const sectionSchema = new Schema(
  {
    title:    { type: String, trim: true },
    subtitle: { type: String, trim: true },
    content:  { type: String },
    image:    { type: cmsImageSchema },
    cta:      { label: String, href: String },
    order:    { type: Number, default: 0 },
    isVisible:{ type: Boolean, default: true },
  },
  { _id: true, toJSON: { getters: true }, toObject: { getters: true } }
);

const bannerSchema = new Schema(
  {
    title:      { type: String, trim: true },
    subtitle:   { type: String, trim: true },
    image:      { type: cmsImageSchema, required: true },
    mobileImage:{ type: cmsImageSchema },  // Optional separate mobile crop
    link:       { type: String },
    order:      { type: Number, default: 0 },
    isActive:   { type: Boolean, default: true },
    startsAt:   { type: Date },  // Optional scheduling
    endsAt:     { type: Date  },
  },
  { _id: true, toJSON: { getters: true }, toObject: { getters: true } }
);

const testimonialSchema = new Schema(
  {
    authorName:    { type: String, required: true, trim: true },
    authorRole:    { type: String, trim: true },    // e.g. "CEO, Acme Corp"
    authorImage:   { type: cmsImageSchema },
    rating:        { type: Number, min: 1, max: 5 },
    content:       { type: String, required: true },
    isVisible:     { type: Boolean, default: true },
    displayOrder:  { type: Number, default: 0 },
  },
  { _id: true, toJSON: { getters: true }, toObject: { getters: true } }
);

// ── Main CMS Schema ──────────────────────────────────────
const cmsSchema = new Schema(
  {
    pageType: {
      type: String,
      enum: {
        values: ["homepage", "about", "contact", "privacy", "terms", "shipping", "returns", "faq", "policy"],
        message: "pageType must be homepage, about, contact, privacy, terms, shipping, returns, faq, or policy",
      },
      required: [true, "pageType is required"],
      unique: true, // One document per page type
    },
    title:       { type: String, trim: true, required: [true, "Title is required"] },
    metaTitle:   { type: String, trim: true, maxlength: 70 },   // SEO
    metaDescription: { type: String, trim: true, maxlength: 160 }, // SEO
    content:     { type: String }, // Rich text / markdown body
    heroImage:   { type: cmsImageSchema },
    sections:     { type: [sectionSchema],    default: [] },
    banners:      { type: [bannerSchema],     default: [] },
    testimonials: { type: [testimonialSchema],default: [] },
    isPublished:  { type: Boolean, default: false },
    publishedAt:  { type: Date },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true, getters: true },
    toObject:   { virtuals: true, getters: true },
  }
);

// ── Indexes ──────────────────────────────────────────────
cmsSchema.index({ pageType: 1 });   // unique already covers this; for fast lookups
cmsSchema.index({ isPublished: 1 });

// ── Pre-save: stamp publishedAt when going live ──────────
cmsSchema.pre("save", function (next) {
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const CMS = models.CMS || model("CMS", cmsSchema);
export { CMS };
export default CMS;
