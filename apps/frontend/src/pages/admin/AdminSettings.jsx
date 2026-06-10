import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../../hooks/useMarket.js';
import api from '../../services/api.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { Loader2, Save } from 'lucide-react';

export const AdminSettings = () => {
  const { user } = useMarket();
  const navigate = useNavigate();

  // Guard routing
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/admin/settings');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Form states
  const [siteName, setSiteName] = useState('');
  const [defaultMode, setDefaultMode] = useState('b2c');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Address states
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');

  // Social Links states
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/settings');
      const settings = response.data?.data?.settings || {};
      
      setSiteName(settings.siteName || '');
      setDefaultMode(settings.defaultMode || 'b2c');
      setContactEmail(settings.contactEmail || '');
      setPhone(settings.phone || '');

      const address = settings.address || {};
      setLine1(address.line1 || '');
      setLine2(address.line2 || '');
      setCity(address.city || '');
      setStateName(address.state || '');
      setPincode(address.pincode || '');
      setCountry(address.country || 'India');

      const socials = settings.socialLinks || {};
      setInstagram(socials.instagram || '');
      setFacebook(socials.facebook || '');
      setWhatsapp(socials.whatsapp || '');
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Could not fetch global settings configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchSettings();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload = {
      siteName,
      defaultMode,
      contactEmail,
      phone,
      address: {
        line1,
        line2,
        city,
        state: stateName,
        pincode,
        country
      },
      socialLinks: {
        instagram,
        facebook,
        whatsapp
      }
    };

    try {
      await api.patch('/settings', payload);
      setMessage('Settings saved successfully!');
      fetchSettings();
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err.response?.data?.message || 'Failed to save configuration settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

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
    <AdminLayout navItems={navItems} pageTitle="Global Site Settings" user={{ name: user.name, role: 'Administrator', initials: user.name?.[0]?.toUpperCase() || 'A' }}>
      <div className="max-w-2xl bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50">
          <h3 className="font-bold text-stone-850 text-sm">Site Configuration Panel</h3>
          <p className="text-[10px] text-stone-400 mt-0.5">Control company identity, default shop catalog settings, support emails, and social handles.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3 text-stone-400">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">Loading system settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-6">
            
            {message && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-semibold">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Core Settings */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400 pb-1 border-b border-stone-150">General Brand Identity</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">Site Name</label>
                  <input
                    type="text"
                    required
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">Default Catalog Mode</label>
                  <select
                    value={defaultMode}
                    onChange={(e) => setDefaultMode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  >
                    <option value="b2c">B2C Retail Mode</option>
                    <option value="b2b">B2B Wholesale Mode</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400 pb-1 border-b border-stone-150">Customer Support Contacts</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">Contact Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">Primary Help Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400 pb-1 border-b border-stone-150">Corporate Headquarters Address</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">Line 1 Address</label>
                  <input
                    type="text"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">Line 2 (Suite/Floor)</label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">Pincode / Zip</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-stone-400 pb-1 border-b border-stone-150">Official Social Handles</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">Facebook page</label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-550 mb-1">WhatsApp chat link</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50 focus:bg-white text-xs outline-none focus:border-[#5a9e30]"
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-[#3b6d11] hover:bg-[#27500a] text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving Configuration...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Global Configuration
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
