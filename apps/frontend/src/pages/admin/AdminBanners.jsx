import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../../hooks/useMarket.js';
import api from '../../services/api.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import FormModal from '../../components/admin/FormModal.jsx';
import { Loader2 } from 'lucide-react';

export const AdminBanners = () => {
  const { user } = useMarket();
  const navigate = useNavigate();

  // Guard routing
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/admin/banners');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [homepageDoc, setHomepageDoc] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FormModal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingBanner, setEditingBanner] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchHomepage = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cms/homepage');
      const doc = response.data?.data?.page || {};
      setHomepageDoc(doc);
      setBanners(doc.banners || []);
    } catch (err) {
      console.error('Failed to fetch homepage doc:', err);
      setError('Could not fetch banners from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchHomepage();
    }
  }, [user]);

  const handleAddClick = () => {
    setModalMode('create');
    setEditingBanner({
      title: '',
      subtitle: '',
      imageUrl: '',
      link: '',
      order: 0,
      isActive: true
    });
    setModalOpen(true);
  };

  const handleEditClick = (banner) => {
    setModalMode('edit');
    setEditingBanner({
      ...banner,
      imageUrl: banner.image?.url || banner.imageUrl || ''
    });
    setModalOpen(true);
  };

  const handleDeleteClick = async (banner) => {
    if (window.confirm(`Are you sure you want to delete banner "${banner.title || 'Untitled'}"?`)) {
      const updatedBanners = banners.filter(b => b._id !== banner._id);
      try {
        await api.put('/cms/homepage', {
          ...homepageDoc,
          banners: updatedBanners
        });
        fetchHomepage();
      } catch (err) {
        console.error('Failed to delete banner:', err);
        alert('Failed to delete banner.');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      let updatedBanners = [...banners];
      const bannerItem = {
        title: formData.title,
        subtitle: formData.subtitle,
        image: {
          url: formData.imageUrl,
          altText: formData.title
        },
        link: formData.link,
        order: Number(formData.order || 0),
        isActive: !!formData.isActive
      };

      if (modalMode === 'create') {
        // Generate a random temporary _id
        bannerItem._id = Math.random().toString(36).substring(2, 9);
        updatedBanners.push(bannerItem);
      } else {
        updatedBanners = updatedBanners.map(b => b._id === editingBanner._id ? { ...bannerItem, _id: b._id } : b);
      }

      await api.put('/cms/homepage', {
        ...homepageDoc,
        banners: updatedBanners
      });
      fetchHomepage();
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save banner:', err);
      alert(err.response?.data?.message || 'Failed to save banner.');
    } finally {
      setFormLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const columns = [
    { key: 'image', label: 'Preview', render: (val, row) => (
      <div className="w-16 h-10 border border-stone-200 rounded overflow-hidden bg-stone-100 flex items-center justify-center">
        {row.image?.url ? (
          <img src={row.image.url} alt={row.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs">🖼️</span>
        )}
      </div>
    )},
    { key: 'title', label: 'Banner Title', render: (val) => <span className="font-bold text-stone-850">{val || 'Untitled'}</span> },
    { key: 'subtitle', label: 'Subtitle', className: 'max-w-[200px] truncate' },
    { key: 'link', label: 'Link URL', render: (val) => <span className="font-mono text-[11px] text-stone-500">{val || '—'}</span> },
    { key: 'order', label: 'Order', render: (val) => val ?? 0 },
    { key: 'isActive', label: 'Status', render: (val) => val ? '✅ Active' : '❌ Inactive' }
  ];

  const tabs = [
    {
      label: 'Banner Setup',
      fields: [
        { key: 'title', label: 'Banner Heading Title', required: true, placeholder: 'e.g. Monsoon Seed Sale' },
        { key: 'subtitle', label: 'Subtitle / Offer Details', placeholder: 'e.g. Get 20% off all hybrid seeds' },
        { key: 'imageUrl', label: 'Banner Image URL', required: true, placeholder: 'https://images.unsplash.com/...' },
        { key: 'link', label: 'CTA Target Link URL', placeholder: 'e.g. /products?category=seeds' },
        { key: 'order', label: 'Display Order', type: 'number', required: true, halfWidth: true, placeholder: '0' },
        { key: 'isActive', label: 'Active immediately', type: 'checkbox', halfWidth: true, placeholder: 'Show banner in homepage slideshow' }
      ]
    }
  ];

  return (
    <AdminLayout pageTitle="Homepage Promotional Banners" user={{ name: user.name, role: 'Administrator', initials: user.name?.[0]?.toUpperCase() || 'A' }}>
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 text-stone-400">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">Loading promo banners...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        ) : (
          <DataTable
            title="Active Promo Slide Banners"
            columns={columns}
            data={banners}
            perPage={5}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onAdd={handleAddClick}
            emptyText="No promo banners created yet."
          />
        )}

        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={modalMode === 'create' ? 'Create Promo Banner' : 'Edit Banner Details'}
          subtitle="Configure heading, subtitle, image, and redirection link"
          icon="ti-image"
          tabs={tabs}
          submitLabel={modalMode === 'create' ? 'Create' : 'Save Changes'}
          initialValues={editingBanner || {}}
          loading={formLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
