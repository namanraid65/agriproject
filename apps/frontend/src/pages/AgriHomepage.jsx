import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart.js";
import { useMarket } from "../hooks/useMarket.js";
import api from "../services/api.js";
import QuantityInput from "../components/QuantityInput.jsx";

/* ═══════════════════════════════════════════════════════════
   MOCK API — swap every function body with real fetch() calls
   ═══════════════════════════════════════════════════════════ */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHero() {
  await delay(350);
  return {
    badge: "Harvest Season 2025 — New Crop Arrivals Live",
    headline: ["From Soil", "to Shelf,", "Directly Yours"],
    subheadline:
      "Premium farm-fresh produce, certified organic inputs, and trusted agricultural tools — sourced from verified growers, delivered to your door.",
    cta1: { label: "Shop Now", href: "/catalog" },
    cta2: { label: "Meet Our Farmers", href: "#farmers" },
    stats: [
      { value: "12K+", label: "Active Farmers" },
      { value: "98%", label: "Satisfaction Rate" },
      { value: "48hr", label: "Farm to Door" },
      { value: "4.9★", label: "Avg Rating" },
    ],
  };
}

async function fetchCategories() {
  await delay(550);
  return [
    { id: 1, name: "Fresh Vegetables", icon: "veg",   count: "240+", color: "#2d6a4f", bg: "#e8f5e9" },
    { id: 2, name: "Seasonal Fruits",  icon: "fruit", count: "180+", color: "#e76f51", bg: "#fff3e0" },
    { id: 3, name: "Organic Grains",   icon: "grain", count: "95+",  color: "#c8860a", bg: "#fff8e1" },
    { id: 4, name: "Dairy & Eggs",     icon: "dairy", count: "60+",  color: "#457b9d", bg: "#e3f2fd" },
    { id: 5, name: "Herbs & Spices",   icon: "herb",  count: "120+", color: "#52796f", bg: "#e8f5e9" },
    { id: 6, name: "Farm Tools",       icon: "tool",  count: "300+", color: "#6d4c2a", bg: "#efebe9" },
  ];
}

async function fetchProducts() {
  await delay(700);
  return [
    {
      id: 1, name: "Heritage Tomatoes", farm: "Greenfield Organics", price: 89, unit: "kg",
      rating: 4.9, reviews: 312, badge: "Best Seller", badgeColor: "#1a3d2b",
      img: "🍅", bg: "linear-gradient(135deg,#fff9c4,#fff3e0)",
      desc: "Sun-ripened heirloom variety, hand-picked daily at peak sweetness.",
    },
    {
      id: 2, name: "Alphonso Mangoes", farm: "Ratnagiri Farms", price: 420, unit: "dozen",
      rating: 5.0, reviews: 891, badge: "GI Tagged", badgeColor: "#c8860a",
      img: "🥭", bg: "linear-gradient(135deg,#ffe0b2,#fff8e1)",
      desc: "Certified GI-tagged Alphonso. Rich aroma, silky texture, zero fibre.",
    },
    {
      id: 3, name: "A2 Desi Ghee", farm: "Gir Cow Dairy", price: 780, unit: "500ml",
      rating: 4.8, reviews: 567, badge: "Organic", badgeColor: "#2d6a4f",
      img: "🫙", bg: "linear-gradient(135deg,#fce4ec,#fff8e1)",
      desc: "Bilona-churned from A2 milk of indigenous Gir cows. Pure, grainy, fragrant.",
    },
    {
      id: 4, name: "Basmati Rice", farm: "Punjab Golden Fields", price: 145, unit: "kg",
      rating: 4.7, reviews: 234, badge: "New Crop", badgeColor: "#457b9d",
      img: "🌾", bg: "linear-gradient(135deg,#e8f5e9,#f1f8e9)",
      desc: "Extra-long grain, aged 18 months for the perfect biryani texture.",
    },
    {
      id: 5, name: "Moringa Leaves", farm: "Tamil Nadu Greens", price: 35, unit: "bunch",
      rating: 4.6, reviews: 189, badge: "Superfood", badgeColor: "#52796f",
      img: "🌱", bg: "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
      desc: "Freshly harvested drumstick leaves, rich in iron & antioxidants.",
    },
    {
      id: 6, name: "Cold-Press Coconut Oil", farm: "Kerala Naturals", price: 320, unit: "1L",
      rating: 4.9, reviews: 445, badge: "Virgin", badgeColor: "#6d4c2a",
      img: "🥥", bg: "linear-gradient(135deg,#efebe9,#fbe9e7)",
      desc: "First-press cold-extracted from fresh coconuts within 4 hours of harvest.",
    },
    {
      id: 7, name: "Farm Honey (Raw)", farm: "Himalayan Apiaries", price: 490, unit: "500g",
      rating: 4.9, reviews: 722, badge: "Raw & Pure", badgeColor: "#c8860a",
      img: "🍯", bg: "linear-gradient(135deg,#fff8e1,#fff3e0)",
      desc: "Unprocessed, unfiltered wildflower honey from high-altitude hives.",
    },
    {
      id: 8, name: "Red Onion Bulk Pack", farm: "Nashik Agro Co-op", price: 28, unit: "kg",
      rating: 4.5, reviews: 1023, badge: "Bulk Deal", badgeColor: "#1a3d2b",
      img: "🧅", bg: "linear-gradient(135deg,#fce4ec,#f8bbd0)",
      desc: "Export-grade red onion, sorted and washed. Minimum 5kg order.",
    },
  ];
}

async function fetchWhyUs() {
  await delay(480);
  return [
    {
      icon: "organic", title: "Certified Organic",
      body: "Every product is verified by FSSAI-accredited third-party agencies. No pesticides, no synthetic additives, no compromise.",
      accent: "#c8860a",
    },
    {
      icon: "farm", title: "Direct from Farm",
      body: "We eliminate middlemen entirely so farmers earn fair wages and you pay honest prices for genuinely fresh produce.",
      accent: "#52796f",
    },
    {
      icon: "delivery", title: "Cold-Chain Delivery",
      body: "Temperature-controlled logistics from harvest to your doorstep. Every order is freshness-guaranteed or we replace it free.",
      accent: "#2d6a4f",
    },
    {
      icon: "handshake", title: "Farmer First",
      body: "Long-term contracts with 12,000+ smallholder farmers ensure fair wages, advance payments, and sustainable livelihoods.",
      accent: "#c8860a",
    },
  ];
}

