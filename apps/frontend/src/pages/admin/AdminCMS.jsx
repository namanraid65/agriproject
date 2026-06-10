import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../../hooks/useMarket.js';
import api from '../../services/api.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import FormModal from '../../components/admin/FormModal.jsx';
import { Loader2 } from 'lucide-react';

export const AdminCMS = () => {
  const { user } = useMarket();
  const navigate = useNavigate();

  // Guard routing
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/admin/cms');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [cmsPages, setCmsPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCMSPages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cms');
      setCmsPages(response.data?.data?.pages || []);
    } catch (err) {
      console.error('Failed to fetch CMS pages:', err);
      setError('Could not fetch CMS pages list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCMSPages();
    }
  }, [user]);

  const handleEditClick = async (page) => {
    setFormLoading(true);
    try {
      // Fetch full details of the specific page
      const detailsRes = await api.get(`/cms/${page.pageType}`);
      const fullPage = detailsRes.data?.data?.page || page;
      setSelectedPage({
        pageType: fullPage.pageType,
        title: fullPage.title || '',
        content: fullPage.content || '',
        metaTitle: fullPage.metaTitle || '',
        metaDescription: fullPage.metaDescription || '',
        isPublished: !!fullPage.isPublished
      });
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to load page details:', err);
      alert('Failed to load page contents.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      await api.put(`/cms/${selectedPage.pageType}`, formData);
      fetchCMSPages();
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to update CMS page:', err);
      alert(err.response?.data?.message || 'Failed to update CMS page.');
    } finally {
      setFormLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const columns = [
    { key: 'title', label: 'Page Title', render: (val, row) => <span className="font-bold text-stone-850">{val || row.pageType.toUpperCase()}</span> },
    { key: 'pageType', label: 'Page Type', render: (val) => <span className="font-mono text-xs text-stone-500">{val}</span> },
    { key: 'isPublished', label: 'Published', render: (val) => val ? '✅ Yes' : '❌ No' },
    { key: 'updatedAt', label: 'Last Edited', render: (val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  ];

  const tabs = [
    {
      label: 'Page Contents',
      fields: [
        { key: 'title', label: 'Page Title', required: true, placeholder: 'Page Heading' },
        { key: 'content', label: 'Page Core Content', type: 'textarea', placeholder: 'Enter main page body content here (for About page, policy, etc.)...' },
        { key: 'isPublished', label: 'Publish Immediately', type: 'checkbox', placeholder: 'Make page publicly visible on the frontend' }
      ]
    },
    {
      label: 'SEO Metadata',
      fields: [
        { key: 'metaTitle', label: 'SEO Meta Title', placeholder: 'e.g. About Us | OpenAgri' },
        { key: 'metaDescription', label: 'SEO Meta Description', type: 'textarea', placeholder: 'Brief summary of the page for search engines...' }
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
    <AdminLayout navItems={navItems} pageTitle="CMS Contents Management" user={{ name: user.name, role: 'Administrator', initials: user.name?.[0]?.toUpperCase() || 'A' }}>
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 text-stone-400">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">Loading CMS database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        ) : (
          <DataTable
            title="Managed CMS Pages"
            columns={columns}
            data={cmsPages}
            perPage={5}
            onEdit={handleEditClick}
            emptyText="No CMS pages found."
          />
        )}

        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={`Edit Page: ${selectedPage?.pageType?.toUpperCase()}`}
          subtitle="Customize the body and SEO metadata settings below"
          icon="ti-file-text"
          tabs={tabs}
          submitLabel="Save Changes"
          initialValues={selectedPage || {}}
          loading={formLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminCMS;
