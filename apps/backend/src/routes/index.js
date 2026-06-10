// routes/index.js
import express from 'express';
import authRouter from './auth.routes.js';
import productRouter from './product.routes.js';
import categoryRouter from './category.routes.js';
import orderRouter from './order.routes.js';
import enquiryRouter from './enquiry.routes.js';

import cmsRouter from './cms.routes.js';
import settingsRouter from './settings.routes.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/categories', categoryRouter);
router.use('/orders', orderRouter);
router.use('/enquiries', enquiryRouter);
router.use('/cms', cmsRouter);
router.use('/settings', settingsRouter);

export default router;
