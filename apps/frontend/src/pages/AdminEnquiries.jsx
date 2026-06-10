import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../hooks/useMarket.js';
import api from '../services/api.js';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import { Loader2, Mail, Phone, Calendar, RefreshCw, Eye, CheckCircle, XCircle } from 'lucide-react';

export const AdminEnquiries = () => {
  const { user } = useMarket();
  const navigate = useNavigate();

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/admin/enquiries');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Sourcing states
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState(''); // 'pending', 'reviewed', 'closed'
  const [typeFilter, setTypeFilter] = useState(''); // 'product', 'bulk', 'general'

  // Modal active enquiry state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const response = await api.get('/enquiries', { params });
      setEnquiries(response.data?.data?.enquiries || []);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
      setError('Failed to fetch enquiries from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchEnquiries();
    }
  }, [statusFilter, typeFilter, user]);

  const handleOpenModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setModalStatus(enquiry.status);
    setAdminNotes(enquiry.adminNotes || '');
  };

  const handleCloseModal = () => {
    setSelectedEnquiry(null);
    setModalStatus('');
    setAdminNotes('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    setModalSubmitting(true);
    try {
      await api.patch(`/enquiries/${selectedEnquiry._id}`, {
        status: modalStatus,
        adminNotes: adminNotes.trim(),
      });
      
      // Refresh listing
      fetchEnquiries();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to update enquiry:', err);
      alert(err.response?.data?.message || 'Failed to update enquiry status.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const getTypeBadge = (type) => {
    const map = {
      product: 'bg-blue-100 text-blue-800 border-blue-200',
      bulk: 'bg-amber-100 text-amber-800 border-amber-200',
      general: 'bg-stone-100 text-stone-800 border-stone-200',
    };
    return map[type] || 'bg-stone-100 text-stone-800';
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-red-100 text-red-800 border-red-200',
      reviewed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      closed: 'bg-stone-100 text-stone-800 border-stone-200',
    };
    return map[status] || 'bg-stone-100 text-stone-850';
  };

  if (!user || user.role !== 'admin') {
    return null; // Let the redirect trigger
  }

  // Sidebar navigation mapping to align with AdminLayout specifications
  const navItems = [
    { section: "Main" },
    { label: "Dashboard", icon: "ti-layout-dashboard", href: "/admin/dashboard" },
    { label: "Enquiries", icon: "ti-message", href: "/admin/enquiries" },
    { label: "Catalog Products", icon: "ti-tag", href: "/products" },
  ];

  return (
    <AdminLayout navItems={navItems} pageTitle="B2B Enquiries Management" user={{ name: user.name, role: 'Administrator', initials: user.name?.[0]?.toUpperCase() || 'A' }}>
      
      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Status Filter Tab Pills */}
        <div className="flex bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs">
          {[
            { value: '', label: 'All Enquiries' },
            { value: 'pending', label: 'Pending' },
            { value: 'reviewed', label: 'Reviewed' },
            { value: 'closed', label: 'Closed' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 font-bold rounded-lg transition-all ${
                statusFilter === opt.value ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-750'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Type Select and Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Types (Product / Bulk / General)</option>
            <option value="product">Product Inquiries</option>
            <option value="bulk">Wholesale Bulk RFQs</option>
            <option value="general">General Partnerships</option>
          </select>

          <button
            onClick={fetchEnquiries}
            className="p-2 border border-stone-200 hover:bg-stone-50 rounded-xl transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4 text-stone-500" />
          </button>
        </div>

      </div>

      {/* Main List / Table card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-3 text-stone-400">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">Loading sourcing database...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-stone-500">
            <p className="font-bold text-stone-700">{error}</p>
            <button onClick={fetchEnquiries} className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md">
              Retry Load
            </button>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="text-center py-24 text-stone-400 space-y-4">
            <div className="text-5xl">📩</div>
            <p className="font-bold text-stone-600 text-base">No B2B enquiries match filters</p>
            <p className="text-xs max-w-xs mx-auto">Sourcing requests sent by wholesale buyers or farming partnerships will display here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-stone-650 text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-150 font-bold uppercase tracking-wider text-stone-500">
                  <th className="px-5 py-4 font-extrabold">Received Date</th>
                  <th className="px-5 py-4 font-extrabold">Contact Info</th>
                  <th className="px-5 py-4 font-extrabold">Company Name</th>
                  <th className="px-5 py-4 font-extrabold">Type</th>
                  <th className="px-5 py-4 font-extrabold">RFQ Context</th>
                  <th className="px-5 py-4 font-extrabold">Status</th>
                  <th className="px-5 py-4 font-extrabold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {enquiries.map((e) => {
                  const dateStr = new Date(e.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={e._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-4 text-stone-500 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-stone-400" />
                          {dateStr}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-stone-800">{e.contactPerson}</p>
                        <div className="flex items-center gap-3 text-stone-400 mt-1 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {e.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {e.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-stone-700 font-semibold max-w-[150px] truncate">
                        {e.companyName || <span className="text-stone-300 italic">N/A</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getTypeBadge(e.type)}`}>
                          {e.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-stone-700">
                        {e.product ? (
                          <div>
                            <span className="font-semibold block truncate max-w-[150px]">{e.product.name}</span>
                            {e.quantity && <span className="text-[10px] text-stone-400 font-bold block">MOQ Request: {e.quantity} units</span>}
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">General Sourcing</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${getStatusBadge(e.status)}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenModal(e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-250 hover:bg-stone-100 hover:text-stone-850 rounded-xl transition-all font-bold text-[11px]"
                        >
                          <Eye className="h-3.5 w-3.5 text-stone-500" />
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Enquiry Modal */}
      {selectedEnquiry && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white z-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getTypeBadge(selectedEnquiry.type)}`}>
                  {selectedEnquiry.type} Sourcing Request
                </span>
                <h3 className="font-black text-stone-850 text-md mt-1 leading-snug">Review B2B Sourcing Enquiry</h3>
              </div>
              <button onClick={handleCloseModal} className="text-stone-400 hover:text-stone-600 text-lg">✕</button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 divide-y divide-stone-150/60 scrollbar-thin">
              
              {/* Sourcing Parameters */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400">Sourcing Parameters</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-stone-450 block font-semibold">Contact Person</span>
                    <span className="text-stone-800 font-bold">{selectedEnquiry.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-stone-450 block font-semibold">Company / Farm Name</span>
                    <span className="text-stone-800 font-bold">{selectedEnquiry.companyName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-stone-450 block font-semibold">Email Address</span>
                    <a href={`mailto:${selectedEnquiry.email}`} className="text-emerald-700 font-bold hover:underline">{selectedEnquiry.email}</a>
                  </div>
                  <div>
                    <span className="text-stone-450 block font-semibold">Phone Number</span>
                    <span className="text-stone-800 font-bold">{selectedEnquiry.phone}</span>
                  </div>
                </div>
              </div>

              {/* Product Reference */}
              {selectedEnquiry.product && (
                <div className="pt-4 space-y-2.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400">Target Product Details</h4>
                  <div className="flex gap-3 items-center bg-stone-50 border border-stone-200 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0 flex items-center justify-center">
                      {selectedEnquiry.product.images?.[0]?.url ? (
                        <img src={selectedEnquiry.product.images[0].url} alt={selectedEnquiry.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">🌾</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-stone-800 text-xs truncate block leading-snug">{selectedEnquiry.product.name}</span>
                      <span className="text-[10px] text-stone-450 mt-0.5 block">Catalog Retail: ₹{selectedEnquiry.product.retailPrice?.toLocaleString()}</span>
                    </div>
                    {selectedEnquiry.quantity && (
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block font-semibold">Requested Volume</span>
                        <span className="font-black text-stone-800 text-xs">{selectedEnquiry.quantity} units</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="pt-4 space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400">Buyer Message / Requirements</h4>
                <div className="bg-stone-50 border border-stone-200/75 rounded-2xl p-4 text-stone-750 text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.message || <span className="text-stone-400 italic">No additional message provided.</span>}
                </div>
              </div>

              {/* Workflow Status Action Form */}
              <form onSubmit={handleUpdateStatus} className="pt-4 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400">Workflow &amp; Audit Trail</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                      Enquiry Status
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white font-semibold focus:outline-none"
                    >
                      <option value="pending">Pending Sourcing</option>
                      <option value="reviewed">Reviewed / Quoted</option>
                      <option value="closed">Closed / Finished</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-550 uppercase tracking-wide mb-1.5">
                      Audited By
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedEnquiry.reviewedBy?.name || user.name}
                      className="w-full px-3 py-2 border border-stone-250 rounded-xl bg-stone-50 text-stone-400 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-550 uppercase tracking-wide mb-1.5">
                    Internal Notes <span className="text-stone-400 font-normal lowercase">(internal use only)</span>
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-2xl text-xs focus:outline-none resize-none"
                    placeholder="Enter internal verification logs, trade terms, quoting status, or logistics notes..."
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-2.5 border border-stone-200 hover:bg-stone-50 font-bold rounded-xl text-xs text-stone-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-100"
                  >
                    {modalSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Storing Logs...
                      </>
                    ) : (
                      <>Save Sourcing Log</>
                    )}
                  </button>
                </div>
              </form>

            </div>

          </div>
        </>
      )}

    </AdminLayout>
  );
};

export default AdminEnquiries;
