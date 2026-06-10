import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MarketProvider } from './context/MarketContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

// Full-page standalone (has its own nav + footer)
import AgriHomepage from './pages/AgriHomepage.jsx';

// Shell-wrapped pages (share Navbar + footer)
import Navbar        from './components/Layout/Navbar.jsx';
import Products      from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Auth          from './pages/Auth.jsx';
import Cart          from './pages/Cart.jsx';
import Checkout      from './pages/Checkout.jsx';
import RFQ           from './pages/RFQ.jsx';
import AdminEnquiries from './pages/AdminEnquiries.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminCMS from './pages/admin/AdminCMS.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';

/* ── Shell wrapper (shared Navbar + footer) ── */
function AppShell({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="bg-stone-900 border-t border-stone-800 py-5 text-center text-xs text-stone-500">
        &copy; {new Date().getFullYear()} OpenAgri / KisanMart &middot; Built for Indian Farmers
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

function App() {
  return (
    <MarketProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Shell-wrapped homepage ── */}
            <Route path="/" element={
              <AppShell><AgriHomepage /></AppShell>
            } />

            {/* ── Products listing ── */}
            <Route path="/products" element={
              <AppShell><Products /></AppShell>
            } />
            {/* ── Legacy /catalog alias ── */}
            <Route path="/catalog" element={<Navigate to="/products" replace />} />

            {/* ── Product Detail ── */}
            <Route path="/products/:id" element={
              <AppShell><ProductDetail /></AppShell>
            } />

            {/* ── Auth ── */}
            <Route path="/auth" element={
              <AppShell><Auth /></AppShell>
            } />

            {/* ── Cart ── */}
            <Route path="/cart" element={
              <AppShell><Cart /></AppShell>
            } />

            {/* ── Checkout ── */}
            <Route path="/checkout" element={
              <AppShell><Checkout /></AppShell>
            } />

            {/* ── RFQ (B2B Wholesale Quotes) ── */}
            <Route path="/rfq" element={
              <AppShell><RFQ /></AppShell>
            } />

            {/* ── Admin Enquiries ── */}
            <Route path="/admin/enquiries" element={<AdminEnquiries />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/cms" element={<AdminCMS />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </MarketProvider>
  );
}

export default App;
