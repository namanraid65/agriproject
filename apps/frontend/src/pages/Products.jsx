import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMarket } from '../hooks/useMarket.js';
import { useCart } from '../hooks/useCart.js';
import { ProductCard } from '../components/ProductCard.jsx';
import api from '../services/api.js';
import {
  Search, X, SlidersHorizontal, LayoutGrid, List,
  ChevronRight, ChevronDown, Loader2, Package,
  RefreshCw, Filter, CheckSquare, Square
} from 'lucide-react';

/* ─── Skeleton grid card ─────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden animate-pulse">
      <div className="h-52 bg-stone-100" />
      <div className="p-4 space-y-3">
        <div className="h-3.5 bg-stone-200 rounded w-1/3" />
        <div className="h-5 bg-stone-200 rounded w-4/5" />
        <div className="h-3 bg-stone-100 rounded w-full" />
        <div className="h-3 bg-stone-100 rounded w-3/5" />
        <div className="pt-3 border-t border-stone-100 space-y-2.5">
          <div className="h-8 bg-stone-100 rounded-xl" />
          <div className="h-10 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden animate-pulse flex h-44">
      <div className="w-44 flex-shrink-0 bg-stone-100" />
      <div className="flex-1 p-5 space-y-3">
        <div className="h-3 bg-stone-200 rounded w-1/4" />
        <div className="h-5 bg-stone-200 rounded w-2/5" />
        <div className="h-3 bg-stone-100 rounded w-full" />
        <div className="h-3 bg-stone-100 rounded w-3/4" />
        <div className="h-10 bg-stone-100 rounded-xl w-40 mt-auto ml-auto" />
      </div>
    </div>
  );
}

/* ─── Category Sidebar ───────────────────────────────────── */
function CategorySidebar({ categories, activeCategoryId, onSelect, isB2B, loading }) {
  const accent = isB2B ? 'text-amber-700 bg-amber-50 border-amber-300' : 'text-emerald-700 bg-emerald-50 border-emerald-300';
  const dot    = isB2B ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="space-y-1">
      <p className="text-xs font-black uppercase tracking-widest text-stone-400 px-3 mb-3">Categories</p>

      {/* All */}
      <button
        onClick={() => onSelect(null)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
          !activeCategoryId
            ? `border ${accent}`
            : 'text-stone-600 hover:bg-stone-100 border border-transparent'
        }`}
      >
        <span className="flex items-center gap-2">
          <span>🏪</span> All Products
        </span>
        {!activeCategoryId && <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      {/* Per-category */}
      {loading
        ? Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-9 bg-stone-100 rounded-xl animate-pulse mx-1" />
          ))
        : categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => onSelect(cat._id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                activeCategoryId === cat._id
                  ? `border ${accent}`
                  : 'text-stone-600 hover:bg-stone-100 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activeCategoryId === cat._id ? dot : 'bg-stone-300'}`} />
                {cat.name}
              </span>
              {activeCategoryId === cat._id && <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ))
      }
    </div>
  );
}

