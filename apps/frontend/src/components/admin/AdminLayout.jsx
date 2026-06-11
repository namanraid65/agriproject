import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMarket } from "../../hooks/useMarket.js";
import api from "../../services/api.js";

/**
 * AdminLayout
 * Props:
 *   children        – page content
 *   navItems        – array of { label, icon (Tabler class), href, badge?, section? }
 *   brandName       – string, default "Verdant"
 *   user            – { name, role, initials }
 *   pageTitle       – string shown in header
 *   notifCount      – number, shows red dot when > 0
 *   onNewClick      – () => void  handler for "+ New" button
 *   onSearchSubmit  – (query: string) => void
 */

const DEFAULT_NAV = [
  { section: "Main" },
  { label: "Dashboard", icon: "ti-layout-dashboard", href: "/admin" },
  { label: "Orders",    icon: "ti-shopping-bag",       href: "/admin/orders" },
  { label: "Enquiries", icon: "ti-message",            href: "/admin/enquiries" },
  { section: "Manage Content" },
  { label: "Banners",     icon: "ti-image",            href: "/admin/banners" },
  { label: "Testimonials",icon: "ti-star",             href: "/admin/testimonials" },
  { label: "CMS Pages",   icon: "ti-file-text",        href: "/admin/cms" },
  { section: "Manage Store" },
  { label: "Products",    icon: "ti-tag",              href: "/admin/products" },
  { label: "Categories",  icon: "ti-category",         href: "/admin/categories" },
  { section: "System" },
  { label: "Settings",    icon: "ti-settings",         href: "/admin/settings" },
  { label: "Users/Admins",icon: "ti-users",            href: "/admin/users" }
];

