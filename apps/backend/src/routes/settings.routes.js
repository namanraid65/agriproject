import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getSettings); // public — frontend reads site name, mode, contact info
router.patch('/', protect, adminOnly, updateSettings);

export default router;
