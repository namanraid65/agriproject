import React from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../hooks/useMarket.js';
import { useCart } from '../hooks/useCart.js';
import { QuantityInput } from './QuantityInput.jsx';
import {
  ShoppingCart, FileText, Star, Package,
  Tag, Award, Truck, CheckCircle2, AlertTriangle
} from 'lucide-react';

/* ─── Helper for rendering partially filled SVG star ─────── */
function StarIcon({ fillPercent = 100, size = 12 }) {
  const id = React.useId();
  const color = '#c8860a'; // gold/amber color
  const emptyColor = '#f4f4f5'; // very light grey for inner empty area

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '1px' }}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${fillPercent}%`} stopColor={color} />
          <stop offset={`${fillPercent}%`} stopColor={emptyColor} />
        </linearGradient>
      </defs>
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}

/* ─── Shared star rating ─────────────────────────────────── */
export function StarRating({ rating = 0, count, size = 'sm' }) {
  const px = size === 'sm' ? 12 : 15;
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    let fillPercent = 0;
    if (rating >= i) {
      fillPercent = 100;
    } else if (rating > i - 1) {
      fillPercent = (rating - (i - 1)) * 100;
    }
    stars.push(<StarIcon key={i} fillPercent={fillPercent} size={px} />);
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5">
        {stars}
      </span>
      {count !== undefined && (
        <span className="text-stone-400" style={{ fontSize: px - 1 }}>({count.toLocaleString()})</span>
      )}
    </span>
  );
}

/* ─── Stock pill ─────────────────────────────────────────── */
function StockBadge({ stock }) {
  if (stock === 0)
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full"><AlertTriangle className="h-3 w-3" />Out of Stock</span>;
  if (stock <= 20)
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><Package className="h-3 w-3" />Only {stock} left</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-3 w-3" />In Stock</span>;
}

/* ─── Mode badge ─────────────────────────────────────────── */
function ModeBadge({ isB2B }) {
  return isB2B
    ? <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200"><Truck className="h-3 w-3" />Wholesale</span>
    : <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200"><ShoppingCart className="h-3 w-3" />Retail</span>;
}

/* ─── ProductCard (list view variant) ───────────────────── */
function ProductCardList({ product, isB2B, onAddToCart }) {
  const { cart, updateQty, remove } = useCart();
  const [added, setAdded] = React.useState(false);
  
  const cartItem = cart?.find(item => item.product._id === product._id);
  const cartQty = cartItem ? cartItem.quantity : 0;

  const img = product.primaryImage || product.images?.[0];
  const catName = typeof product.category === 'object' ? product.category?.name : product.category;

  const handleAddToCart = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex gap-5 bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      {/* Image */}
      <Link to={`/products/${product._id}`} className="flex-shrink-0 w-44 relative overflow-hidden bg-stone-50">
        {img?.url ? (
          <img src={img.url} alt={img.altText || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.currentTarget.src = `https://placehold.co/400x300/e7f3e0/2d6a4f?text=${encodeURIComponent(product.name.slice(0,12))}`; }}
          />
        ) : (
          <div className={`w-full h-full min-h-[140px] flex items-center justify-center text-5xl ${isB2B ? 'bg-amber-50' : 'bg-emerald-50'}`}>🌾</div>
        )}
        {product.featured && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[9px] font-black text-yellow-800 bg-yellow-300 px-1.5 py-0.5 rounded uppercase tracking-wide">
            <Award className="h-2.5 w-2.5" />Featured
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex-1 py-4 pr-5 flex flex-col justify-between">
        <div>
          {catName && <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">{catName}</p>}
          <Link to={`/products/${product._id}`} className="hover:underline">
            <h3 className="font-bold text-stone-800 text-lg leading-snug">{product.name}</h3>
          </Link>
          <p className="text-sm text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            <StarRating rating={4.8} count={213} />
            <StockBadge stock={product.stock} />
            <ModeBadge isB2B={isB2B} />
          </div>
        </div>

        {/* Price + CTA row */}
        <div className="flex items-end justify-between mt-4 pt-3 border-t border-stone-100">
          {isB2B ? (
            <div>
              <span className="text-xs text-stone-400 block">Wholesale (MOQ-based)</span>
              <span className="text-xl font-black text-amber-700">₹{product.retailPrice?.toLocaleString()}</span>
              <span className="text-xs text-stone-400">  /unit — volume discounts apply</span>
            </div>
          ) : (
            <div>
              <span className="text-xs text-stone-400 block">Retail Price</span>
              <span className="text-2xl font-black text-emerald-700">₹{product.retailPrice?.toLocaleString()}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Link to={`/products/${product._id}`}
              className="text-sm font-semibold px-4 py-2 rounded-xl border-2 border-stone-200 text-stone-600 hover:border-stone-400 transition-colors">
              View Details
            </Link>
            {isB2B ? (
              <Link to={`/products/${product._id}`}
                className={`text-sm font-bold px-5 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                  product.stock === 0 ? 'bg-stone-100 text-stone-400 cursor-not-allowed pointer-events-none' :
                          'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-200 hover:-translate-y-px'
                }`}
              >
                <FileText className="h-4 w-4" />
                {product.stock === 0 ? 'Unavailable' : 'Request Quote'}
              </Link>
            ) : cartQty > 0 ? (
              <div className="flex items-center border-2 border-emerald-600 rounded-xl overflow-hidden bg-white h-9 shadow-sm">
                <button
                  onClick={() => {
                    if (cartQty === 1) {
                      remove(product._id);
                    } else {
                      updateQty(product._id, cartQty - 1);
                    }
                  }}
                  className="px-3.5 py-1 text-emerald-600 hover:bg-emerald-50 font-black text-base transition-colors flex items-center justify-center h-full w-10 border-r border-emerald-100 select-none cursor-pointer"
                >
                  -
                </button>
                <QuantityInput
                  value={cartQty}
                  max={product.stock}
                  onChange={(val) => {
                    updateQty(product._id, val);
                  }}
                  className="w-12 text-center text-xs font-bold text-stone-800 bg-transparent outline-none"
                />
                <button
                  onClick={() => {
                    if (cartQty >= product.stock) {
                      alert(`Only ${product.stock} units available in stock.`);
                    } else {
                      updateQty(product._id, cartQty + 1);
                    }
                  }}
                  className="px-3.5 py-1 text-emerald-600 hover:bg-emerald-50 font-black text-base transition-colors flex items-center justify-center h-full w-10 border-l border-emerald-100 select-none cursor-pointer"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || added}
                className={`text-sm font-bold px-5 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  product.stock === 0 ? 'bg-stone-100 text-stone-400' :
                  added ? 'bg-emerald-700 text-white shadow-md' :
                          'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 hover:-translate-y-px'
                }`}
              >
                {added ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ PRIMARY EXPORT: ProductCard (grid variant) ════════════ */
export function ProductCard({ product, onAddToCart, viewMode = 'grid' }) {
  const { isB2B } = useMarket();
  const { cart, updateQty, remove } = useCart();
  const [added, setAdded] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("agri-wishlist") || "[]");
      setIsWishlisted(stored.includes(product._id?.toString()));
    } catch (e) {
      console.error(e);
    }
  }, [product._id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = JSON.parse(localStorage.getItem("agri-wishlist") || "[]");
      let updated;
      if (stored.includes(product._id?.toString())) {
        updated = stored.filter(id => id !== product._id?.toString());
        setIsWishlisted(false);
      } else {
        updated = [...stored, product._id?.toString()];
        setIsWishlisted(true);
      }
      localStorage.setItem("agri-wishlist", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  if (viewMode === 'list') {
    return <ProductCardList product={product} isB2B={isB2B} onAddToCart={onAddToCart} />;
  }

  const cartItem = cart?.find(item => item.product._id === product._id);
  const cartQty = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const img    = product.primaryImage || product.images?.[0];
  const catName = typeof product.category === 'object' ? product.category?.name : product.category;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden group hover:-translate-y-1.5 hover:shadow-xl hover:shadow-stone-200/80 transition-all duration-250">
      {/* ── Image ── */}
      <Link to={`/products/${product._id}`} className="relative block overflow-hidden h-52 flex-shrink-0 bg-stone-50">
        {img?.url ? (
          <img src={img.url} alt={img.altText || product.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            onError={e => { e.currentTarget.src = `https://placehold.co/400x300/e7f3e0/2d6a4f?text=${encodeURIComponent(product.name.slice(0,12))}`; }}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-6xl ${isB2B ? 'bg-amber-50' : 'bg-emerald-50'}`}>🌾</div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {catName && (
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isB2B ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
              {catName}
            </span>
          )}
          {product.featured && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-yellow-900 bg-yellow-300 px-1.5 py-0.5 rounded uppercase">
              <Star className="h-2.5 w-2.5 fill-current" />Featured
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button 
          onClick={toggleWishlist}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-stone-400 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:scale-110 shadow-sm"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <span style={{ color: isWishlisted ? '#e76f51' : '#a8a8a8', fontSize: 16 }}>
            {isWishlisted ? '❤️' : '🤍'}
          </span>
        </button>

        {/* OOS overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
            <span className="bg-white text-stone-700 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex-1">
          <h3 className="font-bold text-stone-800 text-base leading-snug mb-1 line-clamp-2 group-hover:text-stone-900">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-2.5">{product.description}</p>

          <div className="flex items-center gap-2 flex-wrap mb-2">
            <StarRating rating={4.8} count={213} />
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StockBadge stock={product.stock} />
          </div>
        </div>

        {/* ── Mode-aware Pricing + CTA ── */}
        <div className="mt-4 pt-3.5 border-t border-stone-100 space-y-3">
          {isB2B ? (
            /* B2B Pricing Block */
            <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-3 space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="h-3 w-3" />Wholesale Price
                </span>
                <span className="text-lg font-black text-amber-700">₹{product.retailPrice?.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-amber-700/80 font-medium">Volume tiers &amp; MOQ available — request quote for bulk pricing</p>
            </div>
          ) : (
            /* B2C Pricing Block */
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-700 tracking-tight">₹{product.retailPrice?.toLocaleString()}</span>
              <span className="text-xs text-stone-400 font-medium">/ unit</span>
            </div>
          )}

          {isB2B ? (
            <Link
              to={`/products/${product._id}`}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 text-center ${
                product.stock === 0
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed pointer-events-none'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-200 hover:shadow-lg hover:-translate-y-px'
              }`}
            >
              <FileText className="h-4 w-4" />
              {product.stock === 0 ? 'Out of Stock' : 'Request Quote'}
            </Link>
          ) : cartQty > 0 ? (
            <div className="w-full flex items-center justify-between border-2 border-emerald-600 rounded-xl overflow-hidden bg-white h-[38px] shadow-sm">
              <button
                onClick={() => {
                  if (cartQty === 1) {
                    remove(product._id);
                  } else {
                    updateQty(product._id, cartQty - 1);
                  }
                }}
                className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 font-black text-base transition-colors flex items-center justify-center h-full w-12 border-r border-emerald-100 select-none cursor-pointer"
              >
                -
              </button>
              <QuantityInput
                value={cartQty}
                max={product.stock}
                onChange={(val) => {
                  updateQty(product._id, val);
                }}
                className="w-12 text-center text-xs font-bold text-stone-850 bg-transparent outline-none flex-1"
              />
              <button
                onClick={() => {
                  if (cartQty >= product.stock) {
                    alert(`Only ${product.stock} units available in stock.`);
                  } else {
                    updateQty(product._id, cartQty + 1);
                  }
                }}
                className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 font-black text-base transition-colors flex items-center justify-center h-full w-12 border-l border-emerald-100 select-none cursor-pointer"
              >
                +
              </button>
            </div>
          ) : (
            <button
              id={`add-to-cart-${product._id}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0 || added}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                product.stock === 0 ? 'bg-stone-100 text-stone-400' :
                added ? 'bg-emerald-700 text-white shadow-md' :
                'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-200 hover:shadow-lg hover:-translate-y-px'
              }`}
            >
              {added ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
