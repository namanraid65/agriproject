import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { MarketProvider, MarketContext } from './context/MarketContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

// Full-page standalone (has its own nav + footer)
import AgriHomepage from './pages/AgriHomepage.jsx';

// Shell-wrapped pages (share Navbar + footer)
import Navbar        from './components/Layout/Navbar.jsx';
import Products      from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Auth          from './pages/Auth.jsx';
import Cart          from './pages/Cart.jsx';
import Wishlist      from './pages/Wishlist.jsx';
import MyOrders      from './pages/MyOrders.jsx';
import Checkout      from './pages/Checkout.jsx';
import RFQ           from './pages/RFQ.jsx';
import AdminEnquiries from './pages/AdminEnquiries.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminCMS from './pages/admin/AdminCMS.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminBanners from './pages/admin/AdminBanners.jsx';
import AdminTestimonials from './pages/admin/AdminTestimonials.jsx';
import CMSPage from './pages/CMSPage.jsx';

/* ── Shell wrapper (shared Navbar + footer) ── */
function AppShell({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="bg-stone-900 border-t border-stone-800 py-10 text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm">OpenAgri Marketplace</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Bridges Indian farmers, wholesale distributors, and retail consumers with an authenticated, zero-middleman agricultural supply marketplace.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm">Corporate Info</h3>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions (FAQ)</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-white font-bold text-sm">Policies</h3>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Return &amp; Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-stone-850 text-center text-[11px] text-stone-500">
          &copy; {new Date().getFullYear()} OpenAgri Marketplace &middot; Built for Indian Farmers &middot; All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

function Stub({ title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-stone-500 gap-3">
      <svg className="h-16 w-16 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V10"/><path d="M5 10l7-8 7 8"/><path d="M5 15l7 3 7-3"/><path d="M5 20l7 2 7-2"/>
      </svg>
      <h2 className="text-2xl font-bold text-stone-700">{title}</h2>
      <p className="text-sm max-w-xs text-center">{desc}</p>
    </div>
  );
}

// ── Gated route for normal user/catalog pages ──
function UserRoute({ children }) {
  const { user } = useContext(MarketContext);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const role = user.role?.toUpperCase();
  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

// ── Gated route for admin pages ──
function AdminRoute({ children }) {
  const { user } = useContext(MarketContext);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const role = user.role?.toUpperCase();
  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <MarketProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Shell-wrapped homepage ── */}
            <Route path="/" element={
              <UserRoute><AppShell><AgriHomepage /></AppShell></UserRoute>
            } />

            {/* ── Products listing ── */}
            <Route path="/products" element={
              <UserRoute><AppShell><Products /></AppShell></UserRoute>
            } />
            {/* ── Legacy /catalog alias ── */}
            <Route path="/catalog" element={<Navigate to="/products" replace />} />

            {/* ── Product Detail ── */}
            <Route path="/products/:id" element={
              <UserRoute><AppShell><ProductDetail /></AppShell></UserRoute>
            } />

            {/* ── Auth ── */}
            <Route path="/auth" element={
              <Auth />
            } />

            {/* ── Cart ── */}
            <Route path="/cart" element={
              <UserRoute><AppShell><Cart /></AppShell></UserRoute>
            } />

            {/* ── Wishlist ── */}
            <Route path="/wishlist" element={
              <UserRoute><AppShell><Wishlist /></AppShell></UserRoute>
            } />

            {/* ── Orders History ── */}
            <Route path="/orders" element={
              <UserRoute><AppShell><MyOrders /></AppShell></UserRoute>
            } />

            {/* ── Checkout ── */}
            <Route path="/checkout" element={
              <UserRoute><AppShell><Checkout /></AppShell></UserRoute>
            } />

            {/* ── RFQ (B2B Wholesale Quotes) ── */}
            <Route path="/rfq" element={
              <UserRoute><AppShell><RFQ /></AppShell></UserRoute>
            } />

            {/* ── Admin Enquiries ── */}
            <Route path="/admin/enquiries" element={<AdminRoute><AdminEnquiries /></AdminRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/cms" element={<AdminRoute><AdminCMS /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
            <Route path="/admin/testimonials" element={<AdminRoute><AdminTestimonials /></AdminRoute>} />

            {/* ── Public CMS Pages ── */}
            <Route path="/about" element={<UserRoute><AppShell><CMSPage pageType="about" /></AppShell></UserRoute>} />
            <Route path="/contact" element={<UserRoute><AppShell><CMSPage pageType="contact" /></AppShell></UserRoute>} />
            <Route path="/privacy" element={<UserRoute><AppShell><CMSPage pageType="privacy" /></AppShell></UserRoute>} />
            <Route path="/terms" element={<UserRoute><AppShell><CMSPage pageType="terms" /></AppShell></UserRoute>} />
            <Route path="/shipping" element={<UserRoute><AppShell><CMSPage pageType="shipping" /></AppShell></UserRoute>} />
            <Route path="/returns" element={<UserRoute><AppShell><CMSPage pageType="returns" /></AppShell></UserRoute>} />
            <Route path="/faq" element={<UserRoute><AppShell><CMSPage pageType="faq" /></AppShell></UserRoute>} />

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </MarketProvider>
  );
}

export default App;
