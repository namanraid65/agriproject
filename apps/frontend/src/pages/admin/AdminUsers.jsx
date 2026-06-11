import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../../hooks/useMarket.js';
import api from '../../services/api.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import DataTable, { avatarName } from '../../components/admin/DataTable.jsx';
import FormModal from '../../components/admin/FormModal.jsx';
import { Loader2 } from 'lucide-react';

export const AdminUsers = () => {
  const { user } = useMarket();
  const navigate = useNavigate();

  // Route guard
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/admin/users');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FormModal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/admin/users?limit=100');
      const userList = response.data?.data?.users || [];
      setUsers(userList);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Could not fetch users list from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const handleAddClick = () => {
    setModalMode('create');
    setEditingUser({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'CUSTOMER',
      isActive: true,
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    });
    setModalOpen(true);
  };

  const handleEditClick = (u) => {
    setModalMode('edit');
    setEditingUser({
      ...u,
      password: '', // blank by default on edit
      line1: u.address?.line1 || '',
      line2: u.address?.line2 || '',
      city: u.address?.city || '',
      state: u.address?.state || '',
      pincode: u.address?.pincode || ''
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (u) => {
    if (u._id === user._id) {
      alert('You cannot deactivate your own account.');
      return;
    }
    
    try {
      await api.patch(`/auth/admin/users/${u._id}/toggle-status`);
      // Update local state directly to prevent full table reload flicker
      setUsers(prev => prev.map(item => item._id === u._id ? { ...item, isActive: !item.isActive } : item));
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteClick = async (u) => {
    if (u._id === user._id) {
      alert('You cannot delete your own account.');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete the account for "${u.name || 'this user'}"?`)) {
      try {
        await api.delete(`/auth/admin/users/${u._id}`);
        setUsers(prev => prev.filter(item => item._id !== u._id));
      } catch (err) {
        console.error('Failed to delete user:', err);
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        role: formData.role,
        isActive: formData.isActive,
        address: {
          line1: formData.line1 || '',
          line2: formData.line2 || '',
          city: formData.city || '',
          state: formData.state || '',
          pincode: formData.pincode || ''
        }
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (modalMode === 'create') {
        await api.post('/auth/admin/users', payload);
      } else {
        await api.patch(`/auth/admin/users/${editingUser._id}`, payload);
      }

      fetchUsers();
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save user:', err);
      alert(err.response?.data?.message || 'Failed to save user details.');
    } finally {
      setFormLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const columns = [
    { 
      key: 'name', 
      label: 'User Info', 
      render: (val, row) => avatarName(val, row)
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (val) => val || '—' },
    { 
      key: 'role', 
      label: 'Role', 
      render: (val) => {
        const roleColors = {
          CUSTOMER: 'bg-blue-50 text-blue-700 border-blue-100',
          FARMER: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          DISTRIBUTOR: 'bg-purple-50 text-purple-700 border-purple-100',
          WHOLESALER: 'bg-amber-50 text-amber-700 border-amber-100',
          ADMIN: 'bg-red-50 text-red-700 border-red-100',
        };
        const cls = roleColors[val] || 'bg-stone-50 text-stone-750';
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
            {val}
          </span>
        );
      }
    },
    { 
      key: 'isActive', 
      label: 'Status', 
      render: (val, row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          title="Click to toggle status"
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
            val 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
              : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${val ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {val ? 'Active' : 'Inactive'}
        </button>
      )
    },
  ];

  const tabs = [
    {
      label: 'Account Details',
      fields: [
        { key: 'name', label: 'Full Name', required: true, placeholder: 'e.g. Arjun Kumar' },
        { key: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'e.g. arjun@openagri.com' },
        { 
          key: 'password', 
          label: modalMode === 'create' ? 'Password' : 'New Password (Optional)', 
          type: 'password', 
          required: modalMode === 'create', 
          placeholder: modalMode === 'create' ? 'At least 8 characters' : 'Leave empty to keep current password',
          hint: modalMode === 'create' ? 'Temporary password for the user' : 'Only enter if you wish to reset their password'
        },
        { 
          key: 'phone', 
          label: 'Phone Number', 
          type: 'tel', 
          placeholder: '10-digit mobile number', 
          validate: (val) => {
            if (val && !/^[6-9]\d{9}$/.test(val)) return 'Please enter a valid 10-digit Indian mobile number';
            return null;
          }
        },
        { 
          key: 'role', 
          label: 'Role / Account Type', 
          type: 'select', 
          required: true,
          options: [
            { label: 'Customer (Retail B2C)', value: 'CUSTOMER' },
            { label: 'Farmer (B2B Supply)', value: 'FARMER' },
            { label: 'Distributor (B2B)', value: 'DISTRIBUTOR' },
            { label: 'Wholesaler (B2B)', value: 'WHOLESALER' },
            { label: 'Administrator', value: 'ADMIN' }
          ]
        },
        { key: 'isActive', label: 'Account Active', type: 'checkbox', placeholder: 'Allow this user to sign in and place orders' }
      ]
    },
    {
      label: 'Address (Optional)',
      fields: [
        { key: 'line1', label: 'Street Address Line 1', placeholder: 'House/Flat No., Building Name, Area' },
        { key: 'line2', label: 'Street Address Line 2', placeholder: 'Landmark, Street Name' },
        { key: 'city', label: 'City', halfWidth: true, placeholder: 'e.g. Pune' },
        { key: 'state', label: 'State', halfWidth: true, placeholder: 'e.g. Maharashtra' },
        { 
          key: 'pincode', 
          label: 'Pincode', 
          halfWidth: true, 
          placeholder: '6-digit code', 
          validate: (val) => {
            if (val && !/^\d{6}$/.test(val)) return 'Pincode must be exactly 6 digits';
            return null;
          }
        }
      ]
    }
  ];

  return (
    <AdminLayout 
      pageTitle="User & Admin Accounts" 
      user={{ name: user.name, role: 'Administrator', initials: user.name?.[0]?.toUpperCase() || 'A' }}
      onNewClick={handleAddClick}
    >
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 text-stone-400">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">Loading user accounts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            {error}
          </div>
        ) : (
          <DataTable
            title="All User & Administrator Profiles"
            columns={columns}
            data={users}
            perPage={10}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onAdd={handleAddClick}
            emptyText="No user accounts found."
          />
        )}

        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={modalMode === 'create' ? 'Create User Account' : 'Edit Account Details'}
          subtitle="Configure basic details, credentials, and optional delivery address"
          icon="ti-users"
          tabs={tabs}
          submitLabel={modalMode === 'create' ? 'Create Account' : 'Save Changes'}
          initialValues={editingUser || {}}
          loading={formLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
