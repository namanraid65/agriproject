import React, { useState } from 'react';
import { useMarket } from '../hooks/useMarket.js';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { ShieldCheck, Truck, Percent, FileText, ChevronRight, HelpCircle } from 'lucide-react';

export const RFQ = () => {
  const { isB2B, user } = useMarket();
  const [activeFormType, setActiveFormType] = useState('general'); // 'general' or 'bulk'



  const themeText = isB2B ? 'text-amber-700' : 'text-emerald-700';
  const themeBg = isB2B ? 'bg-amber-50' : 'bg-emerald-50';
  const themeBorder = isB2B ? 'border-amber-200' : 'border-emerald-200';
  const themeAccent = isB2B ? 'border-amber-500' : 'border-emerald-500';

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${themeBg} ${themeText}`}>
            Corporate Sourcing &amp; Procurement
          </span>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight mt-4">
            B2B Sourcing &amp; Wholesale RFQ
          </h1>
          <p className="text-sm text-stone-500 mt-2.5 leading-relaxed">
            Partner with OpenAgri's verified network of over 12,000 farmers and direct manufacturers. Register bulk cargo requirements, negotiate custom SLAs, or request contract pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: B2B Benefits & FAQ */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Benefits Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 space-y-6">
              <h3 className="font-black text-stone-850 text-lg border-b border-stone-100 pb-3">
                Wholesale Sourcing Advantages
              </h3>

              <div className="space-y-4">
                {[
                  {
                    icon: <Percent className="h-5 w-5" />,
                    title: 'Tiered Bulk Pricing',
                    desc: 'Direct farm sourcing cuts out middlemen. Get progressive discounts starting at quantities of 50+ units.',
                  },
                  {
                    icon: <Truck className="h-5 w-5" />,
                    title: 'Tailored Freight & Logistics',
                    desc: 'Choose between LTL/FTL cargo shipments, ex-works farm gate pickup, or doorstep container logistics.',
                  },
                  {
                    icon: <ShieldCheck className="h-5 w-5" />,
                    title: 'Batch Certified Testing',
                    desc: 'Request FSSAI, organic certifications, moisture control audits, or pesticide-free lab analysis.',
                  },
                  {
                    icon: <FileText className="h-5 w-5" />,
                    title: 'NET-30 Billing Accounts',
                    desc: 'Establish regular trade accounts with payment cycles and credit limits upon business verification.',
                  },
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-3.5 items-start">
                    <div className={`p-2.5 rounded-xl shrink-0 ${themeBg} ${themeText}`}>
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-800 text-sm">{benefit.title}</h4>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Procurement FAQs */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 space-y-4">
              <h3 className="font-black text-stone-850 text-md flex items-center gap-2">
                <HelpCircle className={`h-5 w-5 ${themeText}`} />
                Procurement FAQ
              </h3>

              <div className="space-y-3.5 divide-y divide-stone-100">
                {[
                  {
                    q: 'What is the Minimum Order Quantity (MOQ)?',
                    a: 'Default B2B MOQ is ₹10,000 total order value, or specific unit counts depending on product (e.g., 50 bags for fertilizers).',
                  },
                  {
                    q: 'How long does a quote response take?',
                    a: 'Our corporate sourcing desk reviews RFQ filings and responds with an official commercial quote within 2 business hours.',
                  },
                ].map((faq, i) => (
                  <div key={i} className={i > 0 ? 'pt-3.5' : ''}>
                    <p className="text-xs font-bold text-stone-800 flex items-center gap-1">
                      <ChevronRight className="h-3 w-3 text-stone-400 shrink-0" />
                      {faq.q}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed pl-4">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Enquiry Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3.5">
              <h3 className="font-black text-stone-850 text-lg">Send Enquiry Request</h3>
              
              {/* Type Switcher tabs */}
              <div className="flex bg-stone-150 p-0.5 rounded-xl border border-stone-200/60 overflow-hidden text-xs">
                <button
                  onClick={() => setActiveFormType('general')}
                  className={`px-3.5 py-1.5 font-bold rounded-lg transition-all ${
                    activeFormType === 'general' ? 'bg-white text-stone-805 shadow-sm' : 'text-stone-500 hover:text-stone-750'
                  }`}
                >
                  General B2B
                </button>
                <button
                  onClick={() => setActiveFormType('bulk')}
                  className={`px-3.5 py-1.5 font-bold rounded-lg transition-all ${
                    activeFormType === 'bulk' ? 'bg-white text-stone-805 shadow-sm' : 'text-stone-500 hover:text-stone-750'
                  }`}
                >
                  Bulk RFQ
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-400 font-semibold leading-relaxed">
              {activeFormType === 'bulk'
                ? 'Fill this form to request high-volume sourcing quotes. Company/farm verification details are mandatory.'
                : 'Fill this form for wholesale account set-up, partnership requests, logistics inquiries, or general B2B catalog access.'}
            </p>

            <EnquiryForm type={activeFormType} key={activeFormType} />
          </div>

        </div>

      </div>
    </div>
  );
};

export default RFQ;
