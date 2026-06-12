import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../../hooks/useMarket.js';
import api from '../../services/api.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import DataTable, { statusBadge } from '../../components/admin/DataTable.jsx';
import FormModal from '../../components/admin/FormModal.jsx';
import { Loader2 } from 'lucide-react';

export const AdminCategories = () => {
  const { user } = useMarket();
  const navigate = useNavigate();

  // Guard routing
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/admin/categories');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FormModal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingCategory, setEditingCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories?adminView=true');
      setCategories(response.data?.data?.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Could not fetch categories from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCategories();
    }
  }, [user]);

  const handleAddClick = () => {
    setModalMode('create');
    setEditingCategory({
      name: '',
      description: '',
      displayOrder: 1,
      status: 'active',
      imageUrl: ''
    });
    setModalOpen(true);
  };

  const handleEditClick = (category) => {
    setModalMode('edit');
    setEditingCategory({
      ...category,
      imageUrl: category.image?.url || ''
    });
    setModalOpen(true);
  };

  const handleDeleteClick = async (category) => {
    if (window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      try {
        await api.delete(`/categories/${category._id}`);
        fetchCategories();
      } catch (err) {
        console.error('Failed to delete category:', err);
        alert(err.response?.data?.message || 'Failed to delete category.');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = { ...formData };
      if (payload.imageUrl) {
        payload.image = { url: payload.imageUrl };
      } else {
        payload.image = { url: '' };
      }
      delete payload.imageUrl;

      if (modalMode === 'create') {
        await api.post('/categories', payload);
      } else {
        await api.patch(`/categories/${editingCategory._id}`, payload);
      }
      fetchCategories();
      setModalOpen(false);
    } catch (err) {
      console.error('Form submission failed:', err);
      alert(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setFormLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const columns = [
    { key: 'name', label: 'Category Name', render: (val, row) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded border border-stone-200 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
          {row.image?.url ? (
            <img src={row.image.url} alt={val} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm">📁</span>
          )}
        </div>
        <span className="font-medium text-stone-850">{val}</span>
      </div>
    )},
    { key: 'slug', label: 'Slug' },
    { key: 'displayOrder', label: 'Display Order', render: (val) => val ?? 1 },
    { key: 'status', label: 'Status', render: (val) => statusBadge(val) }
  ];

  const tabs = [
    {
      label: 'Category Details',
      fields: [
        { key: 'name', label: 'Category Name', required: true, placeholder: 'e.g. Irrigation Tools' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the category...' },
        { key: 'imageUrl', label: 'Category Image URL', placeholder: 'e.g. /uploads/category_seeds.png' },
        { key: 'displayOrder', label: 'Display Order', type: 'number', required: true, placeholder: '1', halfWidth: true },
        { key: 'status', label: 'Status', type: 'select', required: true, halfWidth: true, options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' }
        ], placeholder: 'Select status…' }
      ]
    }
  ];

  return (
    <AdminLayout pageTitle="Product Categories Management" user={{ name: user.name, role: 'Administrator', initials: user.name?.[0]?.toUpperCase() || 'A' }}>
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 text-stone-400">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">Loading categories database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        ) : (
          <DataTable
            title="All Product Categories"
            columns={columns}
            data={categories}
            perPage={10}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onAdd={handleAddClick}
            emptyText="No categories found."
          />
        )}

        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={modalMode === 'create' ? 'Add New Category' : 'Edit Category Details'}
          subtitle={modalMode === 'create' ? 'Define a new product classification' : 'Modify existing category settings'}
          icon="ti-category"
          tabs={tabs}
          submitLabel={modalMode === 'create' ? 'Create' : 'Save Changes'}
          initialValues={editingCategory || {}}
          loading={formLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
