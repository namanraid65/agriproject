// controllers/review.controller.js
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import AppError from '../utils/AppError.js';

// POST /api/products/:id/reviews
// Private (Only verified purchasers)
export const addProductReview = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    if (!rating) {
      return next(new AppError('Please provide a star rating (1-5).', 400));
    }

    // 1. Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    // 2. Enforce verified purchase: user must have placed an order containing this product
    const hasOrdered = await Order.findOne({
      customer: userId,
      'items.product': productId,
      status: { $ne: 'cancelled' }
    });

    if (!hasOrdered) {
      return next(new AppError('You can only review products that you have purchased.', 403));
    }

    // 3. Verify user hasn't already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return next(new AppError('You have already submitted a review for this product.', 400));
    }

    // 4. Create review
    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment
    });

    res.status(201).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id/reviews
// Public
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id/can-review
// Private
export const checkUserCanReview = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    // Check if user has ordered the product
    const hasOrdered = await Order.findOne({
      customer: userId,
      'items.product': productId,
      status: { $ne: 'cancelled' }
    });

    if (!hasOrdered) {
      return res.status(200).json({
        status: 'success',
        data: { canReview: false, reason: 'You must purchase this product before writing a review.' }
      });
    }

    // Check if user has already reviewed the product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(200).json({
        status: 'success',
        data: { canReview: false, reason: 'You have already reviewed this product.' }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { canReview: true }
    });
  } catch (error) {
    next(error);
  }
};
