import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';
import slugify from 'slugify';
import { UserRoles } from '@open-agri/shared';

// ─────────────────────────────────────────────────────────────
// GET ALL PRODUCTS
// GET /api/products
// Public (Market mode aware)
// ─────────────────────────────────────────────────────────────
export const getAll = async (req, res, next) => {
  try {
    const marketMode = req.headers['x-market-mode'] || req.query.marketMode || 'B2C';
    const isB2B = marketMode.toUpperCase() === 'B2B';

    const filter = {};

    // Apply visibility and status filters based on adminView or roles
    const isAdminView = req.query.adminView === 'true';
    if (isAdminView) {
      if (req.query.status) {
        filter.status = req.query.status;
      }
    } else {
      if (isB2B) {
        filter.b2bVisible = true;
      } else {
        filter.b2cVisible = true;
      }
      filter.status = 'active';
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.featured) {
      filter.featured = req.query.featured === 'true';
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Price Range Filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.retailPrice = {};
      if (req.query.minPrice) {
        filter.retailPrice.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.retailPrice.$lte = Number(req.query.maxPrice);
      }
    }

    // B2B Wholesale Filters
    if (req.query.bulkAvailable === 'true') {
      filter.wholesalePricing = { $exists: true, $not: { $size: 0 } };
    }
    if (req.query.maxMOQ) {
      filter.minimumOrderQuantity = { $lte: Number(req.query.maxMOQ) };
    }

    // Pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const skip = (page - 1) * limit;

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort = { [parts[0]]: parts[1] === 'desc' ? -1 : 1 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    res.status(200).json({
      status: 'success',
      results: products.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: { products }
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET ONE PRODUCT
// GET /api/products/:id
// Public
// ─────────────────────────────────────────────────────────────
export const getOne = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    // Access control checks
    const marketMode = req.headers['x-market-mode'] || req.query.marketMode || 'B2C';
    const isB2B = marketMode.toUpperCase() === 'B2B';
    const isAdmin = req.user?.role === UserRoles.ADMIN;

    if (!isAdmin) {
      if (product.status !== 'active') {
        return next(new AppError('Product is not active.', 403));
      }
      if (isB2B && !product.b2bVisible) {
        return next(new AppError('Product is not available in B2B catalog.', 403));
      }
      if (!isB2B && !product.b2cVisible) {
        return next(new AppError('Product is not available in B2C catalog.', 403));
      }
    }

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE PRODUCT
// POST /api/products
// Private (Admin Only)
// ─────────────────────────────────────────────────────────────
export const create = async (req, res, next) => {
  try {
    const {
      name,
      category,
      description,
      retailPrice,
      discountPrice,
      stock,
      minimumOrderQuantity,
      unit,
      b2bVisible,
      b2cVisible,
      status,
      featured,
      specifications
    } = req.body;

    // Build specs if sent as stringified JSON
    let parsedSpecs = {};
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        return next(new AppError('Specifications must be a valid JSON object.', 400));
      }
    }

    // Map uploaded files to schema structure
    let images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const isCloudinary = file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'));
        images.push({
          url: isCloudinary ? file.path : `/uploads/${file.filename}`,
          publicId: file.filename || file.public_id,
          isPrimary: index === 0, // First image uploaded is set as primary
          altText: `${name} Image ${index + 1}`
        });
      });
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const product = await Product.create({
      name,
      category,
      description,
      retailPrice,
      discountPrice: discountPrice !== undefined && discountPrice !== '' ? Number(discountPrice) : 0,
      stock,
      minimumOrderQuantity: minimumOrderQuantity ? Number(minimumOrderQuantity) : 1,
      unit: unit || 'units',
      b2bVisible: b2bVisible === undefined ? true : b2bVisible === 'true' || b2bVisible === true,
      b2cVisible: b2cVisible === undefined ? true : b2cVisible === 'true' || b2cVisible === true,
      status: status || 'draft',
      featured: featured === 'true' || featured === true,
      specifications: parsedSpecs,
      images
    });

    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PRODUCT
// PATCH /api/products/:id
// Private (Admin Only)
// ─────────────────────────────────────────────────────────────
export const update = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    const {
      name,
      category,
      description,
      retailPrice,
      discountPrice,
      stock,
      minimumOrderQuantity,
      unit,
      b2bVisible,
      b2cVisible,
      status,
      featured,
      specifications
    } = req.body;

    // Handle updates
    if (name) {
      product.name = name;
      product.slug = slugify(name, { lower: true, strict: true });
    }
    if (category) product.category = category;
    if (description) product.description = description;
    if (retailPrice !== undefined) product.retailPrice = Number(retailPrice);
    if (discountPrice !== undefined) {
      product.discountPrice = (discountPrice === '' || discountPrice === null) ? 0 : Number(discountPrice);
    }
    if (stock !== undefined) product.stock = Number(stock);
    if (minimumOrderQuantity !== undefined) product.minimumOrderQuantity = Number(minimumOrderQuantity);
    if (unit) product.unit = unit;
    if (b2bVisible !== undefined) product.b2bVisible = b2bVisible === 'true' || b2bVisible === true;
    if (b2cVisible !== undefined) product.b2cVisible = b2cVisible === 'true' || b2cVisible === true;
    if (status) product.status = status;
    if (featured !== undefined) product.featured = featured === 'true' || featured === true;

    if (specifications) {
      try {
        const parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
        product.specifications = { ...product.specifications, ...parsedSpecs };
      } catch (e) {
        return next(new AppError('Specifications must be a valid JSON object.', 400));
      }
    }

    if (req.body.images !== undefined) {
      product.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    // Append new uploaded images if supplied
    if (req.files && req.files.length > 0) {
      const hasPrimary = product.images.some(img => img.isPrimary);
      req.files.forEach((file, index) => {
        const isCloudinary = file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'));
        product.images.push({
          url: isCloudinary ? file.path : `/uploads/${file.filename}`,
          publicId: file.filename || file.public_id,
          isPrimary: !hasPrimary && index === 0, // Make primary if none exists
          altText: `${product.name} Image`
        });
      });
    }

    await product.save();

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE PRODUCT
// DELETE /api/products/:id
// Private (Admin Only)
// ─────────────────────────────────────────────────────────────
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
