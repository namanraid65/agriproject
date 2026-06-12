import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../../hooks/useMarket.js';
import api from '../../services/api.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import DashboardStats from '../../components/admin/DashboardStats.jsx';
import { Loader2 } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useMarket();
  const navigate = useNavigate();

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/admin');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    pendingEnquiriesCount: 0,
    ordersCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes, enquiriesRes, ordersRes] = await Promise.all([
        api.get('/products?adminView=true&limit=1'),
        api.get('/categories?adminView=true'),
        api.get('/enquiries'),
        api.get('/orders/admin/all')
      ]);

      const productsCount = productsRes.data?.pagination?.total || productsRes.data?.data?.products?.length || 0;
      const categoriesCount = categoriesRes.data?.data?.categories?.length || 0;
      
      const enquiriesList = enquiriesRes.data?.data?.enquiries || [];
      const pendingEnquiriesCount = enquiriesList.filter(e => e.status === 'pending').length;

      const ordersList = ordersRes.data?.data?.orders || [];
      const ordersCount = ordersRes.data?.results || ordersList.length || 0;

      setStats({
        productsCount,
        categoriesCount,
        pendingEnquiriesCount,
        ordersCount
      });

      // Sort and slice to get 5 recent orders and 2 recent B2B enquiries
      const sortedOrders = [...ordersList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sortedOrders.slice(0, 5));

      const sortedEnquiries = [...enquiriesList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentEnquiries(sortedEnquiries.slice(0, 2));
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError('Failed to fetch dashboard stats from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardStats();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const statCards = [
    {
      label: "Total Products",
      value: stats.productsCount,
      icon: "ti-tag",
      color: "green",
      link: "/admin/products"
    },
    {
      label: "Total Categories",
      value: stats.categoriesCount,
      icon: "ti-category",
      color: "brown",
      link: "/admin/categories"
    },
    {
      label: "Pending Enquiries",
      value: stats.pendingEnquiriesCount,
      icon: "ti-message",
      color: "amber",
      link: "/admin/enquiries"
    },
    {
      label: "Total Orders",
      value: stats.ordersCount,
      icon: "ti-shopping-bag",
      color: "red",
      link: "/admin/orders"
    }
  ];

  return (
    <AdminLayout pageTitle="Admin Dashboard" user={{ name: user.name, role: 'Administrator', initials: user.name?.[0]?.toUpperCase() || 'A' }}>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h1 className="text-xl font-bold text-stone-850">Welcome to OpenAgri Admin Panel</h1>
          <p className="text-xs text-stone-500 mt-1">Manage B2B/B2C products, categories, orders, buyer enquiries, homepage content, and global configuration.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 text-stone-400">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">Loading stats database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        ) : (
          <>
            <DashboardStats stats={statCards} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders Section */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-sm text-left">
                <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                  <h2 className="text-sm font-bold text-stone-850 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Recent Orders
                  </h2>
                  <button
                    onClick={() => navigate('/admin/orders')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    View All Orders →
                  </button>
                </div>
                {recentOrders.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center">No orders placed yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-450 font-bold uppercase text-[10px]">
                          <th className="py-2.5">Order ID</th>
                          <th className="py-2.5">Customer</th>
                          <th className="py-2.5">Total Amount</th>
                          <th className="py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-55">
                        {recentOrders.map((order) => {
                          const hasReturn = order.returnStatus && order.returnStatus !== 'none';
                          return (
                            <tr key={order._id} className="hover:bg-stone-50/50 transition-colors">
                              <td className="py-3 font-bold text-stone-850">
                                #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                              </td>
                              <td className="py-3 text-stone-600 font-medium">
                                {order.customer?.name || 'Guest'}
                              </td>
                              <td className="py-3 font-extrabold text-stone-800">
                                ₹{order.totalAmount?.toLocaleString()}
                              </td>
                              <td className="py-3">
                                {hasReturn ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
                                    Return Active
                                  </span>
                                ) : (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                                    order.status === 'delivered' ? 'bg-[#f2f7ee] text-[#3b6d11]' :
                                    order.status === 'cancelled' ? 'bg-stone-100 text-stone-500' :
                                    order.status === 'refunded' ? 'bg-purple-50 text-purple-700' :
                                    'bg-amber-50 text-amber-700'
                                  }`}>
                                    {order.status}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Enquiries Section */}
              <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-sm text-left">
                <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                  <h2 className="text-sm font-bold text-stone-850 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    Recent B2B Enquiries
                  </h2>
                  <button
                    onClick={() => navigate('/admin/enquiries')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-850 transition-colors"
                  >
                    View All →
                  </button>
                </div>
                {recentEnquiries.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center">No enquiries received yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentEnquiries.map((enquiry) => (
                      <div key={enquiry._id} className="p-3 border border-stone-100 rounded-xl bg-stone-50/50 hover:bg-stone-50 transition-all duration-200 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-stone-800 text-xs truncate max-w-[140px] block">
                            {enquiry.name}
                          </span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                            enquiry.status === 'pending' ? 'bg-red-50 text-red-650 border-red-150' :
                            enquiry.status === 'reviewed' ? 'bg-blue-50 text-blue-650 border-blue-150' :
                            'bg-stone-100 text-stone-550 border-stone-200'
                          }`}>
                            {enquiry.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-450 font-bold flex items-center gap-1">
                          <span>Type:</span>
                          <span className="text-stone-600 font-extrabold uppercase">{enquiry.type}</span>
                        </p>
                        <p className="text-xs text-stone-650 font-semibold line-clamp-2 leading-relaxed">
                          {enquiry.subject || enquiry.message}
                        </p>
                        <p className="text-[9px] text-stone-400 font-bold italic pt-1">
                          {new Date(enquiry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
