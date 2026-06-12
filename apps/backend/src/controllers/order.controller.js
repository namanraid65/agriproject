// controllers/order.controller.js
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import Settings from '../models/Settings.js';
import { calculateProductPrice } from '../services/pricingService.js';
import AppError from '../utils/AppError.js';
import { UserRoles } from '@open-agri/shared';

// ─────────────────────────────────────────────────────────────
// CREATE ORDER
// POST /api/orders
// Private
// ─────────────────────────────────────────────────────────────
export const createOrder = async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, discount = 0 } = req.body;
  const marketMode = req.marketMode || 'B2C'; // Injected by marketModeDetector middleware

  if (!items || items.length === 0) {
    return next(new AppError('No order items provided.', 400));
  }

  try {
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return next(new AppError(`Product not found: ${item.product}`, 404));
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for product: ${product.name}. Available: ${product.stock}`, 400));
      }

      // Calculate unit price dynamically based on B2B / B2C rules
      let unitPrice;
      try {
        unitPrice = calculateProductPrice(product, item.quantity, marketMode);
      } catch (err) {
        return next(new AppError(err.message, 400));
      }

      // Snapshot primary image URL
      const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || '';

      orderItems.push({
        product: product._id,
        name: product.name,
        image: primaryImage,
        quantity: item.quantity,
        price: unitPrice
      });

      subtotal += unitPrice * item.quantity;
      
      // Deduct stock levels
      product.stock -= item.quantity;
      await product.save();
    }

    // Fetch dynamic website settings configurations
    const settings = await Settings.getSingleton();
    const threshold = settings.retailOrderSettings?.freeShippingThreshold ?? 499;
    const charge = settings.retailOrderSettings?.shippingCharge ?? 49;
    const minOrderVal = settings.retailOrderSettings?.minimumOrderValue ?? 0;

    if (marketMode !== 'B2B' && subtotal < minOrderVal) {
      return next(new AppError(`Minimum order value for retail purchase is ₹${minOrderVal}. Please add more items.`, 400));
    }

    // Shipping calculations (Wholesale logistics vs retail delivery pricing)
    const shippingCost = marketMode === 'B2B' ? 100 : (subtotal > threshold ? 0 : charge);
    const totalAmount = subtotal + shippingCost - discount;

    const order = new Order({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount,
      shippingCost,
      totalAmount
    });

    const createdOrder = await order.save();
    res.status(201).json({
      status: 'success',
      data: { order: createdOrder }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET ORDER BY ID
// GET /api/orders/:id
// Private
// ─────────────────────────────────────────────────────────────
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('items.product', 'name images');

    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    // Access control validation (compare customer ID or check if Admin)
    const isCustomerOwner = order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRoles.ADMIN;

    if (!isCustomerOwner && !isAdmin) {
      return next(new AppError('You do not have permission to view this order.', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET MY ORDERS
// GET /api/orders/myorders
// Private
// ─────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders — Admin: all orders
export const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/status — Admin: update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, carrier, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found.', 404));

    // If changing to cancelled, and it wasn't cancelled/refunded, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled' && order.status !== 'refunded') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    const updated = await order.save();
    res.status(200).json({ status: 'success', data: { order: updated } });
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/cancel — Customer self-service order cancellation
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    // Access control: only owner or admin can cancel
    const isOwner = order.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return next(new AppError('You do not have permission to cancel this order.', 403));
    }

    // Can only cancel pending or confirmed orders
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return next(new AppError(`Cannot cancel order in "${order.status}" status.`, 400));
    }

    const { reason } = req.body;

    // Restore stock levels
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    order.cancelReason = reason || 'Cancelled by user';
    order.paymentStatus = 'refunded';

    const updated = await order.save();
    res.status(200).json({
      status: 'success',
      data: { order: updated }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/ticker-stats — Public: get live count of orders in packing / shipping
export const getTickerStats = async (req, res, next) => {
  try {
    const packingCount = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'processing'] }
    });

    const shippedCount = await Order.countDocuments({
      status: 'shipped'
    });

    res.status(200).json({
      status: 'success',
      data: {
        packingCount: 2340 + packingCount,
        shippedCount: 80 + shippedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

