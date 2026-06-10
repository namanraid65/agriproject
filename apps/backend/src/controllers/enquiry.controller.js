// controllers/enquiry.controller.js
import Enquiry from '../models/Enquiry.js';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';

// ─────────────────────────────────────────────────────────────
// CREATE ENQUIRY
// POST /api/enquiries
// Public (Auth optional)
// ─────────────────────────────────────────────────────────────
export const createEnquiry = async (req, res, next) => {
  try {
    const {
      type,
      product,
      companyName,
      contactPerson,
      phone,
      email,
      quantity,
      message,
    } = req.body;

    const enquiry = new Enquiry({
      type,
      product: product || null,
      companyName,
      contactPerson,
      phone,
      email,
      quantity,
      message,
    });

    const savedEnquiry = await enquiry.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        enquiry: savedEnquiry,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET ALL ENQUIRIES
// GET /api/enquiries
// Private (Admin only)
// ─────────────────────────────────────────────────────────────
export const getEnquiries = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    const enquiries = await Enquiry.find(filter)
      .populate('product', 'name images retailPrice')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: enquiries.length,
      data: {
        enquiries,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE ENQUIRY STATUS
// PATCH /api/enquiries/:id
// Private (Admin only)
// ─────────────────────────────────────────────────────────────
export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return next(new AppError('Enquiry not found.', 404));
    }

    if (status) {
      enquiry.status = status;
      if (status === 'reviewed') {
        enquiry.reviewedAt = new Date();
      }
    }
    
    if (adminNotes !== undefined) {
      enquiry.adminNotes = adminNotes;
    }

    enquiry.reviewedBy = req.user._id;

    const updatedEnquiry = await enquiry.save();

    res.status(200).json({
      status: 'success',
      data: {
        enquiry: updatedEnquiry,
      },
    });
  } catch (error) {
    next(error);
  }
};
