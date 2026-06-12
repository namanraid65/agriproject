import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMarket } from '../hooks/useMarket.js';
import { useCart } from '../hooks/useCart.js';
import api from '../services/api.js';
import { ArrowLeft, Loader2, CheckCircle2, MapPin, CreditCard, ShoppingBag } from 'lucide-react';

export const Checkout = () => {
  const { user } = useMarket();
  const { items, cartSubtotal, shippingCost, cartTotal, clearCart, isEmpty } = useCart();
  const navigate = useNavigate();

  // Redirect to Auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/checkout');
    }
  }, [user, navigate]);

  // Form state
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Request state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Validation
  const validateForm = () => {
    if (!fullName.trim()) return 'Full name is required';
    if (!phone.trim()) return 'Phone number is required';
    if (!line1.trim()) return 'Address line 1 is required';
    if (!city.trim()) return 'City is required';
    if (!state.trim()) return 'State is required';
    if (!pincode.trim()) return 'Pincode is required';
    if (!/^\d{6}$/.test(pincode.trim())) return 'Pincode must be exactly 6 digits';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        items: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName,
          phone,
          line1,
          line2,
          city,
          state,
          pincode,
          country,
        },
        paymentMethod,
      };

      const response = await api.post('/orders', orderPayload);
      
      // Clear cart in context + local storage
      clearCart();
      setCreatedOrder(response.data?.data?.order);
    } catch (err) {
      console.error('Failed to create order:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render Success Screen
  if (createdOrder) {
    // Estimated delivery date (3 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const dateStr = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="min-h-[80vh] bg-stone-50 flex items-center justify-center py-16 px-6">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-stone-200/80 shadow-2xl p-8 md:p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 shadow-md">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-stone-850 tracking-tight">Order Placed Successfully!</h2>
            <p className="text-sm text-stone-500 font-medium">
              Thank you for shopping with OpenAgri. Your order has been registered and is being processed.
            </p>
          </div>

          {/* Order Details Summary Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-left divide-y divide-stone-200/60 space-y-3.5">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-stone-500">Order Number</span>
              <span className="text-stone-800 font-bold tracking-wide">{createdOrder.orderNumber}</span>
            </div>

            <div className="pt-3.5 flex justify-between items-center text-sm font-semibold">
              <span className="text-stone-500">Total Amount</span>
              <span className="text-emerald-700 font-black text-base">₹{createdOrder.totalAmount?.toLocaleString()}</span>
            </div>

            <div className="pt-3.5 text-sm font-semibold text-stone-500">
              <span>Delivery Address</span>
              <p className="text-stone-800 font-bold mt-1 leading-relaxed">
                {createdOrder.shippingAddress?.fullName}<br />
                {createdOrder.shippingAddress?.line1}, {createdOrder.shippingAddress?.line2 && `${createdOrder.shippingAddress.line2}, `}
                {createdOrder.shippingAddress?.city}, {createdOrder.shippingAddress?.state} - {createdOrder.shippingAddress?.pincode}
              </p>
            </div>

            <div className="pt-3.5 flex items-start gap-2 text-xs font-bold text-emerald-800">
              <span className="text-base leading-none">🚚</span>
              <div>
                Estimated Delivery By:
                <p className="text-stone-750 font-black text-sm mt-0.5">{dateStr}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/products"
              className="flex-1 py-3.5 border-2 border-stone-200 hover:border-stone-400 font-bold text-stone-600 rounded-2xl transition-colors text-center text-sm"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-100 hover:shadow-xl transition-all text-sm"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if cart empty (but not if loading or showing success screen)
  if (isEmpty && !submitting) {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex flex-col items-center justify-center py-20 px-6">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-stone-700">No items to check out</h2>
        <p className="text-sm text-stone-500 mt-2">Your shopping cart is empty.</p>
        <Link to="/products" className="btn btn-primary-green px-6 py-2.5 rounded-xl font-bold mt-6">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold p-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping & Payment Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information Card */}
              <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 space-y-5">
                <h3 className="font-black text-stone-850 text-lg flex items-center gap-2 pb-3 border-b border-stone-100">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Shipping Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="e.g. 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      maxLength={6}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="6-digit Indian Pincode"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      required
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="House number, building name, street"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="Landmark, suite, unit"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      disabled
                      value={country}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 bg-stone-50 text-stone-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 space-y-5">
                <h3 className="font-black text-stone-850 text-lg flex items-center gap-2 pb-3 border-b border-stone-100">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Payment Method
                </h3>

                <div className="space-y-3">
                  {/* Cash on Delivery (COD) */}
                  <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50/40' : 'border-stone-200 hover:bg-stone-50'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-stone-800 text-sm block">Cash on Delivery (COD)</span>
                      <span className="text-xs text-stone-500 mt-0.5 block">Pay in cash or UPI when your shipment arrives at your doorstep.</span>
                    </div>
                  </label>

                  {/* Online Payment (Razorpay/Cards) */}
                  <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-stone-200 opacity-60 cursor-not-allowed">
                    <input
                      type="radio"
                      disabled
                      name="paymentMethod"
                      className="mt-1"
                    />
                    <div>
                      <span className="font-bold text-stone-800 text-sm flex items-center gap-2">
                        Online Cards / Net Banking / UPI
                        <span className="bg-stone-200 text-stone-600 font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wide">Offline</span>
                      </span>
                      <span className="text-xs text-stone-500 mt-0.5 block">Pay securely via Credit Card, Debit Card, Net Banking or UPI apps. (Currently disabled)</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:shadow-xl hover:-translate-y-px transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Placing Order...
                  </>
                ) : (
                  <>Place Order (₹{cartTotal.toLocaleString()})</>
                )}
              </button>
            </form>
          </div>

          {/* Checkout Order Summary Column */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 space-y-6">
            <h3 className="font-black text-stone-850 text-lg pb-3 border-b border-stone-100">Review Your Order</h3>

            {/* List of items */}
            <div className="divide-y divide-stone-100 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {items.map((item) => {
                const product = item.product;
                const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || '';
                return (
                  <div key={product._id} className="py-4 flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 flex-shrink-0">
                      {primaryImg ? (
                        <img src={primaryImg} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl bg-emerald-50">🌾</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-800 text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-stone-400 font-semibold mt-0.5">Qty: {item.quantity} · ₹{product.retailPrice?.toLocaleString()} / unit</p>
                    </div>
                    <span className="font-bold text-stone-800 text-sm">
                      ₹{(product.retailPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Pricing breakdown */}
            <div className="pt-4 border-t border-stone-100 space-y-3.5">
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

              <div className="pt-4 border-t border-stone-100 flex justify-between items-baseline">
                <span className="font-black text-stone-800 text-base">Order Total</span>
                <span className="font-black text-emerald-800 text-xl tracking-tight">₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
