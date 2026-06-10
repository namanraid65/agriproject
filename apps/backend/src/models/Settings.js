// models/Settings.js
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

// ── Social links sub-schema ───────────────────────────────
const socialLinksSchema = new Schema(
  {
    instagram: { type: String, trim: true },
    facebook:  { type: String, trim: true },
    twitter:   { type: String, trim: true },
    linkedin:  { type: String, trim: true },
    youtube:   { type: String, trim: true },
    whatsapp:  { type: String, trim: true }, // WhatsApp click-to-chat link
  },
  { _id: false }
);

// ── Settings Schema ───────────────────────────────────────
// This is a SINGLETON — only one document ever exists (enforced via constant key)
const settingsSchema = new Schema(
  {
    // Singleton lock: always query with { _singleton: "global" }
    _singleton: { type: String, default: "global", unique: true, immutable: true },

    siteName: {
      type: String,
      required: [true, "Site name is required"],
      trim: true,
      maxlength: [100, "Site name cannot exceed 100 characters"],
    },
    logo: {
      url:      { type: String },
      publicId: { type: String },
      darkUrl:  { type: String }, // Optional dark-mode logo variant
    },
    favicon: {
      url:      { type: String },
      publicId: { type: String },
    },

    // ── B2B / B2C mode ────────────────────────────────────
    defaultMode: {
      type: String,
      enum: {
        values: ["b2c", "b2b"],
        message: "defaultMode must be b2c or b2b",
      },
      default: "b2c",
    },

    // ── Contact information ───────────────────────────────
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid contact email"],
    },
    supportEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid support email"],
    },
    phone:       { type: String, trim: true },
    phoneAlt:    { type: String, trim: true }, // Optional secondary number
    address: {
      line1:   { type: String, trim: true },
      line2:   { type: String, trim: true },
      city:    { type: String, trim: true },
      state:   { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
    },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },

    // ── SEO defaults ──────────────────────────────────────
    seoDefaults: {
      metaTitle:       { type: String, trim: true, maxlength: 70  },
      metaDescription: { type: String, trim: true, maxlength: 160 },
      ogImage:         { url: String, publicId: String },
    },

    // ── Feature flags ─────────────────────────────────────
    features: {
      enableB2B:       { type: Boolean, default: false }, // Toggle B2B portal
      enableOrders:    { type: Boolean, default: true  },
      enableEnquiries: { type: Boolean, default: true  },
      maintenanceMode: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Static: get or create singleton ──────────────────────
// Usage: const settings = await Settings.getSingleton();
settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ _singleton: "global" });
  if (!doc) {
    doc = await this.create({ siteName: "My Site" });
  }
  return doc;
};

const Settings = models.Settings || model("Settings", settingsSchema);
export { Settings };
export default Settings;
