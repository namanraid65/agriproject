import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
  { label: "Enquiries", icon: "ti-message",           href: "/admin/enquiries" },
  { section: "Manage" },
  { label: "Products",  icon: "ti-tag",               href: "/admin/products" },
  { label: "Categories", icon: "ti-category",          href: "/admin/categories" },
  { label: "CMS Pages",  icon: "ti-file-text",         href: "/admin/cms" },
  { section: "System" },
  { label: "Settings",  icon: "ti-settings",          href: "/admin/settings" },
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
        <div className="px-2.5 py-3 border-t border-white/10">
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/8 transition-colors">
            <div className="w-[30px] h-[30px] rounded-full bg-[#5a9e30] flex items-center justify-center text-[11px] font-medium text-white shrink-0">
              {user.initials}
            </div>
            <div className="text-left min-w-0">
              <div className="text-[12px] text-white/85 font-medium truncate">{user.name}</div>
              <div className="text-[10px] text-white/40">{user.role}</div>
            </div>
            <i className="ti ti-dots-vertical text-white/35 text-sm ml-auto" aria-hidden />
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

          <span className="text-[15px] font-medium text-stone-800 flex-1">{pageTitle}</span>

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
            <button
              className="relative w-8 h-8 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
              aria-label={`Notifications${notifCount > 0 ? `, ${notifCount} unread` : ""}`}
            >
              <i className="ti ti-bell text-base" aria-hidden />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
              )}
            </button>
            <button
              className="w-8 h-8 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
              aria-label="Help"
            >
              <i className="ti ti-help text-base" aria-hidden />
            </button>
            <button
              onClick={onNewClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b6d11] hover:bg-[#27500a] text-white text-[13px] font-medium rounded-lg transition-colors"
            >
              <i className="ti ti-plus text-sm" aria-hidden />
              New
            </button>
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
