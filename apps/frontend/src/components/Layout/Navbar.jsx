import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMarket } from '../../hooks/useMarket.js';
import { useCart } from '../../hooks/useCart.js';
import {
  Sprout, ShoppingCart, User as UserIcon, LogOut,
  Tractor, Leaf, Menu, X as XIcon, ChevronDown, Heart, Package
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'Products', to: '/products' },
];

const B2B_ONLY_LINKS = [
  { label: 'Wholesale Quotes', to: '/rfq' },
];

// ── Beautiful Toggle Switch ──────────────────────────────
const MarketToggle = ({ isB2B, onToggle }) => (
  <button
    id="market-mode-toggle"
    onClick={onToggle}
    title={`Switch to ${isB2B ? 'B2C Retail' : 'B2B Wholesale'} mode`}
    className={`
      relative flex items-center gap-0 rounded-full border-2 p-0.5
      transition-all duration-500 cursor-pointer select-none
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      ${isB2B
        ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100 focus-visible:ring-amber-400'
        : 'border-emerald-400 bg-gradient-to-r from-emerald-50 to-emerald-100 focus-visible:ring-emerald-400'
      }
    `}
    aria-pressed={isB2B}
    aria-label="Toggle between B2B Wholesale and B2C Retail mode"
  >
    {/* Left label: B2C */}
    <span className={`
      flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide
      transition-all duration-300 z-10
      ${!isB2B
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
        : 'text-stone-400'
      }
    `}>
      <Leaf className="h-3 w-3" />
      <span className="hidden sm:inline">Retail</span>
    </span>

    {/* Right label: B2B */}
    <span className={`
      flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide
      transition-all duration-300 z-10
      ${isB2B
        ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
        : 'text-stone-400'
      }
    `}>
      <Tractor className="h-3 w-3" />
      <span className="hidden sm:inline">Wholesale</span>
    </span>

    {/* Mode indicator badge */}
    <span className={`
      hidden sm:block absolute -top-3 left-1/2 -translate-x-1/2
      px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest
      transition-all duration-300
      ${isB2B
        ? 'bg-amber-500 text-white'
        : 'bg-emerald-500 text-white'
      }
    `}>
      {isB2B ? 'B2B' : 'B2C'}
    </span>
  </button>
);

// ── Main Navbar ──────────────────────────────────────────
export const Navbar = () => {
  const { marketMode, toggleMarketMode, user, logout, styles, isB2B, settings } = useMarket();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = [...NAV_LINKS, ...(isB2B ? B2B_ONLY_LINKS : [])];

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'shadow-md border-stone-200/80' : 'shadow-none border-stone-100/40'
      } bg-white/95 backdrop-blur-md border-b mode-transition`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-6">

            {/* ── Brand ───────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className={`p-1.5 rounded-xl transition-colors duration-300 ${isB2B ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                <Sprout className={`h-5 w-5 transition-colors duration-300 ${styles.textHighlight}`} />
              </div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-stone-900">
                {settings?.siteName || (
                  <>
                    Open<span className={`${styles.textHighlight} transition-colors duration-300`}>Agri</span>
                  </>
                )}
              </span>
            </Link>

            {/* ── Desktop Nav Links ────────────────────── */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(to)
                      ? `${styles.textHighlight} ${isB2B ? 'bg-amber-50' : 'bg-emerald-50'}`
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* ── Desktop Controls ─────────────────────── */}
            <div className="hidden md:flex items-center gap-4">
              {/* B2B / B2C Toggle */}
              <MarketToggle isB2B={isB2B} onToggle={toggleMarketMode} />

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                id="wishlist-button"
                className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
                aria-label="Wishlist"
                title={isB2B ? "Sourcing Watchlist" : "Wishlist"}
              >
                <Heart className={`h-5 w-5 ${isB2B ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'}`} />
              </Link>

              {/* Cart */}
              {!isB2B && (
                <Link
                  to="/cart"
                  id="cart-button"
                  className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
                  aria-label="Shopping cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white bg-emerald-600 transition-colors duration-300">
                    {cartCount}
                  </span>
                </Link>
              )}

              {/* Auth / User */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${isB2B ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-bold text-stone-800 leading-none">{user.name}</p>
                      <p className={`text-[10px] font-semibold uppercase tracking-wide leading-none mt-0.5 ${styles.textHighlight}`}>
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/orders"
                    className="p-2 rounded-lg text-stone-550 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
                    title="My Orders"
                  >
                    <Package className="h-4.5 w-4.5" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    id="logout-button"
                    className="p-2 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  id="login-button"
                  className={`btn text-sm ${isB2B ? 'btn-primary-amber' : 'btn-primary-green'}`}
                >
                  <UserIcon className="h-4 w-4" />
                  Login
                </Link>
              )}
            </div>

            {/* ── Mobile Controls ──────────────────────── */}
            <div className="flex md:hidden items-center gap-3">
              <MarketToggle isB2B={isB2B} onToggle={toggleMarketMode} />
              <button
                id="mobile-menu-button"
                onClick={() => setMobileOpen((o) => !o)}
                className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                aria-label="Open menu"
              >
                {mobileOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* ── Mode Context Banner ──────────────────────────── */}
        <div className={`
          border-t text-center py-1.5 text-[11px] font-semibold tracking-wide uppercase
          transition-all duration-500 mode-transition
          ${isB2B
            ? 'bg-amber-600 text-amber-50 border-amber-700'
            : 'bg-emerald-700 text-emerald-50 border-emerald-800'
          }
        `}>
          {isB2B
            ? '🏭  You are browsing in B2B Wholesale mode — Volume pricing & MOQ quotes available'
            : '🌿  You are browsing in B2C Retail mode — Premium farm inputs, delivered to your door'
          }
        </div>
      </nav>

      {/* ── Mobile Dropdown Menu ─────────────────────────── */}
      <div className={`
        md:hidden fixed inset-x-0 top-[calc(4rem+1.75rem)] z-40
        bg-white border-b border-stone-200 shadow-xl
        transition-all duration-300 overflow-hidden
        ${mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-4 py-4 space-y-1">
          {links.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                isActive(to)
                  ? `${styles.textHighlight} ${isB2B ? 'bg-amber-50' : 'bg-emerald-50'}`
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {label}
            </Link>
          ))}

          <div className="pt-3 border-t border-stone-100 space-y-2">
            <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 hover:bg-stone-50 font-semibold text-sm">
              <Heart className={`h-5 w-5 ${isB2B ? 'text-amber-600' : 'text-emerald-600'}`} />
              {isB2B ? 'Sourcing Watchlist' : 'My Wishlist'}
            </Link>
            {!isB2B && (
              <Link to="/cart" className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 hover:bg-stone-50 font-semibold text-sm">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cartCount})
              </Link>
            )}
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white ${isB2B ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800">{user.name}</p>
                    <p className={`text-xs font-medium ${styles.textHighlight}`}>{user.role}</p>
                  </div>
                </div>
                <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 hover:bg-stone-50 font-semibold text-sm">
                  <Package className="h-5 w-5" />
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-semibold text-sm"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm ${isB2B ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                <UserIcon className="h-5 w-5" />
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
