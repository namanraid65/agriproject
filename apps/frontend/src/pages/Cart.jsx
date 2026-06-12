import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import QuantityInput from '../components/QuantityInput.jsx';

export const Cart = () => {
  const {
    items,
    updateQty,
    removeFromCart,
    clearCart,
    cartSubtotal,
    shippingCost,
    cartTotal,
    isEmpty,
  } = useCart();
  const navigate = useNavigate();

  const FREE_SHIPPING_THRESHOLD = 499;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - cartSubtotal;

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  if (isEmpty) {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex flex-col items-center justify-center py-20 px-6">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100 shadow-md">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-black text-stone-800 tracking-tight">Your Cart is Empty</h2>
        <p className="text-sm text-stone-500 max-w-sm text-center mt-2.5 leading-relaxed">
          Looks like you haven't added any fresh farm inputs to your cart yet. Browse our premium seeds, fertilizers, organic products, and tools.
        </p>
        <Link
          to="/products"
          className="btn btn-primary-green px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:shadow-xl transition-all duration-200 mt-8 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md overflow-hidden p-6">
              <div className="flex justify-between items-center pb-5 border-b border-stone-100">
                <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">Product Details</span>
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {items.map((item) => {
                  const product = item.product;
                  const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || '';
                  const catName = typeof product.category === 'object' ? product.category?.name : product.category;

                  return (
                    <div key={product._id} className="py-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      {/* Product Thumbnail & Details */}
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-stone-200/80 bg-stone-50 flex-shrink-0">
                          {primaryImg ? (
                            <img
                              src={primaryImg}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://placehold.co/400x300/e7f3e0/2d6a4f?text=${encodeURIComponent(product.name.slice(0, 10))}`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl bg-emerald-50">🌾</div>
                          )}
                        </div>

                        <div>
                          {catName && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-0.5 block">
                              {catName}
                            </span>
                          )}
                          <Link to={`/products/${product._id}`} className="font-bold text-stone-850 hover:text-emerald-700 transition-colors text-base leading-snug">
                            {product.name}
                          </Link>
                          {product.discountPrice && product.discountPrice > 0 ? (
                            <span className="flex items-center gap-1.5 flex-wrap mt-1">
                              <span className="text-xs text-stone-800 font-bold">₹{product.discountPrice.toLocaleString()}</span>
                              <span className="text-[10px] text-stone-400 line-through font-semibold">₹{product.retailPrice?.toLocaleString()}</span>
                              <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-105 px-1.5 py-0.5 rounded">
                                {Math.round(((product.retailPrice - product.discountPrice) / product.retailPrice) * 100)}% OFF
                              </span>
                            </span>
                          ) : (
                            <p className="text-xs text-stone-400 font-semibold mt-1">₹{product.retailPrice?.toLocaleString()} / unit</p>
                          )}
                        </div>
                      </div>

                      {/* Stepper & Pricing */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10">
                        {/* Stepper */}
                        <div className="flex items-center border-2 border-stone-200 rounded-xl overflow-hidden bg-white">
                          <button
                            onClick={() => updateQty(product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2.5 py-1.5 text-stone-500 hover:bg-stone-50 disabled:opacity-40 border-r border-stone-200 transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <QuantityInput
                            value={item.quantity}
                            max={product.stock || 999}
                            onChange={(val) => {
                              updateQty(product._id, val);
                            }}
                            className="w-12 text-center font-bold text-stone-800 text-sm bg-transparent outline-none"
                          />
                          <button
                            onClick={() => updateQty(product._id, item.quantity + 1)}
                            disabled={item.quantity >= (product.stock || 999)}
                            className="px-2.5 py-1.5 text-stone-500 hover:bg-stone-50 disabled:opacity-40 border-l border-stone-200 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Total Price & Delete Button */}
                        <div className="flex items-center gap-4 min-w-[100px] justify-end">
                          <span className="font-black text-stone-800 text-base">
                            ₹{((product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.retailPrice) * item.quantity).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeFromCart(product._id)}
                            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-950 transition-colors px-2 py-1"
            >
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-4">
            {/* Free Shipping Progress Indicator */}
            {remainingForFreeShipping > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm">
                <p className="text-xs font-bold text-amber-800 leading-snug">
                  Add <span className="font-black">₹{remainingForFreeShipping.toLocaleString()}</span> more to get <span className="font-black">FREE delivery</span>!
                </p>
                <div className="w-full bg-stone-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  🎉 Congratulations! Your order qualifies for <span className="font-black">FREE delivery</span>.
                </p>
              </div>
            )}

            {/* Summary details */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 space-y-5">
              <h3 className="font-black text-stone-800 text-lg tracking-tight pb-3 border-b border-stone-100">Order Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-stone-500 font-semibold">
                  <span>Subtotal</span>
                  <span className="text-stone-700 font-bold">₹{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500 font-semibold">
                  <span>Delivery Charges</span>
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600 font-black uppercase text-xs tracking-wider">Free</span>
                  ) : (
                    <span className="text-stone-700 font-bold">₹{shippingCost.toLocaleString()}</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-between items-baseline">
                <span className="font-black text-stone-800 text-base">Order Total</span>
                <span className="font-black text-emerald-800 text-2xl tracking-tight">₹{cartTotal.toLocaleString()}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:shadow-xl hover:-translate-y-px transition-all duration-200 active:scale-95 mt-4"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
