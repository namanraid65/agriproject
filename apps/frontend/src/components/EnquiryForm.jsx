import React, { useState, useEffect } from 'react';
import { useMarket } from '../hooks/useMarket.js';
import api from '../services/api.js';
import { Loader2, Send, CheckCircle2, ShieldCheck, Mail, Phone, Building, MessageSquare, Tag } from 'lucide-react';

export const EnquiryForm = ({ type = 'general', product = null, onSuccess }) => {
  const { user, styles, isB2B } = useMarket();

  // Form states
  const [contactPerson, setContactPerson] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [companyName, setCompanyName] = useState(user?.companyDetails?.companyName || '');
  const [quantity, setQuantity] = useState(type === 'bulk' ? 100 : 1);
  const [message, setMessage] = useState('');

  // Request states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Sync user details on login state change
  useEffect(() => {
    if (user) {
      if (!contactPerson) setContactPerson(user.name || '');
      if (!email) setEmail(user.email || '');
      if (!phone) setPhone(user.phone || '');
      if (!companyName) setCompanyName(user.companyDetails?.companyName || '');
    }
  }, [user]);

  const validate = () => {
    if (!contactPerson.trim()) return 'Contact person name is required';
    if (!email.trim()) return 'Email address is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address';
    if (!phone.trim()) return 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(phone.trim())) return 'Please enter a valid 10-digit phone number';
    if (type === 'bulk' && !companyName.trim()) return 'Company/Farm name is required for wholesale bulk orders';
    if (['product', 'bulk'].includes(type) && (!quantity || quantity < 1)) return 'Quantity must be at least 1';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        type,
        product: product?._id || null,
        companyName: companyName.trim() || undefined,
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        quantity: ['product', 'bulk'].includes(type) ? Number(quantity) : undefined,
        message: message.trim() || undefined,
      };

      await api.post('/enquiries', payload);
      setSuccess(true);
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err) {
      console.error('Failed to submit B2B enquiry:', err);
      setError(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 shadow-md">
          <CheckCircle2 className="h-8 w-8 animate-bounce" />
        </div>
        <h3 className="font-black text-stone-800 text-xl tracking-tight">Enquiry Submitted!</h3>
        <p className="text-stone-500 text-sm max-w-xs mx-auto leading-relaxed">
          Your request has been logged. Our agricultural sourcing desk will review your details and get back to you shortly.
        </p>
      </div>
    );
  }

  const ringColor = isB2B ? 'focus:ring-amber-500' : 'focus:ring-emerald-500';
  const borderFocus = isB2B ? 'focus:border-amber-500' : 'focus:border-emerald-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Product Information Context Panel */}
      {product && (
        <div className={`rounded-2xl border p-4 flex gap-3 items-center ${isB2B ? 'bg-amber-50/50 border-amber-200/60' : 'bg-emerald-50/50 border-emerald-250/60'}`}>
          <span className="text-3xl">🌾</span>
          <div className="flex-1 min-w-0">
            <span className={`text-[9px] font-black uppercase tracking-wider ${isB2B ? 'text-amber-800' : 'text-emerald-800'}`}>
              RFQ Context
            </span>
            <h4 className="font-bold text-stone-800 text-sm truncate leading-snug">{product.name}</h4>
            <p className="text-xs text-stone-400 font-medium mt-0.5">Retail: ₹{product.retailPrice?.toLocaleString()} / unit</p>
          </div>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-stone-550 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-stone-400" />
            Contact Person Name
          </label>
          <input
            type="text"
            required
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 ${ringColor} ${borderFocus} text-sm transition-all`}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-550 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-stone-400" />
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 ${ringColor} ${borderFocus} text-sm transition-all`}
            placeholder="buyer@greenfarms.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-555 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-stone-400" />
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 ${ringColor} ${borderFocus} text-sm transition-all`}
            placeholder="10-digit mobile number"
          />
        </div>

        <div className={type === 'bulk' ? 'sm:col-span-1' : 'sm:col-span-2'}>
          <label className="block text-xs font-bold text-stone-555 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-stone-400" />
            Company / Farm Name {type !== 'bulk' && <span className="text-stone-400 font-normal lowercase">(optional)</span>}
          </label>
          <input
            type="text"
            required={type === 'bulk'}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 ${ringColor} ${borderFocus} text-sm transition-all`}
            placeholder="e.g. Greenfield Growers Co-op"
          />
        </div>

        {['product', 'bulk'].includes(type) && (
          <div>
            <label className="block text-xs font-bold text-stone-555 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-stone-400" />
              Required Quantity (units)
            </label>
            <input
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={1}
              className={`w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 ${ringColor} ${borderFocus} text-sm transition-all`}
              placeholder="e.g. 100"
            />
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-stone-555 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-stone-400" />
            Enquiry Message / Special Specifications
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className={`w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 ${ringColor} ${borderFocus} text-sm transition-all resize-none`}
            placeholder="Provide detail specifications, certifications required, packaging requirements, or delivery schedule timelines..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-px transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 ${
          isB2B
            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200/50'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/50'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Submitting Request...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Submit B2B Sourcing Enquiry
          </>
        )}
      </button>
    </form>
  );
};

export default EnquiryForm;
