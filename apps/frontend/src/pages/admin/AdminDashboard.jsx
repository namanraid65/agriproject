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

      const ordersCount = ordersRes.data?.results || ordersRes.data?.data?.orders?.length || 0;

      setStats({
        productsCount,
        categoriesCount,
        pendingEnquiriesCount,
        ordersCount
      });
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
          <DashboardStats stats={statCards} />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
