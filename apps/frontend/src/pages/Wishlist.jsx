import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../hooks/useMarket.js';
import { useCart } from '../hooks/useCart.js';
import { ProductCard } from '../components/ProductCard.jsx';
import api from '../services/api.js';
import { Heart, ArrowLeft, Package, ChevronRight, Loader2 } from 'lucide-react';

export default function Wishlist() {
  const { isB2B, marketMode } = useMarket();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);

  // Load wishlist IDs from localStorage
  const loadWishlist = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("agri-wishlist") || "[]");
      setWishlistIds(stored);
      return stored;
    } catch (e) {
      console.error("Wishlist read failed:", e);
      return [];
    }
  };

  useEffect(() => {
    const storedIds = loadWishlist();
    if (storedIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch products
    api.get(`/products?limit=100&marketMode=${marketMode}`)
      .then(res => {
        const allProds = res.data?.data?.products || [];
        // Filter only products present in wishlist
        const filtered = allProds.filter(p => storedIds.includes(p._id?.toString()));
        setProducts(filtered);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load wishlist items.");
      })
      .finally(() => setLoading(false));
  }, [marketMode]);

  // Listener to handle product card wishlist removal updates on the grid
  const handleWishlistUpdate = () => {
    const storedIds = loadWishlist();
    setProducts(prev => prev.filter(p => storedIds.includes(p._id?.toString())));
  };

  const themeBtn = isB2B ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
  const themeGrad = isB2B ? 'from-amber-900 to-stone-900' : 'from-emerald-900 to-stone-900';
  const themeBadge = isB2B ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';

  return (
    <div className="min-h-screen bg-stone-50" onClick={handleWishlistUpdate}>
      {/* ── Page Header ── */}
      <div className={`bg-gradient-to-r ${themeGrad} text-white py-10 px-6 transition-all duration-500`}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-medium">My Wishlist</span>
          </nav>

          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-2.5">
                <Heart className="h-8 w-8 fill-current text-red-500 animate-pulse" />
                {isB2B ? 'Sourcing Watchlist' : 'My Saved Products'}
              </h1>
              <p className="text-white/60 mt-1.5 text-sm">
                {isB2B
                  ? 'Keep track of verified FPOs and agricultural supplier inputs for bulk sourcing requests'
                  : 'Your bookmarked organic foods, seeds, and farm tools saved for later'}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-bold ${themeBadge}`}>
              <span className={`w-2 h-2 rounded-full ${isB2B ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              {isB2B ? 'B2B Wholesale Mode' : 'B2C Retail Mode'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Back Button */}
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-850 font-semibold mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Browse Catalog
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-stone-500">
            <Loader2 className="h-10 w-10 animate-spin text-stone-400" />
            <p className="text-sm font-semibold">Retrieving your saved items...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-stone-500">
            <Package className="h-12 w-12 text-stone-300" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-stone-400">
            <div className="text-5xl">🤍</div>
            <div className="text-center">
              <h2 className="font-bold text-stone-600 text-xl">{isB2B ? 'Your watchlist is empty' : 'Your wishlist is empty'}</h2>
              <p className="text-sm mt-1 max-w-sm">Tap the heart icon on any product card in the store to save it here.</p>
            </div>
            <Link to="/products" className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white ${themeBtn} shadow-md`}>
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <div key={p._id} onClick={(e) => {
                // If wishlist button inside card is clicked, update layout grid
                if (e.target.closest('button')) {
                  setTimeout(handleWishlistUpdate, 150);
                }
              }}>
                <ProductCard product={p} onAddToCart={(prod) => addToCart(prod, 1)} viewMode="grid" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
