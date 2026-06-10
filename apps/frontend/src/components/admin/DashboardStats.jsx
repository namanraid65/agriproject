/**
 * DashboardStats
 * Props:
 *   stats – array of StatCard config objects (see STAT_VARIANTS below)
 *
 * StatCard shape:
 *   {
 *     label:    string          – e.g. "Total revenue"
 *     value:    string | number – e.g. "₹4.28L" or 1847
 *     delta:    string          – e.g. "+12.4%" (prefix + = up, - = down)
 *     deltaLabel: string        – e.g. "vs last month"
 *     icon:     string          – Tabler icon class e.g. "ti-trending-up"
 *     color:    "green" | "brown" | "amber" | "red"  (default "green")
 *   }
 */

import { Link } from "react-router-dom";

const COLOR_MAP = {
  green: {
    wrap: "bg-[#f2f7ee]",
    icon: "text-[#3b6d11]",
  },
  brown: {
    wrap: "bg-[#fdf8f3]",
    icon: "text-[#8b5e2a]",
  },
  amber: {
    wrap: "bg-amber-50",
    icon: "text-amber-700",
  },
  red: {
    wrap: "bg-red-50",
    icon: "text-red-600",
  },
};

function StatCard({ label, value, delta, deltaLabel, icon, color = "green", link }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.green;
  const isUp = typeof delta === "string" && delta.startsWith("+");
  const isDown = typeof delta === "string" && delta.startsWith("-");

  const CardContent = (
    <>
      <div className="flex items-start justify-between mb-2">
        <p className="text-[11px] text-stone-400 uppercase tracking-wider font-medium">
          {label}
        </p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.wrap}`}>
          <i className={`ti ${icon} text-[17px] ${c.icon}`} aria-hidden />
        </div>
      </div>

      <p className="text-[22px] font-medium text-stone-800 leading-none mb-2">
        {value}
      </p>

      {(delta || deltaLabel) && (
        <div className="flex items-center gap-1 text-[11px]">
          {delta && (
            <span
              className={`flex items-center gap-0.5 font-medium ${
                isUp ? "text-[#3b6d11]" : isDown ? "text-red-600" : "text-stone-500"
              }`}
            >
              {isUp && <i className="ti ti-arrow-up-right" aria-hidden />}
              {isDown && <i className="ti ti-arrow-down-right" aria-hidden />}
              {delta}
            </span>
          )}
          {deltaLabel && <span className="text-stone-400">{deltaLabel}</span>}
        </div>
      )}
    </>
  );

  if (link) {
    return (
      <Link to={link} className="bg-white border border-stone-200 rounded-xl p-4 block hover:shadow-md transition-shadow no-underline text-inherit">
        {CardContent}
      </Link>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      {CardContent}
    </div>
  );
}

export default function DashboardStats({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}

// ── Default export for quick preview ──────────────────────────────────────────
export const EXAMPLE_STATS = [
  {
    label: "Total revenue",
    value: "₹4.28L",
    delta: "+12.4%",
    deltaLabel: "vs last month",
    icon: "ti-trending-up",
    color: "green",
  },
  {
    label: "Active users",
    value: "1,847",
    delta: "+8.1%",
    deltaLabel: "vs last month",
    icon: "ti-users",
    color: "brown",
  },
  {
    label: "Total orders",
    value: "392",
    delta: "-3.2%",
    deltaLabel: "vs last month",
    icon: "ti-shopping-cart",
    color: "amber",
  },
  {
    label: "Open tickets",
    value: "17",
    delta: "+2",
    deltaLabel: "today",
    icon: "ti-ticket",
    color: "red",
  },
];
