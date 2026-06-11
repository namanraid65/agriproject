import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../../hooks/useMarket.js';
import api from '../../services/api.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import DataTable, { statusBadge } from '../../components/admin/DataTable.jsx';
import { Loader2, Calendar, User, Shield, Info, Truck, RefreshCw } from 'lucide-react';

export const AdminOrders = () => {
  const { user } = useMarket();
  const navigate = useNavigate();

  // Guard routing
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/admin/orders');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail view state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/orders/admin/all');
      setOrders(response.data?.data?.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Could not fetch orders list from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchOrders();
    }
  }, [user]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetail = () => {
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { status: newStatus });
      
      // Update selected order in state if open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { paymentStatus: newPaymentStatus });
      
      // Update selected order in state if open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, paymentStatus: newPaymentStatus }));
      }
      
      fetchOrders();
    } catch (err) {
      console.error('Failed to update payment status:', err);
      alert(err.response?.data?.message || 'Failed to update payment status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (val, row) => <span className="font-bold text-stone-850">{val || row._id.slice(-6).toUpperCase()}</span> },
    { key: 'customerName', label: 'Customer', render: (val, row) => row.customer?.name || 'Guest' },
    { key: 'totalAmount', label: 'Total Amount', render: (val) => `₹${val?.toLocaleString()}` },
    { key: 'status', label: 'Order Status', render: (val, row) => {
      const statusMap = {
        pending: "bg-red-50 text-red-650",
        confirmed: "bg-blue-50 text-blue-650",
        processing: "bg-amber-50 text-amber-700",
        shipped: "bg-indigo-50 text-indigo-700",
        delivered: "bg-[#f2f7ee] text-[#3b6d11]"
      };
      const cls = statusMap[val] ?? "bg-stone-150 text-stone-600";
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${cls}`}>
          {val?.toUpperCase()}
        </span>
      );
    }},
    { key: 'paymentStatus', label: 'Payment', render: (val) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${val === 'paid' ? 'bg-[#f2f7ee] text-[#3b6d11]' : 'bg-red-50 text-red-600'}`}>
        {val?.toUpperCase()}
      </span>
    )},
    { key: 'createdAt', label: 'Created At', render: (val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  ];

  return (
    <AdminLayout pageTitle="Customer Orders Management" user={{ name: user.name, role: 'Administrator', initials: user.name?.[0]?.toUpperCase() || 'A' }}>
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 text-stone-400">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">Loading orders database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        ) : (
          <DataTable
            title="All Customer Orders"
            columns={columns}
            data={orders}
            perPage={10}
            onView={handleViewOrder}
            emptyText="No orders found."
          />
        )}

        {/* Slideout/Modal Detail View */}
        {selectedOrder && (
          <>
            <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={handleCloseDetail} />
            <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white z-50 shadow-2xl border-l border-stone-250 flex flex-col h-full animate-in slide-in-from-right duration-200">
              
              {/* Header */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div>
                  <h3 className="font-bold text-stone-850 text-sm">Order: #{selectedOrder.orderNumber || selectedOrder._id.slice(-6).toUpperCase()}</h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button onClick={handleCloseDetail} className="text-stone-400 hover:text-stone-600 text-lg">✕</button>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
                
                {/* Status Update Selectors */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Workflow Status Dropdown */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                    <h4 className="text-[9px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1"><Truck className="h-3 w-3" /> Order Status</h4>
                    <div className="flex gap-2">
                      <select
                        value={selectedOrder.status}
                        disabled={updatingStatus}
                        onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-[11px] bg-white font-bold text-stone-705 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Status Dropdown */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                    <h4 className="text-[9px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1"><Shield className="h-3 w-3" /> Payment Status</h4>
                    <div className="flex gap-2">
                      <select
                        value={selectedOrder.paymentStatus}
                        disabled={updatingStatus}
                        onChange={(e) => handlePaymentStatusChange(selectedOrder._id, e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-[11px] bg-white font-bold text-stone-705 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5"><User className="h-3 w-3" /> Customer details</h4>
                  <div className="text-xs space-y-1 bg-white border border-stone-200 rounded-xl p-3">
                    <p className="font-bold text-stone-800">{selectedOrder.customer?.name || 'Guest User'}</p>
                    <p className="text-stone-550">Email: {selectedOrder.customer?.email || 'N/A'}</p>
                    <p className="text-stone-550">Phone: {selectedOrder.customer?.phone || selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1.5"><Info className="h-3 w-3" /> Shipping Address</h4>
                  <div className="text-xs space-y-1 bg-white border border-stone-200 rounded-xl p-3 text-stone-600">
                    <p className="font-bold text-stone-800">{selectedOrder.shippingAddress?.fullName}</p>
                    <p>{selectedOrder.shippingAddress?.line1}</p>
                    {selectedOrder.shippingAddress?.line2 && <p>{selectedOrder.shippingAddress?.line2}</p>}
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  </div>
                </div>

                {/* Order items */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400">Order Items</h4>
                  <div className="divide-y divide-stone-150 border border-stone-200 rounded-xl bg-white overflow-hidden">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="p-3 flex gap-3 text-xs items-center">
                        <div className="w-10 h-10 rounded border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">🌾</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-stone-800 truncate leading-snug">{item.name}</p>
                          <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                        </div>
                        <span className="font-bold text-stone-800">₹{(item.quantity * item.price)?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-500">
                    <span>Shipping Charges</span>
                    <span>₹{selectedOrder.shippingCost?.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-stone-200 pt-2 flex justify-between font-black text-stone-850 text-sm">
                    <span>Total Amount</span>
                    <span>₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-[10px] text-stone-400 space-y-1">
                  <p>Payment Method: <span className="font-bold uppercase">{selectedOrder.paymentMethod || 'COD'}</span></p>
                  <p>Payment Status: <span className="font-bold uppercase">{selectedOrder.paymentStatus || 'PENDING'}</span></p>
                </div>

              </div>

            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
