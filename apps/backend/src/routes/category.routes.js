// routes/category.routes.js
import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/categories — public, returns active categories sorted by displayOrder; adminView=true returns all
router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.adminView === 'true' ? {} : { status: 'active' };
    const categories = await Category.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .populate('products');

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:id — public, single category
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ status: 'fail', message: 'Category not found.' });
    }
    res.status(200).json({ status: 'success', data: { category } });
  } catch (err) {
    next(err);
  }
});

import { protect, adminOnly } from '../middleware/auth.middleware.js';
import slugify from 'slugify';
import AppError from '../utils/AppError.js';

// POST /api/categories — admin only
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, description, image, displayOrder } = req.body;
    if (!name) return next(new AppError('Category name is required.', 400));
    const slug = slugify(name, { lower: true, strict: true });
    const category = await Category.create({ name, slug, description, image, displayOrder });
    res.status(201).json({ status: 'success', data: { category } });
  } catch (err) { next(err); }
});

// PATCH /api/categories/:id — admin only
router.patch('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return next(new AppError('Category not found.', 404));
    res.status(200).json({ status: 'success', data: { category } });
  } catch (err) { next(err); }
});

// DELETE /api/categories/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new AppError('Category not found.', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
});

export default router;