async function fetchTestimonials() {
  await delay(820);
  return [
    {
      id: 1, name: "Priya Sharma", role: "Home Chef, Pune", avatar: "PS",
      text: "The quality of vegetables here is unlike anything I've found in a supermarket. You can genuinely taste the difference — I've switched completely.",
      rating: 5, avatarBg: "#2d6a4f",
    },
    {
      id: 2, name: "Arjun Mehta", role: "Restaurant Owner, Mumbai", avatar: "AM",
      text: "We source 80% of our kitchen from KisanMart now. The consistency, freshness, and transparent pricing work perfectly for a busy commercial kitchen.",
      rating: 5, avatarBg: "#c8860a",
    },
    {
      id: 3, name: "Kavya Nair", role: "Nutritionist, Bangalore", avatar: "KN",
      text: "I recommend this to all my clients. The organic certification is genuine, the produce is seasonal, and delivery has never missed a single slot.",
      rating: 5, avatarBg: "#457b9d",
    },
    {
      id: 4, name: "Rohan Desai", role: "Café Owner, Ahmedabad", avatar: "RD",
      text: "Customer support is incredible — once they delivered the wrong variety and replaced the entire order within 4 hours. That kind of service is rare.",
      rating: 5, avatarBg: "#52796f",
    },
  ];
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* ── Grain SVG Texture Overlay ── */
const GrainOverlay = () => (
  <svg
    aria-hidden="true"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.06, zIndex: 1 }}
  >
    <filter id="grain-filter">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain-filter)" />
  </svg>
);

/* ── Skeleton ── */
function Skeleton({ h = "1rem", w = "100%", r = "6px", style: s = {} }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r,
      background: "linear-gradient(90deg,#dce8dc 25%,#c8d8c8 50%,#dce8dc 75%)",
      backgroundSize: "200% 100%",
      animation: "ag-shimmer 1.5s infinite linear",
      flexShrink: 0,
      ...s,
    }} />
  );
}

/* ── Star Rating ── */
function Stars({ rating, size = 14 }) {
  return (
    <span style={{ fontSize: size, letterSpacing: "0.5px", lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#c8860a" : "#d0d0d0" }}>★</span>
      ))}
    </span>
  );
}

/* ── Section Label ── */
function SectionLabel({ text, light = false }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 800, letterSpacing: "2.5px",
      textTransform: "uppercase", margin: "0 0 10px",
      color: light ? "#9dc9a8" : "#52796f",
    }}>
      {text}
    </p>
  );
}

/* ── Testimonial Carousel ── */
function Carousel({ items }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  const go = useCallback((dir) => {
    setFade(false);
    setTimeout(() => {
      setIdx((i) => (i + dir + items.length) % items.length);
      setFade(true);
    }, 200);
  }, [items.length]);

  useEffect(() => {
    const t = setInterval(() => go(1), 5500);
    return () => clearInterval(t);
  }, [go]);

  const t = items[idx];
  return (
    <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
      {/* Card */}
      <div className="ag-testimonial-card" style={{
        background: "#fff",
        borderRadius: 24,
        padding: "2.75rem",
        boxShadow: "0 8px 40px rgba(26,61,43,0.10)",
        border: "1.5px solid #c8e6c9",
        transition: "opacity 0.22s ease",
        opacity: fade ? 1 : 0,
        minHeight: 220,
      }}>
        {/* Quote mark */}
        <div style={{ fontSize: 56, lineHeight: 1, color: "#c8860a", opacity: 0.25, marginBottom: 4, fontFamily: "Georgia, serif" }}>"</div>
        <p style={{
          fontSize: "1.075rem", lineHeight: 1.75, color: "#2c4a2e",
          margin: "0 0 1.75rem", fontStyle: "italic",
        }}>{t.text}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: t.avatarBg, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 14, flexShrink: 0,
            boxShadow: `0 4px 12px ${t.avatarBg}60`,
          }}>{t.avatar}</div>
          <div>
            <div style={{ fontWeight: 800, color: "#1a3d2b", fontSize: 15 }}>{t.name}</div>
            <div style={{ fontSize: 13, color: "#52796f", marginTop: 2 }}>{t.role}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Stars rating={t.rating} size={16} />
          </div>
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
        {items.map((_, i) => (
          <button key={i} onClick={() => { setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 180); }}
            style={{
              width: i === idx ? 28 : 8, height: 8,
              borderRadius: 4, border: "none", cursor: "pointer",
              background: i === idx ? "#c8860a" : "#c8e6c9",
              transition: "all 0.3s ease", padding: 0,
            }}
          />
        ))}
      </div>

      {/* Arrows */}
      {[["left", -1], ["right", 1]].map(([side, dir]) => (
        <button key={side} className="ag-carousel-arrow" onClick={() => go(dir)} style={{
          position: "absolute", top: "50%",
          [side]: -58, transform: "translateY(-50%)",
          width: 44, height: 44, borderRadius: "50%",
          border: "1.5px solid #c8e6c9",
          background: "#fff", cursor: "pointer",
          fontSize: 22, color: "#1a3d2b",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(26,61,43,0.10)",
          transition: "background 0.2s",
          lineHeight: 1,
        }}>{dir === -1 ? "‹" : "›"}</button>
      ))}
    </div>
  );
}

/* ── Category Icon (SVG) ── */
function CategoryIcon({ type, color }) {
  const s = { width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: '0 auto 12px' };
  const paths = {
    veg:        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M2 22s4-4 8-4 8 4 8 4"/><path d="M12 18V8"/><path d="M7 13s2-5 5-5 5 5 5 5"/><path d="M6 8s1-3 6-3 6 3 6 3"/></svg>,
    fruit:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><circle cx="12" cy="14" r="8"/><path d="M12 6V4"/><path d="M12 4c0 0 2-3 5-2"/></svg>,
    grain:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 22V10"/><path d="M5 10l7-8 7 8"/><path d="M5 15l7 3 7-3"/><path d="M5 20l7 2 7-2"/></svg>,
    dairy:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M8 2h8l2 4H6L8 2z"/><path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/><path d="M10 11h4"/></svg>,
    herb:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 22V12"/><path d="M12 12C12 12 7 10 7 5a5 5 0 0 1 5-5"/><path d="M12 12c0 0 5-2 5-7a5 5 0 0 0-5-5"/></svg>,
    tool:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    seed:       <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 22V12"/><ellipse cx="12" cy="8" rx="6" ry="4"/><path d="M6 12c-3 2-3 6 0 8"/><path d="M18 12c3 2 3 6 0 8"/></svg>,
    fertilizer: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    default:    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  };
  return <div style={s}>{paths[type] || paths.default}</div>;
}

