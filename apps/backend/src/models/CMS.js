// models/CMS.js
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

// ── Sub-schemas ──────────────────────────────────────────
const sectionSchema = new Schema(
  {
    title:    { type: String, trim: true },
    subtitle: { type: String, trim: true },
    content:  { type: String },
    image:    { url: String, publicId: String, altText: String },
    cta:      { label: String, href: String },
    order:    { type: Number, default: 0 },
    isVisible:{ type: Boolean, default: true },
  },
  { _id: true }
);

const bannerSchema = new Schema(
  {
    title:      { type: String, trim: true },
    subtitle:   { type: String, trim: true },
    image:      { url: { type: String, required: true }, publicId: String, altText: String },
    mobileImage:{ url: String, publicId: String },  // Optional separate mobile crop
    link:       { type: String },
    order:      { type: Number, default: 0 },
    isActive:   { type: Boolean, default: true },
    startsAt:   { type: Date },  // Optional scheduling
    endsAt:     { type: Date  },
  },
  { _id: true }
);

const testimonialSchema = new Schema(
  {
    authorName:    { type: String, required: true, trim: true },
    authorRole:    { type: String, trim: true },    // e.g. "CEO, Acme Corp"
    authorImage:   { url: String, publicId: String },
    rating:        { type: Number, min: 1, max: 5 },
    content:       { type: String, required: true },
    isVisible:     { type: Boolean, default: true },
    displayOrder:  { type: Number, default: 0 },
  },
  { _id: true }
);

// ── Main CMS Schema ──────────────────────────────────────
const cmsSchema = new Schema(
  {
    pageType: {
      type: String,
      enum: {
        values: ["homepage", "about", "policy"],
        message: "pageType must be homepage, about, or policy",
      },
      required: [true, "pageType is required"],
      unique: true, // One document per page type
    },
    title:       { type: String, trim: true, required: [true, "Title is required"] },
    metaTitle:   { type: String, trim: true, maxlength: 70 },   // SEO
    metaDescription: { type: String, trim: true, maxlength: 160 }, // SEO
    content:     { type: String }, // Rich text / markdown body
    heroImage: {
      url:      { type: String },
      publicId: { type: String },
      altText:  { type: String },
    },
    sections:     { type: [sectionSchema],    default: [] },
    banners:      { type: [bannerSchema],     default: [] },
    testimonials: { type: [testimonialSchema],default: [] },
    isPublished:  { type: Boolean, default: false },
    publishedAt:  { type: Date },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
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
