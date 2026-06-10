import express from 'express';
import {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
} from '../controllers/enquiry.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public / auth-optional route to submit an enquiry
router.post('/', createEnquiry);

// Admin-only protected routes to retrieve and update enquiries
router.get('/', protect, adminOnly, getEnquiries);
router.patch('/:id', protect, adminOnly, updateEnquiryStatus);

export default router;
