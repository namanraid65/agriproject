// routes/product.routes.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { getAll, getOne, create, update, deleteProduct } from '../controllers/product.controller.js';
import { addProductReview, getProductReviews, checkUserCanReview } from '../controllers/review.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import AppError from '../utils/AppError.js';

// ── Multer Storage Setup ──────────────────────────────────
let storage;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'agriproject/products',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
  });
} else {
  // Fallback to local disk storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const randomHex = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.originalname);
      cb(null, `${randomHex}${ext}`);
    }
  });
}

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPG, PNG, and WebP image uploads are allowed.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file limit
});

// ── Validation Middlewares ───────────────────────────────
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category ID is required')
    .isMongoId().withMessage('Invalid Category ID format'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('retailPrice')
    .notEmpty().withMessage('Retail price is required')
    .isFloat({ min: 0 }).withMessage('Retail price cannot be negative'),
  body('stock')
    .notEmpty().withMessage('Stock level is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map(err => err.msg).join('. ');
      return next(new AppError(messages, 400));
    }
    next();
  }
];

const router = express.Router();

// ── Public Routes ─────────────────────────────────────────
router.get('/', getAll);
router.get('/:id', getOne);
router.get('/:id/reviews', getProductReviews);

// ── Protected Routes ──────────────────────────────────────
router.post('/:id/reviews', protect, addProductReview);
router.get('/:id/can-review', protect, checkUserCanReview);

// ── Admin Protected Routes ────────────────────────────────
router.post(
  '/', 
  protect, 
  adminOnly, 
  upload.array('images', 10), // Limit uploads to max 10 files
  validateProduct, 
  create
);

router.patch(
  '/:id', 
  protect, 
  adminOnly, 
  upload.array('images', 10), 
  update
);

router.delete(
  '/:id', 
  protect, 
  adminOnly, 
  deleteProduct
);

export default router;