export default function AdminLayout({
  children,
  navItems = DEFAULT_NAV,
  brandName = "Verdant",
  user = { name: "Arjun Kumar", role: "Admin", initials: "AK" },
  pageTitle = "Dashboard",
  notifCount = 1,
  onNewClick,
  onSearchSubmit,
}) {
  const location = useLocation();
  const activeHref = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const { logout } = useMarket();
  const navigate = useNavigate();

  // Notifications state
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  // Load and fetch notifications
  useEffect(() => {
    // 1. Initial load from localStorage
    const saved = localStorage.getItem("admin_notifications");
    if (saved) {
      try {
        setNotifs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved notifications:", e);
      }
    }

    // 2. Fetch fresh dynamic data from DB
    const fetchDynamic = async () => {
      try {
        const [enquiriesRes, ordersRes, productsRes] = await Promise.all([
          api.get('/enquiries').catch(() => ({ data: { data: { enquiries: [] } } })),
          api.get('/orders/admin/all').catch(() => ({ data: { data: { orders: [] } } })),
          api.get('/products?adminView=true&limit=100').catch(() => ({ data: { data: { products: [] } } }))
        ]);

        const enquiries = enquiriesRes.data?.data?.enquiries || [];
        const orders = ordersRes.data?.data?.orders || [];
        const products = productsRes.data?.data?.products || [];

        const dynamicNotifs = [];

        // Add pending enquiries
        enquiries.filter(e => e.status === 'pending').forEach(e => {
          dynamicNotifs.push({
            id: `enq-${e._id}`,
            text: `New RFQ Enquiry from ${e.companyName || e.buyerName || 'Client'} for ${e.product?.name || 'product'}`,
            time: new Date(e.createdAt).toLocaleDateString(),
            link: '/admin/enquiries',
            read: false
          });
        });

        // Add pending/processing orders
        orders.filter(o => o.status === 'pending' || o.status === 'processing').forEach(o => {
          const orderNum = o.orderNumber || o._id.slice(-6).toUpperCase();
          dynamicNotifs.push({
            id: `ord-${o._id}`,
            text: `Order #${orderNum} is ${o.status} (₹${o.totalAmount?.toLocaleString()})`,
            time: new Date(o.createdAt).toLocaleDateString(),
            link: '/admin/orders',
            read: false
          });
        });

        // Add low stock products (stock < 50)
        products.filter(p => p.stock < 50).forEach(p => {
          dynamicNotifs.push({
            id: `stock-${p._id}`,
            text: `Low stock alert: ${p.name} (${p.stock} units left)`,
            time: 'Stock Alert',
            link: '/admin/products',
            read: false
          });
        });

        // Load latest saved status to preserve read indicators
        const latestSaved = JSON.parse(localStorage.getItem("admin_notifications") || "[]");

        let merged;
        if (dynamicNotifs.length > 0) {
          merged = dynamicNotifs.map(dn => {
            const matched = latestSaved.find(sn => sn.id === dn.id);
            return matched ? { ...dn, read: matched.read } : dn;
          });
        } else {
          // If no dynamic alerts, use fallback mocks
          const fallbackMocks = [
            { id: 'mock-1', text: "New RFQ Quote Request for Alphonso Mangoes", time: "5 mins ago", link: "/admin/enquiries", read: false },
            { id: 'mock-2', text: "New Customer Registration: Rajesh Patil", time: "1 hour ago", link: "/admin/users", read: false },
            { id: 'mock-3', text: "Low stock alert: Nasik Onions (< 20kg)", time: "2 hours ago", link: "/admin/products", read: false }
          ];
          merged = fallbackMocks.map(mn => {
            const matched = latestSaved.find(sn => sn.id === mn.id);
            return matched ? { ...mn, read: matched.read } : mn;
          });
        }

        setNotifs(merged);
        localStorage.setItem("admin_notifications", JSON.stringify(merged));
      } catch (err) {
        console.error("Error loading dynamic notifications:", err);
      }
    };

    fetchDynamic();
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  const toggleRead = (id) => {
    setNotifs(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem("admin_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const markAllRead = () => {
    setNotifs(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem("admin_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearchSubmit?.(searchVal);
  };

  return (
    <div className="flex h-screen bg-stone-50 font-sans overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-52 flex flex-col bg-[#27500a] shrink-0
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#5a9e30] rounded-lg flex items-center justify-center">
              <i className="ti ti-leaf text-white text-sm" aria-hidden />
            </div>
            <span className="text-white font-medium text-sm">{brandName}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
          {navItems.map((item, i) => {
            if (item.section) {
              return (
                <p
                  key={`sec-${i}`}
                  className="text-[10px] text-white/40 uppercase tracking-widest px-2 pt-4 pb-1 mt-1"
                >
                  {item.section}
                </p>
              );
            }
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`
                  flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5
                  text-[13px] transition-all duration-150 no-underline
                  ${isActive
                    ? "bg-[#3b6d11] text-white"
                    : "text-white/65 hover:bg-white/8 hover:text-white"}
                `}
              >
                <i className={`ti ${item.icon} text-base shrink-0`} aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && (
                  <span className="bg-[#5a9e30] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-2.5 py-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-[30px] h-[30px] rounded-full bg-[#5a9e30] flex items-center justify-center text-[11px] font-medium text-white shrink-0">
              {user.initials}
            </div>
            <div className="text-left min-w-0">
              <div className="text-[12px] text-white/85 font-medium truncate">{user.name}</div>
              <div className="text-[10px] text-white/40">{user.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            title="Logout"
          >
            <i className="ti ti-logout text-base" aria-hidden />
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-[54px] bg-white border-b border-stone-200 flex items-center gap-3 px-5 shrink-0">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <i className="ti ti-menu-2 text-base" aria-hidden />
          </button>

          <span className="text-[15px] font-medium text-stone-800 flex-1 truncate min-w-0">{pageTitle}</span>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5">
            <i className="ti ti-search text-stone-400 text-sm" aria-hidden />
            <input
              type="search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search…"
              className="bg-transparent outline-none text-[13px] text-stone-600 placeholder:text-stone-400 w-32"
            />
          </form>

          {/* Action icons */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-8 h-8 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              >
                <i className="ti ti-bell text-base" aria-hidden />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-[-110px] sm:right-0 top-10 w-72 sm:w-80 bg-white rounded-xl border border-stone-200 shadow-xl py-3 z-50 text-left">
                    <div className="flex justify-between items-center px-4 pb-2 border-b border-stone-100">
                      <span className="text-xs font-bold text-stone-700">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllRead();
                          }} 
                          className="text-[10px] text-[#3b6d11] hover:underline font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto pt-1.5">
                      {notifs.length === 0 ? (
                        <p className="text-stone-400 text-xs text-center py-6">No new notifications</p>
                      ) : (
                        notifs.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              toggleRead(n.id);
                              if (n.link) navigate(n.link);
                              setNotifOpen(false);
                            }}
                            className={`px-4 py-2.5 hover:bg-stone-50 cursor-pointer flex flex-col gap-1 border-b border-stone-50/50 last:border-b-0 ${
                              !n.read ? 'bg-stone-50/20 font-semibold border-l-4 border-l-[#3b6d11]' : ''
                            }`}
                          >
                            <p className="text-[12px] text-stone-700 leading-normal">{n.text}</p>
                            <span className="text-[9px] text-stone-400">{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              className="w-8 h-8 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
              aria-label="Help"
            >
              <i className="ti ti-help text-base" aria-hidden />
            </button>
            {onNewClick && (
              <button
                onClick={onNewClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b6d11] hover:bg-[#27500a] text-white text-[13px] font-medium rounded-lg transition-colors"
              >
                <i className="ti ti-plus text-sm" aria-hidden />
                New
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
