import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../../hooks/useMarket.js';
import api from '../../services/api.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import FormModal from '../../components/admin/FormModal.jsx';
import { Loader2 } from 'lucide-react';

export const AdminTestimonials = () => {
  const { user } = useMarket();
  const navigate = useNavigate();

  // Guard routing
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/admin/testimonials');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [homepageDoc, setHomepageDoc] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FormModal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchHomepage = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cms/homepage');
      const doc = response.data?.data?.page || {};
      setHomepageDoc(doc);
      setTestimonials(doc.testimonials || []);
    } catch (err) {
      console.error('Failed to fetch homepage doc:', err);
      setError('Could not fetch testimonials from backend.');
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
    setEditingTestimonial({
      authorName: '',
      authorRole: '',
      rating: 5,
      content: '',
      displayOrder: 0,
      isVisible: true
    });
    setModalOpen(true);
  };

  const handleEditClick = (testimonial) => {
    setModalMode('edit');
    setEditingTestimonial(testimonial);
    setModalOpen(true);
  };

  const handleDeleteClick = async (testimonial) => {
    if (window.confirm(`Are you sure you want to delete testimonial by "${testimonial.authorName}"?`)) {
      const updatedTestimonials = testimonials.filter(t => t._id !== testimonial._id);
      try {
        await api.put('/cms/homepage', {
          ...homepageDoc,
          testimonials: updatedTestimonials
        });
        fetchHomepage();
      } catch (err) {
        console.error('Failed to delete testimonial:', err);
        alert('Failed to delete testimonial.');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      let updatedTestimonials = [...testimonials];
      const testimonialItem = {
        authorName: formData.authorName,
        authorRole: formData.authorRole,
        rating: Number(formData.rating || 5),
        content: formData.content,
        displayOrder: Number(formData.displayOrder || 0),
        isVisible: !!formData.isVisible
      };

      if (modalMode === 'create') {
        // Generate random ID
        testimonialItem._id = Math.random().toString(36).substring(2, 9);
        updatedTestimonials.push(testimonialItem);
      } else {
        updatedTestimonials = updatedTestimonials.map(t => t._id === editingTestimonial._id ? { ...testimonialItem, _id: t._id } : t);
      }

      await api.put('/cms/homepage', {
        ...homepageDoc,
        testimonials: updatedTestimonials
      });
      fetchHomepage();
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save testimonial:', err);
      alert(err.response?.data?.message || 'Failed to save testimonial.');
    } finally {
      setFormLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const columns = [
    { key: 'authorName', label: 'Author Name', render: (val) => <span className="font-bold text-stone-850">{val}</span> },
    { key: 'authorRole', label: 'Role / Designation' },
    { key: 'rating', label: 'Rating', render: (val) => `${val} ★` },
    { key: 'content', label: 'Testimonial Content', className: 'max-w-xs truncate' },
    { key: 'displayOrder', label: 'Order', render: (val) => val ?? 0 },
    { key: 'isVisible', label: 'Status', render: (val) => val ? '✅ Visible' : '❌ Hidden' }
  ];

  const tabs = [
    {
      label: 'Review Details',
      fields: [
        { key: 'authorName', label: 'Author Name', required: true, placeholder: 'e.g. Priyanjali Sen' },
        { key: 'authorRole', label: 'Author Designation / Company', placeholder: 'e.g. Home Chef, Pune' },
        { key: 'rating', label: 'Rating (1 to 5 Stars)', type: 'number', required: true, halfWidth: true, placeholder: '5' },
        { key: 'displayOrder', label: 'Display Order', type: 'number', required: true, halfWidth: true, placeholder: '0' },
        { key: 'content', label: 'Review / Comment Content', type: 'textarea', required: true, placeholder: 'Write the testimonial body content here...' },
        { key: 'isVisible', label: 'Visible to Public', type: 'checkbox', placeholder: 'Show testimonial on homepage client carousel' }
      ]
    }
  ];

  return (
    <AdminLayout pageTitle="Homepage Customer Reviews" user={{ name: user.name, role: 'Administrator', initials: user.name?.[0]?.toUpperCase() || 'A' }}>
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 text-stone-400">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">Loading testimonials...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        ) : (
          <DataTable
            title="All Customer Testimonials"
            columns={columns}
            data={testimonials}
            perPage={5}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onAdd={handleAddClick}
            emptyText="No testimonials found."
          />
        )}

        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={modalMode === 'create' ? 'Add Testimonial' : 'Edit Testimonial Details'}
          subtitle="Configure customer info, review content, rating, and display status"
          icon="ti-star"
          tabs={tabs}
          submitLabel={modalMode === 'create' ? 'Create' : 'Save Changes'}
          initialValues={editingTestimonial || {}}
          loading={formLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;
