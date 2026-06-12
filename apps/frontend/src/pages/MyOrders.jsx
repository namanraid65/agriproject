import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../hooks/useMarket.js';
import api from '../services/api.js';
import {
  Loader2, Calendar, MapPin, CreditCard,
  Package, Truck, CheckCircle2, ShoppingBag,
  ArrowRight, ShieldCheck, HelpCircle, Info
} from 'lucide-react';

export const MyOrders = () => {
  const { isB2B, styles } = useMarket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [cancelDetail, setCancelDetail] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const handleCancelClick = (orderId) => {
    setCancelOrderId(orderId);
    setCancelReason('Changed my mind');
    setCancelDetail('');
    setShowCancelModal(true);
  };

  const handleReturnClick = () => {
    setShowReturnModal(true);
  };

  const handleConfirmCancel = async () => {
    setSubmittingCancel(true);
    try {
      const finalReason = cancelReason === 'Other' ? cancelDetail.trim() || 'Other' : cancelReason;
      await api.patch(`/orders/${cancelOrderId}/cancel`, { reason: finalReason });
      setShowCancelModal(false);
      fetchMyOrders();
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err.response?.data?.message || 'Failed to cancel the order. Please try again.');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const fetchMyOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/orders/myorders');
      setOrders(response.data?.data?.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Could not retrieve your orders. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status.toLowerCase());
  };

  const getStatusTheme = (status) => {
    const themes = {
      pending: { bg: 'bg-red-50', text: 'text-red-750 border-red-200', dot: 'bg-red-500' },
      confirmed: { bg: 'bg-blue-50', text: 'text-blue-750 border-blue-200', dot: 'bg-blue-500' },
      processing: { bg: 'bg-amber-50', text: 'text-amber-800 border-amber-200', dot: 'bg-amber-500' },
      shipped: { bg: 'bg-indigo-50', text: 'text-indigo-750 border-indigo-200', dot: 'bg-indigo-500' },
      delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700 border-emerald-200', dot: 'bg-emerald-600' },
      cancelled: { bg: 'bg-stone-50', text: 'text-stone-500 border-stone-200', dot: 'bg-stone-400' },
      refunded: { bg: 'bg-purple-50', text: 'text-purple-750 border-purple-200', dot: 'bg-purple-500' }
    };
    return themes[status.toLowerCase()] || { bg: 'bg-stone-50', text: 'text-stone-600 border-stone-200', dot: 'bg-stone-500' };
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-stone-550">Fetching your order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
          <p className="text-red-750 font-bold text-sm">{error}</p>
          <button
            onClick={fetchMyOrders}
            className={`btn px-6 py-2.5 rounded-xl font-bold text-white shadow-md ${isB2B ? 'btn-primary-amber' : 'btn-primary-green'}`}
          >
            Retry Now
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-6 bg-stone-50">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100 shadow-md">
          <ShoppingBag className="h-9 w-9" />
        </div>
        <h2 className="text-2xl font-black text-stone-850 tracking-tight">No Orders Placed Yet</h2>
        <p className="text-sm text-stone-500 max-w-sm text-center mt-2 leading-relaxed">
          You haven't placed any orders on KisanMart yet. Browse our farm-fresh products and inputs to place your first order.
        </p>
        <Link
          to="/products"
          className={`btn mt-8 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex items-center gap-2 ${
            isB2B ? 'btn-primary-amber' : 'btn-primary-green'
          }`}
        >
          Explore Catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">My Order History</h1>
            <p className="text-xs text-stone-500 mt-1">
              Track delivery progress and view receipt summaries for your purchases
            </p>
          </div>
          <Link
            to="/products"
            className={`text-xs font-bold transition-colors ${
              isB2B ? 'text-amber-700 hover:text-amber-900' : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            Browse Products →
          </Link>
        </div>

        {/* Orders list */}
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStep = getStatusStep(order.status);
            const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
            const theme = getStatusTheme(order.status);
            
            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Order Top Bar Info */}
                <div className="bg-stone-50 border-b border-stone-150 px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Order Placed</span>
                    <span className="text-xs font-bold text-stone-700 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-stone-400" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Order ID</span>
                    <span className="text-xs font-extrabold text-stone-850 block mt-0.5">
                      #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Grand Total</span>
                    <span className="text-sm font-black text-emerald-700 block mt-0.5">
                      ₹{order.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-start sm:justify-end">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${theme.bg} ${theme.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Stepper Tracking Visual */}
                {!isCancelled && (
                  <div className="px-5 py-6 border-b border-stone-100 bg-stone-50/20">
                    <div className="relative">
                      {/* Connection bar */}
                      <div className="absolute top-[9px] left-8 right-8 h-1 bg-stone-200 rounded-full z-0">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isB2B ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${(Math.max(0, currentStep) / 4) * 100}%` }}
                        />
                      </div>

                      {/* Stepper Nodes */}
                      <div className="relative z-10 flex justify-between text-center">
                        {[
                          { label: 'Placed', icon: Package },
                          { label: 'Confirmed', icon: CheckCircle2 },
                          { label: 'Processing', icon: Loader2 },
                          { label: 'Shipped', icon: Truck },
                          { label: 'Delivered', icon: CheckCircle2 }
                        ].map((step, idx) => {
                          const StepIcon = step.icon;
                          const isCompleted = idx <= currentStep;
                          const isActive = idx === currentStep;

                          return (
                            <div key={idx} className="flex flex-col items-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  isCompleted
                                    ? isB2B
                                      ? 'bg-amber-600 border-amber-600 text-white shadow-md'
                                      : 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                    : 'bg-white border-stone-300 text-stone-400'
                                }`}
                              >
                                <StepIcon className={`h-3 w-3 ${isActive && idx === 2 ? 'animate-spin' : ''}`} />
                              </div>
                              <span
                                className={`text-[10px] font-bold mt-2 hidden sm:block ${
                                  isCompleted ? 'text-stone-800' : 'text-stone-400'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Content body split */}
                <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-stone-150">
                  
                  {/* Left part: Purchased items list */}
                  <div className="p-5 md:col-span-8 space-y-3.5">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-stone-400">Order Items</h3>
                    <div className="divide-y divide-stone-100">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex gap-3 text-xs items-center first:pt-0 last:pb-0">
                          <div className="w-12 h-12 rounded-xl border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">🌾</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-stone-850 truncate leading-snug">{item.name}</p>
                            <p className="text-[10px] text-stone-400 font-semibold mt-0.5">
                              Quantity: {item.quantity} × ₹{item.price?.toLocaleString()}
                            </p>
                          </div>
                          <span className="font-extrabold text-stone-800 text-right">
                            ₹{(item.quantity * item.price)?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right part: Delivery / Payment Info */}
                  <div className="p-5 md:col-span-4 space-y-5 bg-stone-50/15">
                    
                    {/* Shipping Tracking Number details */}
                    {order.status.toLowerCase() === 'shipped' && order.trackingNumber && (
                      <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-3 text-xs text-indigo-800 space-y-1">
                        <p className="font-bold flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Shipping Status</p>
                        <p className="text-[11px] mt-0.5 leading-relaxed">
                          Your package is on its way via <span className="font-extrabold">{order.carrier || 'Logistics Partner'}</span>.
                          <br />
                          Tracking ID: <span className="font-black select-all">{order.trackingNumber}</span>
                        </p>
                      </div>
                    )}

                    {/* Shipping Address details */}
                    <div className="space-y-1.5">
                      <h4 className="text-[9px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Shipping Address</h4>
                      <div className="text-[11px] leading-relaxed text-stone-600 bg-white border border-stone-200/80 rounded-2xl p-3">
                        <p className="font-extrabold text-stone-800">{order.shippingAddress?.fullName}</p>
                        <p>{order.shippingAddress?.line1}</p>
                        {order.shippingAddress?.line2 && <p>{order.shippingAddress?.line2}</p>}
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                        <p className="text-[10px] text-stone-400 mt-1">Phone: {order.shippingAddress?.phone}</p>
                      </div>
                    </div>

                    {/* Payment details */}
                    <div className="space-y-1.5">
                      <h4 className="text-[9px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Payment Method</h4>
                      <div className="text-[11px] leading-relaxed text-stone-600 bg-white border border-stone-200/80 rounded-2xl p-3 flex justify-between items-center">
                        <div>
                          <p className="font-extrabold text-stone-850 uppercase">{order.paymentMethod || 'COD'}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">Status: <span className="font-bold uppercase">{order.paymentStatus}</span></p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                            : 'bg-red-50 text-red-650 border-red-200'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Receipts details */}
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-1.5 text-[11px] text-stone-500">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal?.toLocaleString()}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-red-600 font-semibold">
                          <span>Discount Applied</span>
                          <span>-₹{order.discount?.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping charges</span>
                        <span>₹{order.shippingCost?.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-stone-200 pt-1.5 flex justify-between font-black text-stone-800 text-xs">
                        <span>Final Bill</span>
                        <span>₹{order.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Cancellation or Return Action Buttons */}
                    {!isCancelled ? (
                      <div>
                        {(order.status === 'pending' || order.status === 'confirmed') ? (
                          <button
                            onClick={() => handleCancelClick(order._id)}
                            className="w-full mt-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 font-bold border border-red-200 rounded-2xl text-xs transition-all tracking-wide text-center uppercase"
                          >
                            Cancel Order
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReturnClick()}
                            className="w-full mt-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold border border-stone-300 rounded-2xl text-xs transition-all tracking-wide text-center uppercase"
                          >
                            Request Return
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 mt-3 text-[11px] text-stone-500">
                        <span className="font-extrabold text-stone-700 block">Cancel Reason:</span>
                        <p className="mt-0.5 leading-relaxed">{order.cancelReason || 'No reason provided.'}</p>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <>
            <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 max-w-sm w-full space-y-4">
                <h3 className="font-black text-stone-850 text-base">Cancel Order</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Are you sure you want to cancel this order? This action will release the reserved item stocks back to inventory.
                </p>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Reason for Cancellation</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white font-semibold focus:outline-none"
                  >
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                    <option value="Incorrect items selected">Incorrect items selected</option>
                    <option value="Delivery takes too long">Delivery takes too long</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {cancelReason === 'Other' && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Please specify</label>
                    <textarea
                      value={cancelDetail}
                      onChange={(e) => setCancelDetail(e.target.value)}
                      placeholder="Specify your reason..."
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs resize-none focus:outline-none h-16"
                    />
                  </div>
                )}
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 py-2.5 border border-stone-200 text-stone-500 font-bold rounded-xl text-xs hover:bg-stone-50 transition-colors"
                  >
                    No, Keep Order
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    disabled={submittingCancel}
                    className="flex-1 py-2.5 bg-red-650 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {submittingCancel ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Yes, Cancel Order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Return Details Modal */}
        {showReturnModal && (
          <>
            <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setShowReturnModal(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 max-w-sm w-full space-y-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-md">
                  <Info className="h-5 w-5" />
                </div>
                <h3 className="font-black text-stone-850 text-base">How to Return Items</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  For items that have already been processed, shipped, or delivered, returns are managed manually by our support team.
                </p>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1 text-xs text-stone-750">
                  <p className="font-bold text-stone-800">KisanMart Returns & Support</p>
                  <p>📧 Email: <span className="font-semibold">returns@kisanmart.com</span></p>
                  <p>📞 Toll-Free Support: <span className="font-semibold">1800-419-5050</span></p>
                  <p className="text-[10px] text-stone-400 mt-1.5 leading-normal">Please mention your order ID when contacting customer support.</p>
                </div>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default MyOrders;
