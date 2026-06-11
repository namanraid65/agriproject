import React, { useState, useEffect } from 'react';
import { useMarket } from '../hooks/useMarket.js';
import api from '../services/api.js';
import { Loader2, FileText } from 'lucide-react';
import { EnquiryForm } from '../components/EnquiryForm.jsx';

export const CMSPage = ({ pageType }) => {
  const { isB2B } = useMarket();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/cms/${pageType}`);
        setPage(response.data?.data?.page || null);
      } catch (err) {
        console.error(`Failed to fetch CMS page ${pageType}:`, err);
        setError('Could not load page contents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [pageType]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-stone-400 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold animate-pulse">Loading page contents...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-700">{error || 'Page Not Found'}</h2>
        <p className="text-sm text-stone-500">The page you are looking for does not exist or has not been published yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Page Header Card */}
        <div className={`rounded-3xl p-8 md:p-12 text-white shadow-lg mb-8 relative overflow-hidden ${
          isB2B
            ? 'bg-gradient-to-r from-amber-700 to-amber-900 shadow-amber-900/10'
            : 'bg-gradient-to-r from-emerald-700 to-emerald-900 shadow-emerald-900/10'
        }`}>
          {/* Decorative shapes */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute right-20 top-5 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10 space-y-3">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{page.title}</h1>
            {page.metaDescription && (
              <p className="text-sm md:text-base text-white/80 max-w-2xl font-medium leading-relaxed">
                {page.metaDescription}
              </p>
            )}
          </div>
        </div>

        {/* Page Content Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-10 shadow-sm space-y-8">
          
          {/* Main content body */}
          <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-sm whitespace-pre-wrap">
            {page.content}
          </div>

          {/* Integrate EnquiryForm on Contact Us page */}
          {pageType === 'contact' && (
            <div className="border-t border-stone-150 pt-8 space-y-6">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
                <h3 className="text-sm font-black text-stone-850 mb-2">Send Us an Enquiry</h3>
                <p className="text-xs text-stone-500 mb-6">
                  Fill out this form and our support desk will contact you within 24-48 business hours.
                </p>
                <EnquiryForm type="general" />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default CMSPage;
