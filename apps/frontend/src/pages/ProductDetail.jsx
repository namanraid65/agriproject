import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMarket } from '../hooks/useMarket.js';
import { useCart } from '../hooks/useCart.js';
import { StarRating } from '../components/ProductCard.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import api from '../services/api.js';
import QuantityInput from '../components/QuantityInput.jsx';
import {
  ChevronRight, ChevronLeft, ChevronDown,
  ShoppingCart, FileText, Heart, Share2,
  Package, Truck, ShieldCheck, RefreshCw,
  CheckCircle2, AlertTriangle, Minus, Plus,
  ArrowLeft, ZoomIn, Award, BadgeCheck, Loader2
} from 'lucide-react';

/* ─── Fallback placeholder image URL ─── */
const fallback = (name) =>
  `https://placehold.co/800x600/e7f3e0/2d6a4f?text=${encodeURIComponent(name?.slice(0, 16) || 'Product')}`;

/* ─── Skeleton ─────────────────────────────────────────── */
function Skeleton({ h = '1rem', w = '100%', r = '8px', className = '' }) {
  return (
    <div
      className={`animate-pulse bg-stone-200 flex-shrink-0 ${className}`}
      style={{ height: h, width: w, borderRadius: r }}
    />
  );
}

/* ─── Image Gallery ────────────────────────────────────── */
function ImageGallery({ images, productName, isB2B }) {
  const [active,  setActive]  = useState(0);
  const [zoomed,  setZoomed]  = useState(false);
  const [imgError, setImgError] = useState({});

  const imgs = images?.length > 0
    ? images
    : [{ url: fallback(productName), altText: productName, _id: 'placeholder' }];

  const src = (img) => (imgError[img._id || img.url] ? fallback(productName) : img.url);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className={`relative rounded-3xl overflow-hidden ${isB2B ? 'bg-amber-50' : 'bg-emerald-50'} border border-stone-200 cursor-zoom-in`}
        style={{ aspectRatio: '4/3' }}
        onClick={() => setZoomed(true)}
      >
        <img
          key={active}
          src={src(imgs[active])}
          alt={imgs[active]?.altText || productName}
          className="w-full h-full object-cover transition-all duration-400"
          onError={() => setImgError(prev => ({ ...prev, [imgs[active]?._id || imgs[active]?.url]: true }))}
        />
        {/* Zoom hint */}
        <button className="absolute bottom-3 right-3 bg-black/40 text-white backdrop-blur p-2 rounded-xl hover:bg-black/60 transition-colors">
          <ZoomIn className="h-4 w-4" />
        </button>
        {/* Nav arrows (only if multiple images) */}
        {imgs.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + imgs.length) % imgs.length); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-xl p-2 hover:bg-white shadow-md transition-all"
            ><ChevronLeft className="h-5 w-5 text-stone-700" /></button>
            <button
              onClick={e => { e.stopPropagation(); setActive(a => (a + 1) % imgs.length); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-xl p-2 hover:bg-white shadow-md transition-all"
            ><ChevronRight className="h-5 w-5 text-stone-700" /></button>
          </>
        )}
        {/* Image counter */}
        {imgs.length > 1 && (
          <span className="absolute top-3 left-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur">
            {active + 1} / {imgs.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {imgs.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {imgs.map((img, i) => (
            <button
              key={img._id || i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                i === active
                  ? isB2B ? 'border-amber-500 shadow-md shadow-amber-200' : 'border-emerald-500 shadow-md shadow-emerald-200'
                  : 'border-transparent hover:border-stone-300'
              }`}
            >
              <img
                src={src(img)}
                alt={img.altText || `View ${i + 1}`}
                className="w-full h-full object-cover"
                onError={() => setImgError(prev => ({ ...prev, [img._id || img.url]: true }))}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl">✕</button>
          <img
            src={src(imgs[active])}
            alt={imgs[active]?.altText || productName}
            className="max-w-full max-h-full object-contain rounded-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Spec Table ────────────────────────────────────────── */
function SpecTable({ specs, isB2B }) {
  const entries = Object.entries(specs || {});
  if (!entries.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200">
      <table className="w-full text-sm">
        <thead>
          <tr className={isB2B ? 'bg-amber-900 text-white' : 'bg-emerald-900 text-white'}>
            <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider w-2/5">Specification</th>
            <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider">Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, val], i) => (
            <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
              <td className="px-4 py-3 font-semibold text-stone-600 capitalize border-b border-stone-100">{key.replace(/_/g, ' ')}</td>
              <td className="px-4 py-3 text-stone-800 border-b border-stone-100">{String(val)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── B2B Quote Form ───────────────────────────────────── */
function QuoteForm({ product, onClose }) {
  const [qty,  setQty]  = useState(100);
  const [msg,  setMsg]  = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => setSent(true), 600); // simulate API call
  };

  if (sent) return (
    <div className="text-center py-8 space-y-3">
      <div className="text-5xl">✅</div>
      <h3 className="font-bold text-stone-800 text-lg">Quote Request Sent!</h3>
      <p className="text-stone-500 text-sm">Our team will respond within 2 business hours with bulk pricing details.</p>
      <button onClick={onClose} className="mt-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors">Close</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-stone-800 text-lg">Request Wholesale Quote</h3>
      <p className="text-sm text-stone-500">for <span className="font-semibold text-stone-700">{product.name}</span></p>

      <div>
        <label className="block text-xs font-bold text-stone-600 mb-1.5 uppercase tracking-wide">Required Quantity (units)</label>
        <input
          type="number" value={qty} min={1}
          onChange={e => setQty(e.target.value)}
          className="w-full px-4 py-2.5 border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-600 mb-1.5 uppercase tracking-wide">Additional Requirements</label>
        <textarea
          value={msg} onChange={e => setMsg(e.target.value)}
          rows={3} placeholder="e.g. Delivery timeline, packaging, certifications needed…"
          className="w-full px-4 py-2.5 border-2 border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:border-amber-400"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 px-4 py-2.5 border-2 border-stone-200 text-stone-600 rounded-xl text-sm font-semibold hover:bg-stone-50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors shadow-md shadow-amber-200">
          Submit Request
        </button>
      </div>
    </form>
  );
}

/* ─── FAQ Accordion Item ─────────────────────────────────── */
function FAQItem({ question, answer, isB2B }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white hover:border-stone-300 transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-extrabold text-stone-850 text-sm">{question}</span>
        <span className={`transform transition-transform duration-250 shrink-0 ml-4 ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown className={`h-4.5 w-4.5 ${isB2B ? "text-amber-600" : "text-emerald-600"}`} />
        </span>
      </button>
      <div
        className={`transition-all duration-355 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[500px] border-t border-stone-100 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 py-4 text-xs text-stone-600 leading-relaxed bg-stone-50">
          {answer}
        </div>
      </div>
    </div>
  );
}

/* ═══ PRODUCT DETAIL PAGE ══════════════════════════════════ */
export default function ProductDetail() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const { isB2B, marketMode, styles } = useMarket();

  const [product,     setProduct]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [qty,         setQty]         = useState(1);
  const [activeTab,   setActiveTab]   = useState('description');
  const [showQuote,   setShowQuote]   = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted,  setWishlisted]  = useState(false);
  const [shareText,   setShareText]   = useState('');

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchCanReview = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCanReview(false);
      return;
    }
    try {
      const res = await api.get(`/products/${id}/can-review`);
      setCanReview(res.data?.data?.canReview || false);
    } catch (err) {
      console.error('Failed to check review privilege:', err);
      setCanReview(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get(`/products/${id}/reviews`);
      setReviews(res.data?.data?.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  /* ── Fetch ── */
  useEffect(() => {
    setLoading(true);
    setError(null);
    setProduct(null);
    setActiveTab('description');

    api.get(`/products/${id}?marketMode=${marketMode}`)
      .then(res => {
        const prod = res.data?.data?.product;
        setProduct(prod);
        // check wishlist
        try {
          const stored = JSON.parse(localStorage.getItem("agri-wishlist") || "[]");
          setWishlisted(stored.includes(id));
        } catch (e) {
          console.error(e);
        }
      })
      .catch(err => {
        if (err.response?.status === 404) setError('Product not found.');
        else if (err.response?.status === 403) setError('This product is not available in your current market mode.');
        else setError('Failed to load product. Please try again.');
      })
      .finally(() => setLoading(false));

    fetchReviews();
    fetchCanReview();
  }, [id, marketMode]);

  /* ── Wishlist handler ── */
  const toggleWishlist = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("agri-wishlist") || "[]");
      let updated;
      if (stored.includes(id)) {
        updated = stored.filter(prodId => prodId !== id);
        setWishlisted(false);
      } else {
        updated = [...stored, id];
        setWishlisted(true);
      }
      localStorage.setItem("agri-wishlist", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  /* ── Share handler ── */
  const handleShare = () => {
    const shareData = {
      title: product?.name || 'OpenAgri Product',
      text: product?.description || '',
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareText('Link Copied!');
      setTimeout(() => setShareText(''), 2000);
    }
  };

  const { addToCart } = useCart();

  /* ── Add to cart handler ── */
  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    addToCart(product, qty);
  };

  /* ── Qty stepper ── */
  const changeQty = (delta) => setQty(q => Math.max(1, Math.min(product?.stock || 1, q + delta)));

  /* ── Review submit handler ── */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: userRating, comment: userComment });
      setUserComment('');
      setUserRating(5);
      fetchReviews();
      fetchCanReview();
      const prodRes = await api.get(`/products/${id}?marketMode=${marketMode}`);
      if (prodRes.data?.data?.product) {
        setProduct(prodRes.data.data.product);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const themeGrad   = isB2B ? 'from-amber-900 to-stone-900'        : 'from-emerald-900 to-stone-900';
  const themeBadge  = isB2B ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
  const themeBtn    = isB2B ? 'bg-gradient-to-r from-amber-600 to-amber-700 shadow-amber-200 hover:from-amber-700 hover:to-amber-800'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-emerald-200 hover:from-emerald-700 hover:to-emerald-800';
  const themeOutline = isB2B ? 'border-amber-600 text-amber-700 hover:bg-amber-50' : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50';
  const themeTab    = isB2B ? 'border-amber-600 text-amber-700' : 'border-emerald-600 text-emerald-700';

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-stone-50">
      <div className={`bg-gradient-to-r ${themeGrad} h-16`} />
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <Skeleton h="420px" r="24px" />
          <div className="flex gap-2">{Array(4).fill(0).map((_, i) => <Skeleton key={i} h="64px" w="64px" r="12px" />)}</div>
        </div>
        <div className="space-y-5 pt-2">
          <Skeleton h="14px" w="120px" r="8px" />
          <Skeleton h="36px" w="80%" r="8px" />
          <Skeleton h="36px" w="55%" r="8px" />
          <Skeleton h="14px" w="160px" r="6px" />
          <Skeleton h="18px" w="90%" r="6px" />
          <Skeleton h="18px" w="75%" r="6px" />
          <Skeleton h="80px" r="16px" />
          <Skeleton h="56px" r="14px" />
        </div>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-5 text-stone-500">
      <div className="text-6xl">🚫</div>
      <p className="font-bold text-stone-700 text-lg">{error}</p>
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2.5 border-2 border-stone-200 text-stone-600 rounded-xl text-sm font-semibold hover:bg-stone-100">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
        <Link to="/products" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white ${themeBtn} shadow-md`}>
          Browse Products
        </Link>
      </div>
    </div>
  );

  const catName = typeof product?.category === 'object' ? product.category?.name : product?.category;
  const inStock = product?.stock > 0;
  const lowStock = product?.stock > 0 && product?.stock <= 20;
  const specs   = product?.specifications || {};
  const hasSpecs = Object.keys(specs).length > 0;

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Page header / breadcrumb bar ── */}
      <div className={`bg-gradient-to-r ${themeGrad} text-white py-4 px-6`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <nav className="flex items-center gap-2 text-sm text-white/60">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/products" className="hover:text-white transition-colors">Products</Link>
            {catName && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link to={`/products?category=${product?.category?._id || ''}`} className="hover:text-white transition-colors">{catName}</Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-medium truncate max-w-[180px]">{product?.name}</span>
          </nav>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${themeBadge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isB2B ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
            {isB2B ? 'B2B Wholesale Mode' : 'B2C Retail Mode'}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 font-semibold mb-7 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">

          {/* ══ LEFT: Gallery ══ */}
          <div>
            <ImageGallery images={product?.images} productName={product?.name} isB2B={isB2B} />
          </div>

          {/* ══ RIGHT: Info + CTA ══ */}
          <div className="space-y-5">

            {/* Category + badges */}
            <div className="flex flex-wrap items-center gap-2">
              {catName && (
                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${isB2B ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {catName}
                </span>
              )}
              {product?.featured && (
                <span className="inline-flex items-center gap-1 text-xs font-black text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-300">
                  <Award className="h-3 w-3" />Featured
                </span>
              )}
              {isB2B && product?.b2bVisible && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <BadgeCheck className="h-3 w-3" />Wholesale Available
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-stone-900 leading-tight tracking-tight">
              {product?.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={product?.averageRating || 4.8} count={product?.numReviews ?? 213} size="lg" />
              <span className="text-xs text-stone-500">· {product?.numReviews ?? 213} verified purchases</span>
            </div>

            {/* ── Stock Indicator ── */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
              !inStock
                ? 'bg-red-50 border-red-200'
                : lowStock
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
            }`}>
              {!inStock
                ? <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                : <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${lowStock ? 'text-amber-600' : 'text-emerald-600'}`} />
              }
              <div>
                <p className={`text-sm font-bold ${!inStock ? 'text-red-700' : lowStock ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {!inStock ? 'Out of Stock' : lowStock ? `Only ${product.stock} units left` : 'In Stock'}
                </p>
                {inStock && <p className="text-xs text-stone-500 mt-0.5">Ships within 24 hours of order confirmation</p>}
              </div>
            </div>

            {/* ── MODE-AWARE PRICING PANEL ── */}
            {isB2B ? (
              /* ── B2B Pricing ── */
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-800 uppercase tracking-wider">Wholesale Price (per unit)</span>
                  <span className="text-3xl font-black text-amber-700 tracking-tight">
                    ₹{product?.retailPrice?.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-200">
                  {[
                    { tier: '50–200 units',   disc: 'Listed price' },
                    { tier: '201–500 units',   disc: '~8% off' },
                    { tier: '500+ units',      disc: 'Custom quote' },
                  ].map(({ tier, disc }) => (
                    <div key={tier} className="bg-white rounded-xl p-2.5 text-center border border-amber-100">
                      <p className="text-[10px] font-bold text-amber-900 leading-tight">{tier}</p>
                      <p className="text-xs text-amber-700 font-semibold mt-0.5">{disc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-amber-700/80">Final pricing confirmed in quote. GST applicable. Freight calculated at checkout.</p>
              </div>
            ) : (
              /* ── B2C Pricing ── */
              <div className="space-y-1">
                <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Retail Price</p>
                {product?.discountPrice && product.discountPrice > 0 ? (
                  <div className="space-y-2 bg-stone-100/60 p-4 border border-stone-200/80 rounded-2xl">
                    <div className="flex items-baseline gap-2 text-stone-500 text-sm font-semibold">
                      <span>M.R.P.:</span>
                      <span className="line-through">₹{product.retailPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-sm font-bold text-red-600 uppercase tracking-wide">Deal Price:</span>
                      <span className="text-3xl font-black text-stone-900 tracking-tight">
                        ₹{product.discountPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-stone-605 flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span>You Save:</span>
                      <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg shadow-sm">
                        ₹{(product.retailPrice - product.discountPrice).toLocaleString()} ({Math.round(((product.retailPrice - product.discountPrice) / product.retailPrice) * 100)}% Off)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-emerald-700 tracking-tight">
                      ₹{product?.retailPrice?.toLocaleString()}
                    </span>
                  </div>
                )}
                <span className="text-stone-400 text-xs block mt-1">/ unit · incl. all taxes</span>
                <p className="text-xs text-emerald-600 font-semibold mt-1">🎉 Free delivery on orders above ₹499</p>
              </div>
            )}

            {/* ── QTY + CTA ── */}
            {inStock && (
              <div className="space-y-3 pt-1">
                {/* Qty stepper */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-stone-600">Quantity</span>
                  <div className="flex items-center border-2 border-stone-200 rounded-xl overflow-hidden">
                    <button onClick={() => changeQty(-1)} disabled={qty <= 1}
                      className="px-3.5 py-2 text-stone-500 hover:bg-stone-100 disabled:opacity-40 transition-colors border-r border-stone-200">
                      <Minus className="h-4 w-4" />
                    </button>
                    <QuantityInput
                      value={qty}
                      max={product?.stock}
                      onChange={(val) => {
                        setQty(val);
                      }}
                      className="w-12 text-center font-bold text-stone-800 text-sm bg-transparent outline-none"
                    />
                    <button onClick={() => changeQty(1)} disabled={qty >= product?.stock}
                      className="px-3.5 py-2 text-stone-500 hover:bg-stone-100 disabled:opacity-40 transition-colors border-l border-stone-200">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-stone-400">max {product?.stock} available</span>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  {isB2B ? (
                    /* B2B: Primary = Request Quote, Secondary = Add to Watch */
                    <>
                      <button
                        id="request-quote-btn"
                        onClick={() => setShowQuote(true)}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-base text-white transition-all duration-200 active:scale-[0.98] shadow-lg ${themeBtn}`}
                      >
                        <FileText className="h-5 w-5" />
                        Request Wholesale Quote
                      </button>
                      <button
                        onClick={toggleWishlist}
                        className={`p-4 rounded-2xl border-2 ${themeOutline} transition-all duration-200`}
                        title={wishlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                      >
                        <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
                      </button>
                    </>
                  ) : (
                    /* B2C: Primary = Add to Cart, Secondary = Wishlist */
                    <>
                      <button
                        id="add-to-cart-detail-btn"
                        onClick={handleAddToCart}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-base text-white transition-all duration-200 active:scale-[0.98] shadow-lg ${themeBtn}`}
                      >
                        {addedToCart ? (
                          <><CheckCircle2 className="h-5 w-5" />Added to Cart!</>
                        ) : (
                          <><ShoppingCart className="h-5 w-5" />Add to Cart</>
                        )}
                      </button>
                      <button
                        onClick={toggleWishlist}
                        className={`p-4 rounded-2xl border-2 ${themeOutline} transition-all duration-200`}
                        title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current text-red-500' : ''}`} />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={handleShare}
                    className="relative p-4 rounded-2xl border-2 border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600 transition-all duration-200" 
                    title="Share"
                  >
                    <Share2 className="h-5 w-5" />
                    {shareText && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md z-10 whitespace-nowrap">
                        {shareText}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Out of stock fallback CTA */}
            {!inStock && (
              <button className="w-full py-4 rounded-2xl font-bold text-sm text-stone-500 bg-stone-100 border-2 border-stone-200 cursor-not-allowed">
                Notify Me When Available
              </button>
            )}

            {/* ── Trust Badges ── */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { icon: <ShieldCheck className="h-4 w-4" />, label: 'Quality Certified' },
                { icon: <Truck className="h-4 w-4" />,       label: '48hr Delivery' },
                { icon: <RefreshCw className="h-4 w-4" />,   label: 'Easy Returns' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-stone-100 rounded-xl text-center">
                  <span className={isB2B ? 'text-amber-700' : 'text-emerald-700'}>{icon}</span>
                  <span className="text-[11px] font-semibold text-stone-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ TABS: Description / Specs / Delivery / Reviews ══ */}
        <div className="mt-14 border-t border-stone-200 pt-10">
          {/* Tab nav */}
          <div className="flex gap-0 border-b border-stone-200 overflow-x-auto">
            {['description', 'specifications', 'faqs', 'delivery', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all -mb-px ${
                  activeTab === tab
                    ? `${themeTab} border-current`
                    : 'text-stone-400 border-transparent hover:text-stone-700 hover:border-stone-200'
                }`}
              >
                {tab === 'faqs' 
                  ? 'FAQs' 
                  : tab === 'specifications' 
                    ? 'Specifications' 
                    : tab === 'description' 
                      ? 'Description' 
                      : tab === 'delivery' 
                        ? 'Delivery' 
                        : 'Reviews'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="py-8">
            {activeTab === 'description' && (
              <div className="max-w-2xl">
                <p className="text-stone-700 leading-relaxed text-base">{product?.description || 'No description provided.'}</p>

                {isB2B && (
                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2"><BadgeCheck className="h-4 w-4" />B2B Information</h4>
                    <ul className="text-sm text-amber-700 space-y-1.5">
                      <li>✓ Available for bulk purchase with volume pricing tiers</li>
                      <li>✓ Minimum Order Quantity (MOQ) — request quote for exact figure</li>
                      <li>✓ Pallet & freight arrangements available on request</li>
                      <li>✓ Pre-payment or NET-30 credit available for verified accounts</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-2xl">
                {hasSpecs ? (
                  <SpecTable specs={specs} isB2B={isB2B} />
                ) : (
                  <div className="text-center py-12 text-stone-400">
                    <Package className="h-10 w-10 mx-auto mb-3 text-stone-300" />
                    <p className="text-sm font-medium">No specifications have been added yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="max-w-xl space-y-4">
                {[
                  { icon: '📦', title: 'Standard Delivery', desc: '3–5 business days · Free above ₹499', color: 'bg-stone-50 border-stone-200' },
                  { icon: '⚡', title: 'Express Delivery', desc: '24–48 hours · ₹49 flat fee · All pin codes', color: 'bg-emerald-50 border-emerald-200' },
                  isB2B
                    ? { icon: '🚛', title: 'Freight / Bulk Logistics', desc: 'Arranged on request · LTL & FTL available · Quote includes freight', color: 'bg-amber-50 border-amber-200' }
                    : { icon: '🔄', title: 'Easy Returns', desc: '7-day return window · Freshness guarantee · No questions asked', color: 'bg-blue-50 border-blue-200' },
                ].map(({ icon, title, desc, color }) => (
                  <div key={title} className={`flex items-start gap-4 p-4 rounded-2xl border ${color}`}>
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                    <div>
                      <p className="font-bold text-stone-800 text-sm">{title}</p>
                      <p className="text-stone-500 text-sm mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'faqs' && (
              <div className="max-w-2xl space-y-4">
                {product?.faqs?.length > 0 ? (
                  product.faqs.map((faq, i) => (
                    <FAQItem 
                      key={i} 
                      question={faq.question} 
                      answer={faq.answer} 
                      isB2B={isB2B} 
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-stone-400">
                    <p className="text-sm font-medium">No FAQs have been added to this product yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Rating Breakdown Summary */}
                  <div className="md:col-span-4 space-y-4">
                    <h3 className="font-black text-stone-850 text-base">Customer Rating Summary</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black text-stone-900">{product?.averageRating || 4.8}</span>
                      <div className="flex flex-col">
                        <StarRating rating={product?.averageRating || 4.8} size="md" />
                        <span className="text-xs text-stone-500 mt-1">{product?.numReviews ?? 213} global ratings</span>
                      </div>
                    </div>

                    {/* Bars */}
                    <div className="space-y-2 pt-2">
                      {[
                        { stars: 5, pct: reviews.length > 0 ? (reviews.filter(r => r.rating === 5).length / reviews.length) * 100 : 80 },
                        { stars: 4, pct: reviews.length > 0 ? (reviews.filter(r => r.rating === 4).length / reviews.length) * 100 : 15 },
                        { stars: 3, pct: reviews.length > 0 ? (reviews.filter(r => r.rating === 3).length / reviews.length) * 100 : 3 },
                        { stars: 2, pct: reviews.length > 0 ? (reviews.filter(r => r.rating === 2).length / reviews.length) * 100 : 1 },
                        { stars: 1, pct: reviews.length > 0 ? (reviews.filter(r => r.rating === 1).length / reviews.length) * 100 : 1 },
                      ].map(({ stars, pct }) => (
                        <div key={stars} className="flex items-center gap-3 text-xs text-stone-600">
                          <span className="w-10 text-right font-semibold">{stars} star</span>
                          <div className="flex-1 h-3 bg-stone-250 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-stone-400 font-semibold">{Math.round(pct)}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Review constraint warning */}
                    {!canReview && (
                      <div className="bg-stone-100 border border-stone-200 rounded-2xl p-4 text-stone-600 text-xs leading-relaxed flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-stone-450 shrink-0 mt-0.5" />
                        <p>
                          Only verified purchasers of this product can submit a review. This helps prevent fake reviews and ensures feedback is honest and reliable.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Reviews List & Write Review Box */}
                  <div className="md:col-span-8 space-y-6">
                    {/* Write Review Form */}
                    {canReview && (
                      <div className="bg-white border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                        <h3 className="font-black text-stone-850 text-base">Write a Customer Review</h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                          {/* Rating select stars */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Select Rating</label>
                            <div className="flex gap-1.5 items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setUserRating(star)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                >
                                  <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill={star <= userRating ? '#c8860a' : 'none'}
                                    stroke="#c8860a"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                </button>
                              ))}
                              <span className="text-xs font-bold text-stone-600 ml-2">({userRating} out of 5)</span>
                            </div>
                          </div>

                          {/* Comment textarea */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Review Comments (Optional)</label>
                            <textarea
                              value={userComment}
                              onChange={(e) => setUserComment(e.target.value)}
                              rows="3"
                              placeholder="Share your experience using this agricultural product..."
                              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-xs resize-none focus:outline-none focus:border-stone-300"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={submittingReview}
                            className={`w-full py-3 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                              isB2B ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Rating'}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* List of Reviews */}
                    <div className="space-y-4">
                      <h3 className="font-black text-stone-850 text-base">Reviews ({reviews.length > 0 ? reviews.length : (product?.numReviews ?? 213)})</h3>
                      {reviewsLoading ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
                        </div>
                      ) : reviews.length === 0 ? (
                        /* Default mock reviews for clean seeded look */
                        <div className="space-y-4 divide-y divide-stone-100">
                          {[
                            { name: 'Rajesh Kumar', rating: 5, date: '2026-05-18', comment: 'Superb quality seeds! Germination was almost 95%. I would highly recommend this for harvest planning.' },
                            { name: 'Sanjay Patil', rating: 4, date: '2026-05-02', comment: 'Very good results. Delivery was fast within 24 hours. The packaging was clean and sturdy.' },
                            { name: 'Ramesh Sawant', rating: 5, date: '2026-04-12', comment: 'Highly pure and authentic. Using this for my organic farm has significantly improved crop yield.' },
                          ].map((item, idx) => (
                            <div key={idx} className="pt-4 first:pt-0 space-y-1.5 text-xs text-stone-605">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-stone-800">{item.name}</span>
                                <span className="text-[10px] text-stone-400">{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <StarRating rating={item.rating} size="sm" />
                                <span className="inline-flex px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 text-[#3b6d11] text-[9px] font-bold uppercase rounded">Verified Purchase</span>
                              </div>
                              <p className="leading-relaxed">{item.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Real Database Reviews */
                        <div className="space-y-4 divide-y divide-stone-100">
                          {reviews.map((rev) => (
                            <div key={rev._id} className="pt-4 first:pt-0 space-y-1.5 text-xs text-stone-605">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-stone-800">{rev.user?.name || 'KisanMart Customer'}</span>
                                <span className="text-[10px] text-stone-400">{new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <StarRating rating={rev.rating} size="sm" />
                                <span className="inline-flex px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 text-[#3b6d11] text-[9px] font-bold uppercase rounded">Verified Purchase</span>
                              </div>
                              {rev.comment ? (
                                <p className="leading-relaxed">{rev.comment}</p>
                              ) : (
                                <p className="text-stone-400 italic">Submitted a star rating without comment.</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── B2B Quote Modal ── */}
      {showQuote && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setShowQuote(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white z-50 rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-black text-stone-850 text-lg">Request Sourcing Quote</h3>
              <button onClick={() => setShowQuote(false)} className="text-stone-400 hover:text-stone-600 text-lg">✕</button>
            </div>
            <EnquiryForm type="bulk" product={product} onSuccess={() => setShowQuote(false)} />
          </div>
        </>
      )}
    </div>
  );
}
