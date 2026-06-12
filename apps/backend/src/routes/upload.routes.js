// routes/upload.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import AppError from '../utils/AppError.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${randomHex}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPG, PNG, GIF, and WebP image uploads are allowed.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/upload - Admin upload endpoint
router.post('/', protect, adminOnly, upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded.', 400));
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      status: 'success',
      url: fileUrl
    });
  } catch (err) {
    next(err);
  }
});

export default router;
