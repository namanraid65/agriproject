// models/Order.js
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

// ── Order item sub-schema ─────────────────────────────────
// Prices are SNAPSHOTTED at order time — never reference live product price
const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name:     { type: String, required: true },   // Snapshot of product name
    image:    { type: String },                   // Snapshot of primary image URL
    quantity: { type: Number, required: true, min: [1, "Quantity must be at least 1"] },
    price:    { type: Number, required: true, min: [0, "Price cannot be negative"] }, // Unit price at order time
  },
  { _id: true }
);

// ── Virtual: line total ───────────────────────────────────
orderItemSchema.virtual("lineTotal").get(function () {
  return this.quantity * this.price;
});

// ── Shipping address sub-schema ───────────────────────────
const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    line1:    { type: String, required: true, trim: true },
    line2:    { type: String, trim: true },
    city:     { type: String, required: true, trim: true },
    state:    { type: String, required: true, trim: true },
    pincode:  { type: String, required: true, trim: true, match: [/^\d{6}$/, "Invalid pincode"] },
    country:  { type: String, default: "India" },
  },
  { _id: false }
);

// ── Main Order Schema ─────────────────────────────────────
const orderSchema = new Schema(
  {
    // Auto-incremented human-readable order number (see pre-save)
    orderNumber: { type: String, unique: true },

    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must have at least one item",
      },
    },

    // ── Financials ────────────────────────────────────────
    subtotal:     { type: Number, required: true, min: 0 }, // Sum of line totals
    discount:     { type: Number, default: 0, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    totalAmount:  { type: Number, required: true, min: 0 }, // Final amount charged

    // ── Order status flow ─────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
        message: "Invalid order status",
      },
      default: "pending",
    },

    // ── Payment ───────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "paid", "failed", "refunded"],
        message: "Invalid payment status",
      },
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "bank_transfer", "upi"],
    },
    paymentId: { type: String }, // Gateway transaction ID

    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },

    // ── Tracking ──────────────────────────────────────────
    trackingNumber: { type: String, trim: true },
    carrier:        { type: String, trim: true },

    notes: { type: String, maxlength: 500 }, // Customer notes
    cancelReason: { type: String },          // Populated if status = cancelled
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 }); // Compound for customer order history

// ── Virtual: item count ───────────────────────────────────
orderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ── Pre-save: generate order number ──────────────────────
orderSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  // Format: ORD-YYYYMMDD-XXXXX (padded random suffix for uniqueness)
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  this.orderNumber = `ORD-${datePart}-${suffix}`;
  next();
});

const Order = models.Order || model("Order", orderSchema);
export { Order };
export default Order;
