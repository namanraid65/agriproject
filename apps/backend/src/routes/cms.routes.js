import express from 'express';
import { getCMSPage, getAllCMSPages, upsertCMSPage } from '../controllers/cms.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllCMSPages);
router.get('/:pageType', getCMSPage); // public — frontend reads this
router.put('/:pageType', protect, adminOnly, upsertCMSPage);

export default router;
