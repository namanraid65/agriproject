import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../../hooks/useMarket.js';
import api from '../../services/api.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import DataTable, { statusBadge } from '../../components/admin/DataTable.jsx';
import FormModal from '../../components/admin/FormModal.jsx';
import { Loader2 } from 'lucide-react';

export const AdminProducts = () => {
  const { user } = useMarket();
  const navigate = useNavigate();

  // Guard routing
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/admin/products');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FormModal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products?adminView=true&limit=100');
      setProducts(response.data?.data?.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Could not fetch products from server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?adminView=true');
      setCategories(response.data?.data?.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  const handleAddClick = () => {
    setModalMode('create');
    setEditingProduct({
      name: '',
      category: '',
      description: '',
      retailPrice: 0,
      stock: 0,
      unit: 'units',
      minimumOrderQuantity: 1,
      b2bVisible: true,
      b2cVisible: true,
      status: 'draft',
      featured: false
    });
    setModalOpen(true);
  };

  const handleEditClick = (product) => {
    setModalMode('edit');
    setEditingProduct({
      ...product,
      category: product.category?._id || product.category || ''
    });
    setModalOpen(true);
  };

  const handleDeleteClick = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await api.delete(`/products/${product._id}`);
        fetchProducts();
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert(err.response?.data?.message || 'Failed to delete product.');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (modalMode === 'create') {
        await api.post('/products', formData);
      } else {
        await api.patch(`/products/${editingProduct._id}`, formData);
      }
      fetchProducts();
      setModalOpen(false);
    } catch (err) {
      console.error('Form submission failed:', err);
      alert(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setFormLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const columns = [
    { key: 'name', label: 'Product Name', render: (val, row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
          {row.images?.[0]?.url ? (
            <img src={row.images[0].url} alt={val} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm">🌾</span>
          )}
        </div>
        <span className="font-medium text-stone-800">{val}</span>
      </div>
    )},
    { key: 'categoryName', label: 'Category', render: (val, row) => row.category?.name || '—' },
    { key: 'retailPrice', label: 'Retail Price', render: (val) => `₹${val}` },
    { key: 'stock', label: 'Stock', render: (val, row) => `${val} ${row.unit || 'units'}` },
    { key: 'status', label: 'Status', render: (val) => statusBadge(val) },
    { key: 'b2bVisible', label: 'B2B', render: (val) => val ? '✅' : '❌' },
    { key: 'b2cVisible', label: 'B2C', render: (val) => val ? '✅' : '❌' }
  ];

  const categoryOptions = categories.map(c => ({ label: c.name, value: c._id }));

  const tabs = [
    {
      label: 'Basic Info',
      fields: [
        { key: 'name', label: 'Product Name', required: true, placeholder: 'e.g. F1 Hybrid Seeds' },
        { key: 'category', label: 'Category', type: 'select', required: true, options: categoryOptions, placeholder: 'Select category…' },
        { key: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the product usage, benefits...' },
        { key: 'unit', label: 'Unit of Measure', halfWidth: true, placeholder: 'e.g. packs, bags, kg', required: true },
        { key: 'status', label: 'Status', type: 'select', halfWidth: true, required: true, options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Draft', value: 'draft' },
          { label: 'Out of Stock', value: 'out_of_stock' }
        ], placeholder: 'Select status…' }
      ]
    },
    {
      label: 'Pricing & Visibility',
      fields: [
        { key: 'retailPrice', label: 'Retail Price (₹)', type: 'number', halfWidth: true, required: true, placeholder: '0.00' },
        { key: 'stock', label: 'Stock Level', type: 'number', halfWidth: true, required: true, placeholder: '0' },
        { key: 'minimumOrderQuantity', label: 'Minimum Order Quantity', type: 'number', halfWidth: true, required: true, placeholder: '1' },
        { key: 'featured', label: 'Featured Product', type: 'checkbox', halfWidth: true, placeholder: 'Show on homepage featured products' },
        { key: 'b2bVisible', label: 'Visible to B2B Customers', type: 'checkbox', placeholder: 'Allow B2B portal viewing' },
        { key: 'b2cVisible', label: 'Visible to B2C Retail Customers', type: 'checkbox', placeholder: 'Allow B2C shop viewing' }
      ]
    }
  ];

  const navItems = [
    { section: "Main" },
    { label: "Dashboard", icon: "ti-layout-dashboard", href: "/admin" },
    { label: "Products", icon: "ti-tag", href: "/admin/products" },
    { label: "Categories", icon: "ti-category", href: "/admin/categories" },
    { label: "Orders", icon: "ti-shopping-bag", href: "/admin/orders" },
    { label: "Enquiries", icon: "ti-message", href: "/admin/enquiries" },
    { label: "CMS Pages", icon: "ti-file-text", href: "/admin/cms" },
    { label: "Settings", icon: "ti-settings", href: "/admin/settings" }
  ];

  return (
    <AdminLayout navItems={navItems} pageTitle="Product Catalog Management" user={{ name: user.name, role: 'Administrator', initials: user.name?.[0]?.toUpperCase() || 'A' }}>
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 text-stone-400">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">Loading products catalog...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        ) : (
          <DataTable
            title="All Catalog Products"
            columns={columns}
            data={products}
            perPage={10}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onAdd={handleAddClick}
            emptyText="No products found in the catalog."
          />
        )}

        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={modalMode === 'create' ? 'Add New Product' : 'Edit Product Details'}
          subtitle={modalMode === 'create' ? 'Define a new catalog product' : 'Modify existing catalog product settings'}
          icon="ti-tag"
          tabs={tabs}
          submitLabel={modalMode === 'create' ? 'Create' : 'Save Changes'}
          initialValues={editingProduct || {}}
          loading={formLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