/* ─── Sort Options ───────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'retailPrice:asc',  label: 'Price: Low → High' },
  { value: 'retailPrice:desc', label: 'Price: High → Low' },
  { value: 'name:asc',         label: 'Name: A → Z' },
];

/* ═══ PRODUCTS PAGE ════════════════════════════════════════ */
export default function Products() {
  const { isB2B, marketMode, styles } = useMarket();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── State ── */
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [pagination,  setPagination]  = useState({ total: 0, pages: 1, page: 1 });
  const [loading,     setLoading]     = useState(true);
  const [catLoading,  setCatLoading]  = useState(true);
  const [error,       setError]       = useState(null);
  const [viewMode,    setViewMode]    = useState('grid');
  const [sortOpen,    setSortOpen]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);  // mobile
  const searchTimer = useRef(null);
  const minPriceTimer = useRef(null);
  const maxPriceTimer = useRef(null);

  /* ── Derived filter state from URL ── */
  const search   = searchParams.get('search')   || '';
  const catId    = searchParams.get('category') || '';
  const sort     = searchParams.get('sort')     || 'createdAt:desc';
  const page     = parseInt(searchParams.get('page') || '1', 10);
  const featured = searchParams.get('featured') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const bulkAvailable = searchParams.get('bulkAvailable') === 'true';
  const maxMOQ = searchParams.get('maxMOQ') || '';
  const verifiedSupplier = searchParams.get('verifiedSupplier') === 'true';

  /* ── Local inputs state ── */
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);

  /* ── Update URL param helper ── */
  const setParam = useCallback((key, val) => {
    setSearchParams(prev => {
      const n = new URLSearchParams(prev);
      if (val) n.set(key, val); else n.delete(key);
      if (key !== 'page') n.delete('page');
      return n;
    }, { replace: true });
  }, [setSearchParams]);

  /* ── Fetch Categories (once) ── */
  useEffect(() => {
    setCatLoading(true);
    api.get('/categories')
      .then(res => setCategories(res.data?.data?.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  /* ── Sync URL filter inputs ── */
  useEffect(() => { setMinInput(minPrice); }, [minPrice]);
  useEffect(() => { setMaxInput(maxPrice); }, [maxPrice]);

  /* ── Fetch Products (whenever filters / mode change) ── */
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set('marketMode', marketMode);
    params.set('sortBy',     sort);
    params.set('page',       page);
    params.set('limit',      12);
    if (search)   params.set('search',   search);
    if (catId)    params.set('category', catId);
    if (featured) params.set('featured', 'true');
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (bulkAvailable) params.set('bulkAvailable', 'true');
    if (maxMOQ)   params.set('maxMOQ', maxMOQ);
    if (verifiedSupplier) params.set('featured', 'true');

    api.get(`/products?${params.toString()}`)
      .then(res => {
        const { data } = res.data;
        setProducts(data?.products || []);
        setPagination(res.data.pagination || { total: 0, pages: 1, page: 1 });
      })
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setLoading(false));
  }, [marketMode, search, catId, sort, page, featured, minPrice, maxPrice, bulkAvailable, maxMOQ, verifiedSupplier]);

  /* ── Handlers ── */
  const handleSearch = (e) => {
    clearTimeout(searchTimer.current);
    const val = e.target.value;
    searchTimer.current = setTimeout(() => setParam('search', val), 380);
  };

  const handleMinPriceChange = (e) => {
    const val = e.target.value;
    setMinInput(val);
    clearTimeout(minPriceTimer.current);
    minPriceTimer.current = setTimeout(() => setParam('minPrice', val), 400);
  };

  const handleMaxPriceChange = (e) => {
    const val = e.target.value;
    setMaxInput(val);
    clearTimeout(maxPriceTimer.current);
    maxPriceTimer.current = setTimeout(() => setParam('maxPrice', val), 400);
  };

  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort';
  const themeRing  = isB2B ? 'focus:ring-amber-400'  : 'focus:ring-emerald-400';
  const themeBtn   = isB2B ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
  const themeText  = isB2B ? 'text-amber-700' : 'text-emerald-700';

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Page header ── */}
      <div className={`${isB2B ? 'bg-gradient-to-r from-amber-900 to-stone-900' : 'bg-gradient-to-r from-emerald-900 to-stone-900'} text-white py-10 px-6 transition-all duration-500`}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-medium">Products</span>
            {catId && categories.find(c => c._id === catId) && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-white font-medium">{categories.find(c => c._id === catId)?.name}</span>
              </>
            )}
          </nav>

          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                {isB2B ? 'Wholesale Catalog' : 'Shop Farm-Fresh Produce'}
              </h1>
              <p className="text-white/60 mt-1.5 text-sm">
                {isB2B
                  ? 'MOQ-based wholesale pricing · Verified suppliers · Volume discounts available'
                  : 'Certified organic · Direct from farm · Delivered to your door'}
              </p>
            </div>
            {/* Mode badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-bold ${
              isB2B ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isB2B ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              {isB2B ? 'B2B Wholesale Mode' : 'B2C Retail Mode'}
            </div>
          </div>

          {/* ── Search bar ── */}
          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              id="product-search"
              type="text"
              defaultValue={search}
              onChange={handleSearch}
              placeholder={isB2B ? 'Search wholesale products, SKUs, categories…' : 'Search for seeds, fertilizers, tools…'}
              className={`w-full pl-11 pr-10 py-3.5 bg-white/10 backdrop-blur border border-white/20 rounded-2xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 ${themeRing} focus:border-transparent transition-all`}
            />
            {search && (
              <button onClick={() => setParam('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">

        {/* ══ SIDEBAR ══ */}
        <aside className="w-60 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-6">

            {/* Categories */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <CategorySidebar
                categories={categories}
                activeCategoryId={catId}
                onSelect={id => setParam('category', id)}
                isB2B={isB2B}
                loading={catLoading}
              />
            </div>

            {/* Filters panel */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3">Filters</p>

              {/* Featured toggle */}
              <button
                onClick={() => setParam('featured', featured ? '' : 'true')}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-stone-600 hover:bg-stone-50"
              >
                {featured
                  ? <CheckSquare className={`h-4 w-4 ${themeText}`} />
                  : <Square className="h-4 w-4 text-stone-400" />}
                Featured Only
              </button>

              {/* B2B extras */}
              {isB2B && (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">B2B Filters</p>
                  
                  {/* Bulk Available */}
                  <button
                    onClick={() => setParam('bulkAvailable', bulkAvailable ? '' : 'true')}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-stone-600 hover:bg-amber-50 rounded-lg text-left"
                  >
                    {bulkAvailable
                      ? <CheckSquare className={`h-4 w-4 ${themeText}`} />
                      : <Square className="h-4 w-4 text-stone-400" />}
                    <span>Bulk Pricing</span>
                  </button>

                  {/* MOQ < 100 units */}
                  <button
                    onClick={() => setParam('maxMOQ', maxMOQ ? '' : '100')}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-stone-600 hover:bg-amber-50 rounded-lg text-left"
                  >
                    {maxMOQ === '100'
                      ? <CheckSquare className={`h-4 w-4 ${themeText}`} />
                      : <Square className="h-4 w-4 text-stone-400" />}
                    <span>MOQ &lt; 100 units</span>
                  </button>

                  {/* Verified Supplier */}
                  <button
                    onClick={() => setParam('verifiedSupplier', verifiedSupplier ? '' : 'true')}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-stone-600 hover:bg-amber-50 rounded-lg text-left"
                  >
                    {verifiedSupplier
                      ? <CheckSquare className={`h-4 w-4 ${themeText}`} />
                      : <Square className="h-4 w-4 text-stone-400" />}
                    <span>Verified Supplier</span>
                  </button>
                </div>
              )}

              {/* Price range */}
              <div className="mt-3 pt-3 border-t border-stone-100">
                <p className="text-xs font-bold text-stone-500 mb-2">Price Range</p>
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Min ₹"
                    type="number"
                    value={minInput}
                    onChange={handleMinPriceChange}
                    className={`w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 ${themeRing}`}
                  />
                  <span className="text-stone-400 text-xs">–</span>
                  <input
                    placeholder="Max ₹"
                    type="number"
                    value={maxInput}
                    onChange={handleMaxPriceChange}
                    className={`w-full px-2.5 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 ${themeRing}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ══ PRODUCT LISTING ══ */}
        <div className="flex-1 min-w-0">

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <p className="text-sm text-stone-500 font-medium">
              {loading
                ? 'Loading products…'
                : <><span className="font-bold text-stone-800">{pagination.total}</span> products found</>}
              {search && <> for <span className="font-semibold text-stone-700">"{search}"</span></>}
            </p>

            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border-2 border-stone-200 text-stone-600 hover:border-stone-300"
              >
                <Filter className="h-4 w-4" />Filters
              </button>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  id="sort-button"
                  onClick={() => setSortOpen(o => !o)}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border-2 border-stone-200 text-stone-600 hover:border-stone-300 bg-white"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {sortLabel}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl border border-stone-200 shadow-xl py-1.5 z-50">
                    {SORT_OPTIONS.map(o => (
                      <button key={o.value} onClick={() => { setParam('sort', o.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                          sort === o.value
                            ? `${themeText} font-bold`
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >{o.label}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* View toggle */}
              <div className="flex rounded-xl border-2 border-stone-200 overflow-hidden">
                {[['grid', <LayoutGrid className="h-4 w-4" />], ['list', <List className="h-4 w-4" />]].map(([mode, icon]) => (
                  <button key={mode} id={`view-${mode}`} onClick={() => setViewMode(mode)}
                    className={`px-3 py-2 flex items-center transition-colors ${
                      viewMode === mode
                        ? `${isB2B ? 'bg-amber-600' : 'bg-emerald-600'} text-white`
                        : 'text-stone-400 hover:bg-stone-50'
                    }`}
                  >{icon}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Active filter chips ── */}
          {(search || catId || featured || minPrice || maxPrice || bulkAvailable || maxMOQ || verifiedSupplier) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 text-stone-700 text-xs font-semibold rounded-full">
                  Search: "{search}"
                  <button onClick={() => setParam('search', '')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {catId && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${isB2B ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {categories.find(c => c._id === catId)?.name || 'Category'}
                  <button onClick={() => setParam('category', '')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                  Featured
                  <button onClick={() => setParam('featured', '')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {minPrice && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${isB2B ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  Min: ₹{minPrice}
                  <button onClick={() => setParam('minPrice', '')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {maxPrice && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${isB2B ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  Max: ₹{maxPrice}
                  <button onClick={() => setParam('maxPrice', '')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {bulkAvailable && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                  Bulk Sourcing
                  <button onClick={() => setParam('bulkAvailable', '')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {maxMOQ && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                  MOQ &le; {maxMOQ}
                  <button onClick={() => setParam('maxMOQ', '')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {verifiedSupplier && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                  Verified Supplier
                  <button onClick={() => setParam('verifiedSupplier', '')}><X className="h-3 w-3" /></button>
                </span>
              )}
              <button onClick={() => setSearchParams({})} className="text-xs text-stone-400 hover:text-red-500 font-medium px-2">
                Clear all
              </button>
            </div>
          )}

          {/* ── Error state ── */}
          {error && !loading && (
            <div className="flex flex-col items-center py-20 gap-4 text-stone-500">
              <Package className="h-12 w-12 text-stone-300" />
              <p className="font-semibold">{error}</p>
              <button onClick={() => window.location.reload()} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white ${themeBtn} shadow-md transition-all`}>
                <RefreshCw className="h-4 w-4" /> Retry
              </button>
            </div>
          )}

          {/* ── Loading skeleton ── */}
          {loading && !error && (
            viewMode === 'grid'
              ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              : <div className="space-y-4">
                  {Array(6).fill(0).map((_, i) => <SkeletonList key={i} />)}
                </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center py-24 gap-5 text-stone-400">
              <Package className="h-16 w-16 text-stone-300" />
              <div className="text-center">
                <p className="font-bold text-stone-600 text-lg">No products found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
              <button onClick={() => setSearchParams({})} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white ${themeBtn} shadow-md`}>
                <X className="h-4 w-4" /> Clear Filters
              </button>
            </div>
          )}

          {/* ── Product grid / list ── */}
          {!loading && !error && products.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map(p => (
                    <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} viewMode="grid" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map(p => (
                    <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} viewMode="list" />
                  ))}
                </div>
              )}

              {/* ── Pagination ── */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    disabled={page <= 1}
                    onClick={() => setParam('page', page - 1)}
                    className="px-4 py-2 rounded-xl border-2 border-stone-200 text-sm font-semibold text-stone-600 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >← Prev</button>

                  {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                    const pg = i + 1;
                    return (
                      <button key={pg} onClick={() => setParam('page', pg)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          pg === page
                            ? `text-white ${isB2B ? 'bg-amber-600' : 'bg-emerald-600'} shadow-md`
                            : 'text-stone-500 hover:bg-stone-100'
                        }`}
                      >{pg}</button>
                    );
                  })}

                  <button
                    disabled={page >= pagination.pages}
                    onClick={() => setParam('page', page + 1)}
                    className="px-4 py-2 rounded-xl border-2 border-stone-200 text-sm font-semibold text-stone-600 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══ MOBILE SIDEBAR DRAWER ══ */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <p className="font-bold text-stone-800">Filters</p>
              <button onClick={() => setSidebarOpen(false)}><X className="h-5 w-5 text-stone-500" /></button>
            </div>
            <div className="p-5 space-y-6">
              <CategorySidebar
                categories={categories}
                activeCategoryId={catId}
                onSelect={id => { setParam('category', id); setSidebarOpen(false); }}
                isB2B={isB2B}
                loading={catLoading}
              />
            </div>
          </div>
        </>
      )}

      {/* Close sort dropdown on outside click */}
      {sortOpen && <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />}
    </div>
  );
}
