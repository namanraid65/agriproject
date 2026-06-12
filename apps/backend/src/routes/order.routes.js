// routes/order.routes.js
import express from 'express';
import { createOrder, getOrderById, getMyOrders, getAllOrders, updateOrderStatus, cancelOrder, returnOrder, getTickerStats } from '../controllers/order.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { marketModeDetector } from '../middleware/marketMode.js';

const router = express.Router();

// Add admin order routes
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.patch('/admin/:id/status', protect, adminOnly, updateOrderStatus);

// Public routes
router.get('/ticker-stats', getTickerStats);

// Apply auth protection globally to all customer order endpoints
router.use(protect);

router.post('/', marketModeDetector, createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);
router.patch('/:id/return', returnOrder);

export default router;