/* ── Why-Us Icon (SVG) ── */
function WhyUsIcon({ type, color }) {
  const s = { marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' };
  const icons = {
    organic:   <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="40" height="40"><path d="M12 22V12"/><path d="M12 12C12 12 7 10 7 5a5 5 0 0 1 5-5"/><path d="M12 12c0 0 5-2 5-7a5 5 0 0 0-5-5"/></svg>,
    farm:      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="40" height="40"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    delivery:  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="40" height="40"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    handshake: <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="40" height="40"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l1.06 1.06L12 21.23l7.77-7.77 1.06-1.06a5.4 5.4 0 0 0-.41-7.82z"/></svg>,
    price:     <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="40" height="40"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    credit:    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="40" height="40"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  };
  return <div style={s}>{icons[type] || icons.farm}</div>;
}

/* ═══════════════════════════════════════════════════════════
   MAIN HOMEPAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function AgriHomepage() {
  const [hero,         setHero]         = useState(null);
  const [categories,   setCategories]   = useState([]);
  const [products,     setProducts]     = useState([]);
  const [whyUs,        setWhyUs]        = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [email,        setEmail]        = useState("");
  const [subscribed,   setSubscribed]   = useState(false);
  const [cmsData,      setCmsData]      = useState(null);
  const [cmsLoading,   setCmsLoading]   = useState(true);
  const [dismissedBanners, setDismissedBanners] = useState(new Set());
  const [wishlist, setWishlist] = useState(new Set());
  const [tickerStats, setTickerStats] = useState({ packingCount: 2347, shippedCount: 84 });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("agri-wishlist") || "[]");
      setWishlist(new Set(stored));
    } catch (e) {
      console.error("Failed to load wishlist:", e);
    }
  }, []);

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      localStorage.setItem("agri-wishlist", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const dismissBanner = (idx) => setDismissedBanners(prev => new Set([...prev, idx]));

  const { cartCount, addToCart, cart, updateQty, remove } = useCart();
  const { isB2B } = useMarket();
  const navigate = useNavigate();

  useEffect(() => {
    // Load fallbacks
    fetchHero().then(setHero);
    fetchWhyUs().then(setWhyUs);
    fetchTestimonials().then(setTestimonials);

    // Fetch dynamic categories from DB
    api.get('/categories')
      .then(res => {
        const dbCats = res.data?.data?.categories || [];
        if (dbCats.length > 0) {
          const iconMap = {
            'seeds': 'seed',
            'fertilizers-pesticides': 'fertilizer',
            'farm-tools': 'tool',
            'fresh-vegetables': 'veg',
            'seasonal-fruits': 'fruit',
            'organic-grains': 'grain',
            'dairy-eggs': 'dairy',
            'herbs-spices': 'herb'
          };
          const colorMap = {
            'seeds': '#2d6a4f',
            'fertilizers-pesticides': '#e76f51',
            'farm-tools': '#6d4c2a',
            'fresh-vegetables': '#2d6a4f',
            'seasonal-fruits': '#e76f51',
            'organic-grains': '#c8860a',
            'dairy-eggs': '#457b9d',
            'herbs-spices': '#52796f'
          };
          const bgMap = {
            'seeds': '#e8f5e9',
            'fertilizers-pesticides': '#fff3e0',
            'farm-tools': '#efebe9',
            'fresh-vegetables': '#e8f5e9',
            'seasonal-fruits': '#fff3e0',
            'organic-grains': '#fff8e1',
            'dairy-eggs': '#e3f2fd',
            'herbs-spices': '#e8f5e9'
          };
          const countMap = {
            'fresh-vegetables': '240+',
            'seasonal-fruits': '180+',
            'organic-grains': '95+',
            'dairy-eggs': '60+',
            'herbs-spices': '120+',
            'farm-tools': '300+',
            'seeds': '150+',
            'fertilizers-pesticides': '85+'
          };
          const mapped = dbCats.map(cat => ({
            id: cat._id,
            _id: cat._id,
            name: cat.name,
            icon: iconMap[cat.slug] || 'default',
            count: cat.products !== undefined ? cat.products : (countMap[cat.slug] || '0'),
            color: colorMap[cat.slug] || '#2d6a4f',
            bg: bgMap[cat.slug] || '#e8f5e9'
          }));
          setCategories(mapped);
        } else {
          fetchCategories().then(setCategories);
        }
      })
      .catch(() => {
        fetchCategories().then(setCategories);
      });

    const loadCMS = async () => {
      try {
        const res = await api.get('/cms/homepage');
        if (res.data?.data?.page) {
          setCmsData(res.data.data.page);
        }
      } catch (err) {
        console.error('Failed to load CMS homepage content:', err);
      } finally {
        setCmsLoading(false);
      }
    };

    const fetchTickerStats = async () => {
      try {
        const res = await api.get('/orders/ticker-stats');
        if (res.data?.data) {
          setTickerStats({
            packingCount: res.data.data.packingCount,
            shippedCount: res.data.data.shippedCount
          });
        }
      } catch (err) {
        console.error('Failed to load ticker stats:', err);
      }
    };

    loadCMS();
    fetchTickerStats();
  }, []);

  // Fetch products when isB2B changes
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/products?featured=true');
        const dbProds = res.data?.data?.products || [];
        if (dbProds.length > 0) {
          const mappedProds = dbProds.map(p => ({
            id: p._id || p.id,
            name: p.name,
            farm: p.specifications?.origin || 'Verified Farmer',
            price: p.retailPrice,
            unit: p.unit || 'kg',
            rating: 4.8,
            reviews: Math.floor(Math.random() * 200) + 50,
            badge: p.featured ? "Featured" : "New",
            badgeColor: isB2B ? "#c8860a" : "#2d6a4f",
            img: p.images?.[0]?.url || `https://placehold.co/400x300/e7f3e0/2d6a4f?text=${encodeURIComponent(p.name)}`,
            bg: isB2B ? "linear-gradient(135deg,#ffe0b2,#fff8e1)" : "linear-gradient(135deg,#e8f5e9,#f1f8e9)",
            desc: p.description,
            isDbProduct: true,
            rawProduct: p
          }));
          setProducts(mappedProds);
        } else {
          fetchProducts().then(setProducts);
        }
      } catch (err) {
        console.error('Failed to load products from database:', err);
        fetchProducts().then(setProducts);
      }
    };
    loadProducts();
  }, [isB2B]);

  if (cmsLoading) {
    return (
      <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: '#f7faf7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#1a3d2b', padding: '12px 0', display: 'flex', justifyContent: 'center' }}>
          <Skeleton h="16px" w="40%" r="4px" />
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 2rem', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Skeleton h="24px" w="180px" r="12px" />
            <Skeleton h="50px" w="90%" r="8px" />
            <Skeleton h="50px" w="70%" r="8px" />
            <Skeleton h="18px" w="80%" r="6px" />
            <Skeleton h="18px" w="60%" r="6px" />
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Skeleton h="48px" w="140px" r="12px" />
              <Skeleton h="48px" w="140px" r="12px" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton h="160px" w="100%" r="24px" />
            <Skeleton h="100px" w="100%" r="20px" />
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: '2rem auto', padding: '0 2rem', width: '100%' }}>
          <Skeleton h="32px" w="300px" r="6px" style={{ marginBottom: '1.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <Skeleton h="180px" />
            <Skeleton h="180px" />
            <Skeleton h="180px" />
            <Skeleton h="180px" />
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = (p) => {
    if (p.isDbProduct) {
      if (p.rawProduct.stock <= 0) {
        alert("This product is currently out of stock!");
        return;
      }
      addToCart(p.rawProduct, 1);
    } else {
      const productObj = {
        _id: p.id.toString(),
        name: p.name,
        retailPrice: p.price,
        stock: 50,
        description: p.desc,
        images: [{ url: typeof p.img === 'string' && (p.img.startsWith('http') || p.img.startsWith('/')) ? p.img : `https://placehold.co/400x300/e7f3e0/2d6a4f?text=${encodeURIComponent(p.name)}`, isPrimary: true }]
      };
      addToCart(productObj, 1);
    }
  };
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  /* ─── Inline style tokens ─── */
  const C = {
    forest:  isB2B ? "#5c3d0b" : "#1a3d2b",
    mid:     isB2B ? "#875a12" : "#2d6a4f",
    sage:    isB2B ? "#b08846" : "#52796f",
    gold:    isB2B ? "#e0a030" : "#c8860a",
    goldLight: isB2B ? "#ffd166" : "#e0a030",
    cream:   isB2B ? "#faf8f5" : "#f7faf7",
    surface: "#ffffff",
    text:    isB2B ? "#2e210e" : "#1a2e1b",
    muted:   isB2B ? "#875a12" : "#52796f",
  };

  const displayHero = hero ? {
    badge: isB2B
      ? "B2B Wholesale Portal — Direct Bulk Sourcing"
      : (cmsData?.metaTitle || hero.badge),
    headline: isB2B
      ? ["Direct Sourcing,", "Bulk Pricing,", "Verified Farms"]
      : (cmsData?.title ? [cmsData.title, "", ""] : hero.headline),
    subheadline: isB2B
      ? "Source premium produce, spices, and grains in bulk directly from certified Indian farms. Dedicated logistics, flexible credit terms (NET-30), and fully audited quality control."
      : (cmsData?.metaDescription || hero.subheadline),
    cta1: isB2B
      ? { label: "Procure Bulk", href: "/products" }
      : { label: "Shop Now", href: "/products" },
    cta2: isB2B
      ? { label: "Request Quote (RFQ)", href: "/rfq" }
      : hero.cta2,
    stats: isB2B
      ? [
          { value: "500+", label: "Verified FPOs/Farms" },
          { value: "LTL/FTL", label: "Logistics Support" },
          { value: "NET-30", label: "Credit Terms" },
          { value: "GST-Ready", label: "Invoicing" },
        ]
      : hero.stats,
  } : null;

  const displayTestimonials = (cmsData?.testimonials && cmsData.testimonials.length > 0)
    ? cmsData.testimonials.filter(t => t.isVisible !== false).map((t, idx) => ({
        id: idx,
        name: t.authorName,
        role: t.authorRole,
        avatar: (t.authorName && typeof t.authorName === 'string')
          ? t.authorName.trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase()
          : 'A',
        text: t.content,
        rating: t.rating || 5,
        avatarBg: idx % 2 === 0 ? "#2d6a4f" : "#c8860a"
      }))
    : testimonials;

  const displayWhyUs = whyUs.length > 0
    ? (isB2B
        ? [
            {
              icon: "farm", title: "Direct Farm Sourcing",
              body: "Contract-backed sourcing directly from verified Farmer Producer Organisations (FPOs) and local co-operatives.",
              accent: C.gold,
            },
            {
              icon: "price", title: "Direct Mandi Rates",
              body: "Get transparent bulk rates. Cut out intermediaries to save up to 25% on procurement overheads.",
              accent: C.sage,
            },
            {
              icon: "delivery", title: "Freight & Cold-Chain Logistics",
              body: "Integrated nationwide transport with FTL/LTL freight configurations and thermal temperature control.",
              accent: C.mid,
            },
            {
              icon: "credit", title: "NET-30 Business Terms",
              body: "Register your corporate business details to establish flexible credit lines and structured payment cycles.",
              accent: C.gold,
            },
          ]
        : whyUs)
    : [];

  return (
    <div id="agri-homepage" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: C.cream, color: C.text, minHeight: "100vh", overflowX: "hidden" }}>
      
      {/* Dynamic Promo Banners */}
      {cmsData?.banners?.filter(b => b.isActive)?.map((b, idx) => {
        if (dismissedBanners.has(idx)) return null;
        return (
          <div key={idx} style={{
            background: C.gold, color: '#fff', padding: '11px 48px 11px 16px',
            textAlign: 'center', fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, position: 'relative',
          }}>
            <span style={{ fontWeight: 900, letterSpacing: 1, fontSize: 11, textTransform: 'uppercase', opacity: 0.85, flexShrink: 0 }}>OFFER</span>
            <span><strong>{b.title}:</strong> {b.subtitle}</span>
            {b.link && <Link to={b.link} style={{ color: '#fff', textDecoration: 'underline', marginLeft: 10, flexShrink: 0 }}>Learn More</Link>}
            <button
              onClick={() => dismissBanner(idx)}
              aria-label="Dismiss notification"
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.18)', border: 'none', borderRadius: '50%',
                width: 26, height: 26, cursor: 'pointer', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, lineHeight: 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.18)'}
            >
              ×
            </button>
          </div>
        );
      })}

      {/* ═══ GLOBAL STYLES ═══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes ag-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes ag-fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
        @keyframes ag-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes ag-spin-slow { to{transform:rotate(360deg)} }
        @keyframes ag-pulse-ring { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.15;transform:scale(1.06)} }
        @keyframes ag-ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.33%, 0, 0); }
        }
        #agri-homepage * { box-sizing:border-box; }
        .ag-cat-card { transition:transform .22s,box-shadow .22s !important; cursor:pointer; }
        .ag-cat-card:hover { transform:translateY(-6px) !important; box-shadow:0 16px 48px rgba(26,61,43,.15) !important; }
        .ag-prod-card { transition:transform .22s,box-shadow .22s !important; }
        .ag-prod-card:hover { transform:translateY(-5px) !important; box-shadow:0 16px 48px rgba(26,61,43,.13) !important; }
        .ag-add-btn { transition:all .2s !important; }
        .ag-add-btn:hover { background: ${C.forest} !important; color:#fff !important; border-color: ${C.forest} !important; }
        .ag-why-card { transition:transform .22s,border-color .22s !important; }
        .ag-why-card:hover { transform:translateY(-4px) !important; border-color: ${isB2B ? 'rgba(224,160,48,.35)' : 'rgba(200,134,10,.35)'} !important; }
        .ag-cta1 { transition:all .2s !important; }
        .ag-cta1:hover { background:#e0a030 !important; transform:translateY(-1px) !important; }
        .ag-cta2 { transition:all .2s !important; }
        .ag-cta2:hover { background:rgba(255,255,255,.12) !important; border-color: ${isB2B ? '#ffd166' : '#a8d5b5'} !important; }

        /* ═══ MOBILE RESPONSIVE STYLES ═══ */
        .ag-hero-trust {
          color: rgba(255, 255, 255, 0.7) !important;
        }

        @media (max-width: 991px) {
          .ag-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
            text-align: center !important;
            padding: 4rem 1.5rem !important;
          }
          .ag-hero-ctas {
            justify-content: center !important;
          }
          .ag-hero-subheadline {
            margin: 0 auto 2.25rem !important;
          }
        }

        @media (max-width: 768px) {
          .ag-hero-title {
            font-size: 2.2rem !important;
          }
          .ag-hero-badge {
            font-size: 11px !important;
            padding: 6px 14px !important;
            margin-bottom: 1.25rem !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            max-width: 90% !important;
          }
          .ag-hero-badge span {
            font-size: 11px !important;
          }
          .ag-hero-ctas {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            width: 100% !important;
            max-width: 320px !important;
            margin: 0 auto !important;
          }
          .ag-cta1, .ag-cta2 {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .ag-hero-trust {
            justify-content: center !important;
          }
          .ag-section-header {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 12px !important;
            margin-bottom: 2rem !important;
          }
          .ag-categories-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12px !important;
          }
          .ag-products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 14px !important;
          }
          .ag-prod-desc {
            display: none !important;
          }
          .ag-prod-details {
            padding: 12px !important;
          }
          .ag-prod-details h3 {
            font-size: 14px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .ag-prod-details p {
            display: none !important;
          }
          .ag-qty-control {
            height: 32px !important;
          }
          .ag-qty-btn {
            padding: 0 8px !important;
            font-size: 14px !important;
          }
          .ag-qty-span {
            min-width: 50px !important;
            padding: 0 4px !important;
            font-size: 11px !important;
          }
          .ag-add-btn {
            padding: 8px 12px !important;
            font-size: 11px !important;
          }
          .ag-add-btn svg {
            margin-right: 3px !important;
            width: 12px !important;
            height: 12px !important;
          }
          .ag-why-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .ag-why-card {
            padding: 1.75rem 1.25rem !important;
          }
          .ag-farmers-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .ag-testimonials-container {
            padding: 0 1.5rem !important;
          }
          .ag-testimonial-card {
            padding: 1.75rem !important;
          }
          .ag-carousel-arrow {
            display: none !important;
          }
          .ag-newsletter-form {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .ag-newsletter-form input,
          .ag-newsletter-form button {
            width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .ag-categories-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .ag-hero-stats-card {
            grid-template-columns: 1fr 1fr !important;
            gap: 1rem !important;
            padding: 1.5rem 1rem !important;
          }
          .ag-farmers-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section style={{
        background: cmsData?.heroImage?.url
          ? `linear-gradient(rgba(26,61,43,0.85), rgba(26,61,43,0.85)), url(${cmsData.heroImage.url}) center/cover no-repeat`
          : (isB2B
              ? `linear-gradient(135deg, ${C.forest} 0%, #704a0e 45%, #875a12 100%)`
              : `linear-gradient(135deg, ${C.forest} 0%, #234d35 45%, #2d6a4f 100%)`),
        minHeight: 620, display: "flex", alignItems: "center",
        position: "relative", overflow: "hidden",
      }}>
        <GrainOverlay />

        {/* Decorative blobs */}
        <div style={{ position: "absolute", right: -100, top: -100, width: 520, height: 520, borderRadius: "50%", background: `${C.gold}0d`, pointerEvents: "none", zIndex: 0, animation: "ag-pulse-ring 6s ease-in-out infinite" }} />
        <div style={{ position: "absolute", right: 120, bottom: -140, width: 300, height: 300, borderRadius: "50%", background: `${C.gold}08`, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", left: -60, top: 80, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.025)", pointerEvents: "none", zIndex: 0 }} />

        {/* Decorative floating circles */}
        {[
          { top: "14%", right: "9%",  size: 56, dur: 3.2 },
          { top: "72%", right: "22%", size: 44, dur: 2.8 },
          { top: "28%", right: "38%", size: 64, dur: 3.8 },
          { top: "62%", right: "7%",  size: 40, dur: 2.5 },
          { top: "44%", right: "28%", size: 48, dur: 4.0 },
        ].map(({ top, right, size, dur }, i) => (
          <div key={i} style={{
            position: "absolute", width: size, height: size,
            borderRadius: "50%", border: `1.5px solid ${C.gold}30`,
            top, right, zIndex: 1, pointerEvents: "none", opacity: 0.25,
            animation: `ag-float ${dur}s ease-in-out infinite`,
            animationDelay: `${i * 0.55}s`,
          }} />
        ))}

        <div className="ag-hero-grid" style={{
          maxWidth: 1280, margin: "0 auto", padding: "5rem 2rem",
          display: "grid", gridTemplateColumns: "1.1fr 0.9fr",
          gap: "4rem", alignItems: "center", width: "100%",
          position: "relative", zIndex: 2,
          animation: "ag-fadeUp .8s ease-out both",
        }}>

          {/* ── Left content ── */}
          <div>
            {displayHero ? (
              <>
                {/* Badge pill */}
                <div className="ag-hero-badge" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: `${C.gold}22`, border: `1px solid ${C.gold}55`,
                  borderRadius: 30, padding: "6px 16px", marginBottom: "1.75rem",
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, display: "inline-block", boxShadow: `0 0 8px ${C.gold}`, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#ffd166", fontWeight: 600 }}>{displayHero.badge}</span>
                </div>

                {/* Headline */}
                <h1 className="ag-hero-title" style={{
                  fontSize: "clamp(2.6rem, 5vw, 4rem)", fontWeight: 900,
                  color: "#fff", lineHeight: 1.1, margin: "0 0 1.5rem",
                  letterSpacing: "-2px",
                }}>
                  {displayHero.headline[0]}{" "}
                  <span style={{ color: C.gold }}>{displayHero.headline[1]}</span>
                  <br />{displayHero.headline[2]}
                </h1>

                <p className="ag-hero-subheadline" style={{
                  fontSize: "1.05rem", color: isB2B ? "#e5c583" : "#a8d5b5", lineHeight: 1.8,
                  margin: "0 0 2.25rem", maxWidth: 480,
                }}>
                  {displayHero.subheadline}
                </p>

                {/* CTAs */}
                <div className="ag-hero-ctas" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <Link to={displayHero.cta1.href} className="ag-cta1" style={{
                    background: C.gold, color: "#fff", textDecoration: "none",
                    borderRadius: 12, padding: "14px 34px",
                    fontSize: 16, fontWeight: 800, display: "inline-flex",
                    alignItems: "center", gap: 8,
                    boxShadow: `0 6px 24px ${C.gold}55`,
                  }}>
                    {displayHero.cta1.label} <span>→</span>
                  </Link>
                  {displayHero.cta2.href.startsWith("#") ? (
                    <a href={displayHero.cta2.href} className="ag-cta2" style={{
                      background: "rgba(255,255,255,.07)", color: "#c8e6c9",
                      border: "1.5px solid #52796f", textDecoration: "none",
                      borderRadius: 12, padding: "14px 28px",
                      fontSize: 16, fontWeight: 600,
                    }}>
                      {displayHero.cta2.label}
                    </a>
                  ) : (
                    <Link to={displayHero.cta2.href} className="ag-cta2" style={{
                      background: "rgba(255,255,255,.07)", color: "#c8e6c9",
                      border: "1.5px solid #52796f", textDecoration: "none",
                      borderRadius: 12, padding: "14px 28px",
                      fontSize: 16, fontWeight: 600,
                    }}>
                      {displayHero.cta2.label}
                    </Link>
                  )}
                </div>

                {/* Trust line */}
                <div className="ag-hero-trust" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 28, color: isB2B ? "#b08846" : "#52796f", fontSize: 13 }}>
                  <span>✓</span>
                  <span>Trusted by 50,000+ families &amp; agri-businesses across India</span>
                </div>
              </>
            ) : (
              /* Skeleton hero left */
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Skeleton h="24px" w="220px" r="20px" />
                <Skeleton h="60px" w="95%" r="8px" />
                <Skeleton h="60px" w="75%" r="8px" />
                <Skeleton h="18px" w="88%" r="6px" />
                <Skeleton h="18px" w="65%" r="6px" />
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <Skeleton h="52px" w="160px" r="12px" />
                  <Skeleton h="52px" w="180px" r="12px" />
                </div>
              </div>
            )}
          </div>

          {/* ── Right: stats + badge panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Stats glass card */}
            <div className="ag-hero-stats-card" style={{
              background: "rgba(255,255,255,.07)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,.12)", borderRadius: 24,
              padding: "2rem 1.5rem",
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
            }}>
              {displayHero ? displayHero.stats.map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2.2rem", fontWeight: 900, color: C.gold, lineHeight: 1, letterSpacing: "-1px" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: isB2B ? "#ffd166" : "#9dc9a8", marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</div>
                </div>
              )) : [1, 2, 3, 4].map((i) => (
                <div key={i} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <Skeleton h="36px" w="80px" r="6px" />
                  <Skeleton h="12px" w="60px" r="4px" />
                </div>
              ))}
            </div>

            {/* Harvest season card */}
            <div style={{
              background: "rgba(255,255,255,.06)", borderRadius: 20,
              border: "1px solid rgba(255,255,255,.10)",
              padding: "1.5rem 2rem",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${C.gold}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: "ag-float 3.5s ease-in-out infinite", flexShrink: 0 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 2C6.5 2 2 6.5 2 12"/><path d="M12 22c5.5 0 10-4.5 10-10"/><path d="M12 22A10 10 0 0 1 2 12"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
              </div>
              <div>
                <div style={{ color: "#ffd166", fontWeight: 800, fontSize: 15 }}>{isB2B ? "B2B Procurement Active" : "Harvest Season Active"}</div>
                <div style={{ color: C.sage, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                  {isB2B ? "Direct supplier sourcing channels open" : "Rabi crop deliveries open · Fresh stock daily"}
                </div>
              </div>
            </div>

            {/* Live orders ticker */}
            <div style={{
              background: `${C.gold}18`, border: `1px solid ${C.gold}40`,
              borderRadius: 14, padding: "12px 18px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4caf50", display: "inline-block", boxShadow: "0 0 8px #4caf50" }} />
              <span style={{ fontSize: 13, color: "#ffd166", fontWeight: 600 }}>
                {isB2B 
                  ? `ACTIVE: ${tickerStats.shippedCount} cargo freight trucks en route` 
                  : `LIVE: ${tickerStats.packingCount.toLocaleString()} orders being packed right now`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SCROLLING TICKER ═══ */}
      <div style={{ background: C.gold, padding: "10px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{
          display: "inline-flex", gap: "3rem",
          animation: "ag-ticker 25s linear infinite",
          animationTimingFunction: "linear",
        }}>
          {Array(3).fill(["Heritage Tomatoes", "Alphonso Mangoes", "Basmati Rice", "Cold-Press Oil", "Raw Forest Honey", "Organic Broccoli", "Nashik Onions", "Moringa Leaves"]).flat().map((item, i) => (
            <span key={i} style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{item} <span style={{ opacity: .5, margin: "0 6px" }}>·</span></span>
          ))}
        </div>
      </div>

      {/* ═══ CATEGORIES ═══ */}
      <section id="categories" style={{ maxWidth: 1280, margin: "0 auto", padding: "6rem 2rem" }}>
        <div className="ag-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
          <div>
            <SectionLabel text="Browse by Category" />
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 900, color: C.text, margin: 0, letterSpacing: "-1px" }}>
              What are you looking for?
            </h2>
          </div>
          <Link to="/products" style={{ color: C.gold, fontWeight: 700, textDecoration: "none", fontSize: 15, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
            View All <span>→</span>
          </Link>
        </div>

        <div className="ag-categories-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 18 }}>
          {categories.length > 0 ? categories.map((cat) => (
            <button key={cat.id} className="ag-cat-card" onClick={() => navigate(`/products?category=${cat.id || cat._id}`)} style={{
              background: cat.bg, border: `2px solid ${cat.color}20`,
              borderRadius: 20, padding: "2rem 1.25rem",
              cursor: "pointer", textAlign: "center",
              boxShadow: "0 2px 12px rgba(26,61,43,.06)",
            }}>
              <CategoryIcon type={cat.icon} color={cat.color} />
              <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 4 }}>{cat.name}</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{cat.count} products</div>
              <div style={{ height: 3, borderRadius: 2, background: cat.color, opacity: 0.7, margin: "0 auto", width: "60%" }} />
            </button>
          )) : Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 20, padding: "2rem 1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Skeleton h="40px" w="40px" r="10px" />
              <Skeleton h="16px" w="80%" r="6px" />
              <Skeleton h="12px" w="55%" r="4px" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section id="products" style={{ background: C.surface, padding: "6rem 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <div className="ag-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
            <div>
              <SectionLabel text="Hand-Picked for You" />
              <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 900, color: C.text, margin: 0, letterSpacing: "-1px" }}>
                Featured Products
              </h2>
            </div>
            <Link to="/products" style={{ color: C.gold, fontWeight: 700, textDecoration: "none", fontSize: 15, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
              View All <span>→</span>
            </Link>
          </div>

          <div className="ag-products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 22 }}>
            {products.length > 0 ? products.map((p) => {
              const cartItem = cart?.find(item => item.product._id === p.id.toString());
              const cartQty = cartItem ? cartItem.quantity : 0;
              return (
                <div key={p.id} className="ag-prod-card" style={{
                  background: C.cream, borderRadius: 20,
                  border: isB2B ? "1.5px solid #ffe0b2" : "1.5px solid #c8e6c9",
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(26,61,43,.06)",
                }}>
                  {/* Image area */}
                  <div style={{ background: p.bg, padding: "2rem 1.5rem", textAlign: "center", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}>
                    {(typeof p.img === 'string' && (p.img.startsWith('http') || p.img.startsWith('/'))) ? (
                      <img src={p.img} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
                    ) : (
                      <img src={`https://placehold.co/280x140/e7f3e0/2d6a4f?text=${encodeURIComponent(p.name)}`} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
                    )}
                    <div style={{
                      position: "absolute", top: 14, left: 14,
                      background: p.badgeColor, color: "#fff",
                      fontSize: 10, fontWeight: 800, letterSpacing: "0.5px",
                      padding: "4px 12px", borderRadius: 20, textTransform: "uppercase",
                    }}>{p.badge}</div>
                    <button 
                      onClick={() => toggleWishlist(p.id.toString())}
                      aria-label={wishlist.has(p.id.toString()) ? "Remove from wishlist" : "Add to wishlist"}
                      style={{
                        position: "absolute", top: 12, right: 12,
                        background: "rgba(255,255,255,.9)", border: "none",
                        borderRadius: 8, width: 32, height: 32, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "all 0.2s",
                      }}
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill={wishlist.has(p.id.toString()) ? "#e76f51" : "none"} 
                        stroke={wishlist.has(p.id.toString()) ? "#e76f51" : "#888"} 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Details */}
                  <div className="ag-prod-details" style={{ padding: "1.25rem 1.25rem 1.5rem" }}>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 5, fontWeight: 600 }}>{p.farm}</div>
                    <h3 style={{ fontWeight: 800, fontSize: 17, margin: "0 0 5px", color: C.text, letterSpacing: "-0.3px" }}>{p.name}</h3>
                    <p className="ag-prod-desc" style={{ fontSize: 13, color: C.muted, margin: "0 0 10px", lineHeight: 1.55 }}>{p.desc}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                      <Stars rating={p.rating} />
                      <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{p.rating} ({p.reviews.toLocaleString()})</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 2 }}>
                          {isB2B ? "Wholesale Est." : `Price per ${p.unit}`}
                        </span>
                        <span style={{ fontSize: 22, fontWeight: 900, color: C.forest, letterSpacing: "-0.5px" }}>₹{p.price}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>/{p.unit}</span>
                      </div>
                      {isB2B ? (
                        <Link to="/rfq" className="ag-add-btn" style={{
                          background: "#fff3e0", color: C.forest,
                          border: "1.5px solid #ffe0b2",
                          borderRadius: 10, padding: "10px 18px",
                          cursor: "pointer", fontWeight: 800, fontSize: 13,
                          textDecoration: "none", display: "inline-block"
                        }}>Request Quote</Link>
                      ) : cartQty > 0 ? (
                        <div className="ag-qty-control" style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1.5px solid #a5d6a7",
                          borderRadius: 10,
                          background: "#fff",
                          height: 38,
                          overflow: "hidden"
                        }}>
                          <button
                            type="button"
                            className="ag-qty-btn"
                            onClick={() => {
                              if (cartQty === 1) {
                                remove(p.id.toString());
                              } else {
                                updateQty(p.id.toString(), cartQty - 1);
                              }
                            }}
                            style={{
                              border: "none",
                              background: "transparent",
                              padding: "0 12px",
                              color: C.forest,
                              fontWeight: 800,
                              fontSize: 16,
                              cursor: "pointer",
                              height: "100%",
                              borderRight: "1px solid #c8e6c9"
                            }}
                          >-</button>
                          <QuantityInput
                            value={cartQty}
                            max={p.isDbProduct ? (p.rawProduct.stock ?? 50) : 50}
                            onChange={(val) => {
                              updateQty(p.id.toString(), val);
                            }}
                            style={{
                              border: "none",
                              background: "transparent",
                              width: 60,
                              textAlign: "center",
                              fontWeight: 800,
                              fontSize: 12,
                              color: C.text,
                              outline: "none"
                            }}
                          />
                          <button
                            type="button"
                            className="ag-qty-btn"
                            onClick={() => {
                              const stockLimit = p.isDbProduct ? (p.rawProduct.stock ?? 50) : 50;
                              if (cartQty >= stockLimit) {
                                alert(`Only ${stockLimit} units available in stock.`);
                              } else {
                                updateQty(p.id.toString(), cartQty + 1);
                              }
                            }}
                            style={{
                              border: "none",
                              background: "transparent",
                              padding: "0 12px",
                              color: C.forest,
                              fontWeight: 800,
                              fontSize: 16,
                              cursor: "pointer",
                              height: "100%",
                              borderLeft: "1px solid #c8e6c9"
                            }}
                          >+</button>
                        </div>
                      ) : (p.isDbProduct && p.rawProduct.stock <= 0) ? (
                        <button
                          className="ag-add-btn"
                          disabled
                          style={{
                            background: "#f5f5f5",
                            color: "#9e9e9e",
                            border: "1.5px solid #e0e0e0",
                            borderRadius: 10,
                            padding: "10px 18px",
                            cursor: "not-allowed",
                            fontWeight: 800,
                            fontSize: 13,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          Out of Stock
                        </button>
                      ) : (
                        <button
                          className="ag-add-btn"
                          id={`add-to-cart-${p.id}`}
                          onClick={() => handleAddToCart(p)}
                          style={{
                            background: "#e8f5e9",
                            color: C.forest,
                            border: "1.5px solid #a5d6a7",
                            borderRadius: 10,
                            padding: "10px 18px",
                            cursor: "pointer",
                            fontWeight: 800,
                            fontSize: 13,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : Array(8).fill(0).map((_, i) => (
              <div key={i} style={{ background: C.cream, borderRadius: 20, overflow: "hidden", border: "1.5px solid #c8e6c9" }}>
                <div style={{ height: 150, background: "#e8f5e9" }} />
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: 10 }}>
                  <Skeleton h="12px" w="55%" r="4px" />
                  <Skeleton h="18px" w="82%" r="6px" />
                  <Skeleton h="13px" w="100%" r="4px" />
                  <Skeleton h="13px" w="70%" r="4px" />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                    <Skeleton h="28px" w="70px" r="6px" />
                    <Skeleton h="40px" w="72px" r="10px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE US ═══ */}
      <section id="why-us" style={{ padding: "6rem 0", background: C.forest, position: "relative", overflow: "hidden" }}>
        <GrainOverlay />

        {/* Decorative arc */}
        <div style={{
          position: "absolute", bottom: -180, right: -180,
          width: 460, height: 460, borderRadius: "50%",
          border: `1px solid ${C.gold}20`, zIndex: 1, pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <SectionLabel text="Our Promise" light />
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 900, color: "#fff", margin: "0 0 14px", letterSpacing: "-1px" }}>
              {isB2B ? "Why Sourced from OpenAgri?" : "Why Choose KisanMart?"}
            </h2>
            <p style={{ color: isB2B ? "#e5c583" : "#9dc9a8", maxWidth: 520, margin: "0 auto", lineHeight: 1.75, fontSize: "1.05rem" }}>
              {isB2B
                ? "Connecting commercial food processing, export, and retail operations directly to dynamic production clusters."
                : "We built this platform because farmers and families both deserve better than what the traditional supply chain offers."}
            </p>
          </div>

          <div className="ag-why-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 20 }}>
            {displayWhyUs.length > 0 ? displayWhyUs.map((item) => (
              <div key={item.title} className="ag-why-card" style={{
                background: "rgba(255,255,255,.06)",
                border: "1.5px solid rgba(255,255,255,.09)",
                borderRadius: 20, padding: "2.25rem 1.75rem",
              }}>
                <WhyUsIcon type={item.icon} color={item.accent} />
                <h3 style={{ fontWeight: 800, fontSize: 18, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.3px" }}>{item.title}</h3>
                <p style={{ color: isB2B ? "#e5c583" : "#9dc9a8", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{item.body}</p>
                <div style={{ marginTop: 22, height: 3, borderRadius: 2, background: item.accent, width: 48 }} />
              </div>
            )) : Array(4).fill(0).map((_, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.06)", borderRadius: 20, padding: "2.25rem 1.75rem", display: "flex", flexDirection: "column", gap: 12 }}>
                <Skeleton h="38px" w="38px" r="10px" style={{ opacity: .35 }} />
                <Skeleton h="20px" w="70%" r="6px" style={{ opacity: .35 }} />
                <Skeleton h="14px" w="100%" r="4px" style={{ opacity: .25 }} />
                <Skeleton h="14px" w="80%" r="4px" style={{ opacity: .25 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DYNAMIC CMS SECTIONS ═══ */}
      {cmsData?.sections?.filter(sec => sec.isVisible !== false)?.map((sec, idx) => (
        <section key={idx} style={{ background: idx % 2 === 0 ? C.surface : C.cream, padding: "6rem 2rem" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <SectionLabel text={sec.subtitle || "Spotlight"} />
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 900, color: C.text, marginBottom: "1.5rem", letterSpacing: "-1px" }}>
              {sec.title}
            </h2>
            <p style={{ fontSize: "1.05rem", color: C.muted, lineHeight: 1.8, maxWidth: 680, margin: 0 }}>
              {sec.content}
            </p>
          </div>
        </section>
      ))}

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="testimonials" style={{ padding: "6rem 0", background: "#f0f7f0" }}>
        <div className="ag-testimonials-container" style={{ maxWidth: 860, margin: "0 auto", padding: "0 5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <SectionLabel text="Real Stories" />
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 900, color: C.text, margin: "0 0 10px", letterSpacing: "-1px" }}>
              Loved by 50,000+ customers
            </h2>
            <p style={{ color: C.muted, fontSize: 15 }}>Real reviews from real people who switched to farm-direct.</p>
          </div>

          {displayTestimonials.length > 0 ? (
            <Carousel items={displayTestimonials} />
          ) : (
            <div style={{ background: "#fff", borderRadius: 24, padding: "2.75rem" }}>
              <Skeleton h="40px" w="40px" r="6px" style={{ marginBottom: 16 }} />
              <Skeleton h="18px" w="100%" r="6px" style={{ marginBottom: 8 }} />
              <Skeleton h="18px" w="90%" r="6px" style={{ marginBottom: 8 }} />
              <Skeleton h="18px" w="72%" r="6px" style={{ marginBottom: 28 }} />
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <Skeleton h="48px" w="48px" r="50%" />
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <Skeleton h="16px" w="130px" r="6px" />
                  <Skeleton h="13px" w="90px" r="4px" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ FARMERS SPOTLIGHT ═══ */}
      <section id="farmers" style={{ background: C.surface, padding: "6rem 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <SectionLabel text="Behind Every Product" />
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", fontWeight: 900, color: C.text, margin: 0, letterSpacing: "-1px" }}>
              Meet the Farmers
            </h2>
          </div>
          <div className="ag-farmers-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {[
              { name: "Ravi Kumar", region: "Punjab, India", crop: "Basmati & Wheat", avatar: "RK", years: 22, bg: "#e8f5e9" },
              { name: "Meera Devi", region: "Nashik, Maharashtra", crop: "Onion & Grapes", avatar: "MD", years: 16, bg: "#fff8e1" },
              { name: "Suresh Patel", region: "Anand, Gujarat", crop: "Dairy & Turmeric", avatar: "SP", years: 30, bg: "#fce4ec" },
              { name: "Lakshmi Bai",  region: "Coorg, Karnataka", crop: "Coffee & Pepper", avatar: "LB", years: 18, bg: "#e3f2fd" },
            ].map((f) => (
              <div key={f.name} style={{
                background: f.bg, borderRadius: 20, padding: "1.75rem",
                border: "1.5px solid rgba(26,61,43,.08)",
                transition: "transform .22s",
                cursor: "default",
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: C.forest, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 18, marginBottom: 14,
                  boxShadow: `0 4px 16px rgba(26,61,43,.2)`,
                }}>{f.avatar}</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: C.text }}>{f.name}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{f.region}</div>
                <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, marginTop: 6 }}>{f.crop}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 10, display: "flex", alignItems: "center", gap: 4 }}>
                  {f.years} years of farming
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section style={{ background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, padding: "4.5rem 2rem", position: "relative", overflow: "hidden" }}>
        <GrainOverlay />
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>
          </div>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            Get seasonal picks in your inbox
          </h2>
          <p style={{ color: "rgba(255,255,255,.84)", margin: "0 0 2rem", fontSize: 16, lineHeight: 1.65 }}>
            Weekly harvest alerts, exclusive member discounts, and farm stories — no spam, unsubscribe anytime.
          </p>
          {subscribed ? (
            <div style={{
              background: "rgba(255,255,255,.2)", borderRadius: 14, padding: "18px 24px",
              color: "#fff", fontWeight: 700, fontSize: 16, display: "flex",
              alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              You're subscribed! Welcome to the KisanMart family.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="ag-newsletter-form" style={{ display: "flex", gap: 10, maxWidth: 460, margin: "0 auto" }}>
              <input
                id="newsletter-email"
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1, padding: "14px 20px", borderRadius: 12,
                  border: "none", fontSize: 15, outline: "none",
                  boxShadow: "0 4px 16px rgba(0,0,0,.1)",
                }}
              />
              <button type="submit" id="subscribe-btn" style={{
                background: C.forest, color: "#fff", border: "none",
                borderRadius: 12, padding: "14px 26px",
                fontWeight: 800, fontSize: 15, cursor: "pointer",
                whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(26,61,43,.3)",
                transition: "all .2s",
              }}>Subscribe</button>
            </form>
          )}
        </div>
      </section>


    </div>
  );
}
