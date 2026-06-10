import mongoose from 'mongoose';
import { RFQStatus } from '@open-agri/shared';

const rfqItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { type: Number, required: true },
  targetPrice: { type: Number } // Target unit price proposed by buyer
});

const rfqSchema = new mongoose.Schema({
  buyer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [rfqItemSchema],
  notes: { type: String },
  status: {
    type: String,
    enum: Object.values(RFQStatus),
    default: RFQStatus.SUBMITTED
  },
  quoteDetails: {
    quotedPrice: { type: Number }, // Counter-price proposed by admin/supplier
    validUntil: { type: Date },
    adminNotes: { type: String }
  }
}, { timestamps: true });

export const RFQ = mongoose.model('RFQ', rfqSchema);
export default RFQ;
