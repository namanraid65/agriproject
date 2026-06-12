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
    const { status, trackingNumber, carrier, paymentStatus, returnStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found.', 404));

    const wasCancelledOrRefunded = order.status === 'cancelled' || order.status === 'refunded' || order.returnStatus === 'refunded';

    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (carrier !== undefined) order.carrier = carrier;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;

    if (returnStatus !== undefined) {
      order.returnStatus = returnStatus;
      if (returnStatus === 'refunded') {
        order.status = 'refunded';
        order.paymentStatus = 'refunded';
      }
    }

    if (status !== undefined) {
      order.status = status;
      if (status === 'refunded') {
        order.paymentStatus = 'refunded';
        order.returnStatus = 'refunded';
      }
    }

    const isCancelledOrRefundedNow = order.status === 'cancelled' || order.status === 'refunded' || order.returnStatus === 'refunded';

    // If transitioning to cancelled/refunded from non-cancelled/non-refunded, restore stock
    if (isCancelledOrRefundedNow && !wasCancelledOrRefunded) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

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

// PATCH /api/orders/:id/return — Customer self-service order return
export const returnOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    // Access control: only owner or admin can return
    const isOwner = order.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return next(new AppError('You do not have permission to return this order.', 403));
    }

    // Can only return delivered orders
    if (order.status !== 'delivered') {
      return next(new AppError(`Cannot return order in "${order.status}" status. Only delivered orders can be returned.`, 400));
    }

    // Check if return is already initiated
    if (order.returnStatus && order.returnStatus !== 'none') {
      return next(new AppError('A return has already been requested or processed for this order.', 400));
    }

    const { reason } = req.body;

    order.returnStatus = 'return_requested';
    order.cancelReason = `Returned: ${reason || 'No reason provided'}`; // reuse cancelReason to store return reason

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

