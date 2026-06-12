import { useState, useMemo } from "react";

/**
 * DataTable
 * A fully-controlled, searchable, paginated table with per-row actions.
 *
 * Props:
 *   title       – string, card heading
 *   columns     – Column[]
 *   data        – object[]  (rows; each key matches column.key)
 *   perPage     – number (default 5)
 *   onEdit      – (row) => void
 *   onView      – (row) => void
 *   onDelete    – (row) => void
 *   onAdd       – () => void   handler for "+ Add" button in header
 *   searchKeys  – string[]  keys to search on (default: all column keys)
 *   emptyText   – string shown when no rows match
 *
 * Column shape:
 *   {
 *     key:       string         – matches row object key
 *     label:     string         – header label
 *     render?:   (val, row) => ReactNode   – custom cell renderer
 *     className? – extra td class
 *   }
 *
 * Built-in cell renderers (pass as render):
 *   statusBadge   – renders a "active/pending/inactive" badge
 *   avatarName    – renders initials circle + name
 */

// ── Built-in renderers ────────────────────────────────────────────────────────

export function statusBadge(val) {
  const v = (val ?? "").toLowerCase();
  const map = {
    active:   "bg-[#f2f7ee] text-[#3b6d11]",
    pending:  "bg-amber-50 text-amber-700",
    inactive: "bg-[#fdf8f3] text-[#8b5e2a]",
  };
  const cls = map[v] ?? "bg-stone-100 text-stone-500";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${cls}`}>
      {v.charAt(0).toUpperCase() + v.slice(1)}
    </span>
  );
}

const AVATAR_COLORS = [
  "bg-[#c8e0b8] text-[#27500a]",
  "bg-[#f5e6d3] text-[#5c3a15]",
  "bg-amber-100 text-amber-800",
  "bg-red-50 text-red-700",
];

export function avatarName(val, row, colorIndex = 0) {
  const initials = (val || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const c = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${c}`}>
        {initials}
      </div>
      <span className="font-medium text-stone-850">{val}</span>
    </div>
  );
}

// ── Pagination helpers ────────────────────────────────────────────────────────

function pageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1].filter((n) => n >= 1 && n <= total));
  return [...pages].sort((a, b) => a - b);
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DataTable({
  title = "Records",
  columns = [],
  data = [],
  perPage = 5,
  onEdit,
  onView,
  onDelete,
  onAdd,
  searchKeys,
  emptyText = "No records found.",
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // Filters state
  const [activeFilters, setActiveFilters] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);

  const keys = searchKeys ?? columns.map((c) => c.key);

  // Derive unique values for columns that are filterable (between 2 and 10 unique values)
  const filterOptions = useMemo(() => {
    const options = {};
    columns.forEach(col => {
      const values = data.map(row => {
        let val = row[col.key];
        // Fallback for nested keys ending with 'Name' (like 'categoryName' -> 'category')
        if (val === undefined && col.key.endsWith('Name')) {
          const fallbackKey = col.key.slice(0, -4);
          val = row[fallbackKey];
        }
        if (val && typeof val === 'object') {
          return val.name || val.title || JSON.stringify(val);
        }
        return val;
      });

      const uniqueVals = [...new Set(values)].filter(v => v !== undefined && v !== null && v !== '');

      if (uniqueVals.length >= 2 && uniqueVals.length <= 10) {
        options[col.key] = {
          label: col.label,
          values: uniqueVals
        };
      }
    });
    return options;
  }, [data, columns]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let rows = q
      ? data.filter((row) => keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)))
      : data;

    // Apply active column filters
    Object.keys(activeFilters).forEach(colKey => {
      const selectedVals = activeFilters[colKey];
      if (selectedVals && selectedVals.length > 0) {
        rows = rows.filter(row => {
          let val = row[colKey];
          // Fallback for nested keys ending with 'Name'
          if (val === undefined && colKey.endsWith('Name')) {
            const fallbackKey = colKey.slice(0, -4);
            val = row[fallbackKey];
          }
          if (val && typeof val === 'object') {
            val = val.name || val.title || JSON.stringify(val);
          }
          return selectedVals.some(sv => String(sv) === String(val));
        });
      }
    });

    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, query, sortKey, sortDir, keys, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const showActions = onEdit || onView || onDelete;
  const pages = pageNumbers(safePage, totalPages);

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
      {/* ── Table header bar ── */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 flex-wrap gap-y-2">
        <h2 className="text-sm font-semibold text-stone-800 flex-1">{title}</h2>

        {/* Search */}
        <label className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-[12px]">
          <i className="ti ti-search text-stone-400 text-sm" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={handleSearch}
            placeholder="Search…"
            className="bg-transparent outline-none text-stone-700 placeholder:text-stone-400 w-32 font-medium"
            aria-label={`Search ${title}`}
          />
        </label>

        {/* Dynamic Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-lg text-[12px] text-stone-500 bg-white hover:bg-stone-50 transition-colors font-medium"
          >
            <i className="ti ti-adjustments-horizontal text-sm" aria-hidden />
            Filter
            {Object.values(activeFilters).some(arr => arr.length > 0) && (
              <span className="w-1.5 h-1.5 bg-[#3b6d11] rounded-full" />
            )}
          </button>
          
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
              <div className="absolute right-0 top-10 w-64 bg-white rounded-xl border border-stone-200 shadow-xl py-3 z-50 text-left">
                <div className="flex justify-between items-center px-4 pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold text-stone-700">Filters</span>
                  {Object.values(activeFilters).some(arr => arr.length > 0) && (
                    <button 
                      onClick={() => {
                        setActiveFilters({});
                        setPage(1);
                      }} 
                      className="text-[10px] text-red-600 hover:underline font-bold"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto p-4 space-y-4">
                  {Object.keys(filterOptions).length === 0 ? (
                    <p className="text-stone-400 text-xs text-center py-4">No filter options available</p>
                  ) : (
                    Object.keys(filterOptions).map(colKey => {
                      const opt = filterOptions[colKey];
                      return (
                        <div key={colKey} className="space-y-1.5">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{opt.label}</p>
                          <div className="space-y-1">
                            {opt.values.map(val => {
                              const isChecked = activeFilters[colKey]?.includes(val) || false;
                              return (
                                <label key={String(val)} className="flex items-center gap-2 cursor-pointer text-xs text-stone-600 hover:text-stone-800">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      setActiveFilters(prev => {
                                        const current = prev[colKey] || [];
                                        const next = isChecked 
                                          ? current.filter(v => v !== val)
                                          : [...current, val];
                                        return { ...prev, [colKey]: next };
                                      });
                                      setPage(1);
                                    }}
                                    className="rounded border-stone-300 text-[#3b6d11] focus:ring-[#3b6d11] w-3.5 h-3.5"
                                  />
                                  <span>{String(val) === 'true' ? 'Yes' : String(val) === 'false' ? 'No' : String(val)}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Add button */}
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b6d11] hover:bg-[#27500a] text-white text-[12px] font-semibold rounded-lg transition-colors"
          >
            <i className="ti ti-plus text-sm" aria-hidden />
            Add
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3.5 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-stone-600 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (
                      <i className={`ti ${sortDir === "asc" ? "ti-arrow-up" : "ti-arrow-down"} text-[11px] text-[#5a9e30]`} aria-hidden />
                    ) : (
                      <i className="ti ti-arrows-sort text-[10px] text-stone-300" aria-hidden />
                    )}
                  </span>
                </th>
              ))}
              {showActions && (
                <th className="px-3.5 py-2.5 text-right text-[11px] font-semibold text-stone-400 uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="text-center py-10 text-stone-400 text-[13px]"
                >
                  <i className="ti ti-database-off block text-2xl mb-2 mx-auto" aria-hidden />
                  {emptyText}
                </td>
              </tr>
            ) : (
              slice.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-stone-100 hover:bg-[#f2f7ee]/50 transition-colors last:border-b-0"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3.5 py-2.5 text-[13px] text-stone-600 ${col.className ?? ""}`}
                    >
                      {col.render
                        ? col.render(row[col.key], row, ri)
                        : (row[col.key] ?? "—")}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="w-[26px] h-[26px] rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors"
                            aria-label="Edit"
                          >
                            <i className="ti ti-edit text-[13px]" aria-hidden />
                          </button>
                        )}
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            className="w-[26px] h-[26px] rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors"
                            aria-label="View"
                          >
                            <i className="ti ti-eye text-[13px]" aria-hidden />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="w-[26px] h-[26px] rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                            aria-label="Delete"
                          >
                            <i className="ti ti-trash text-[13px]" aria-hidden />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-stone-200 flex-wrap gap-y-2">
        <span className="text-[12px] text-stone-400 flex-1 min-w-max">
          Showing {filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1}–
          {Math.min(safePage * perPage, filtered.length)} of {filtered.length}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="w-7 h-7 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <i className="ti ti-chevron-left text-[13px]" aria-hidden />
          </button>

          {pages.map((n, i) => {
            const prev = pages[i - 1];
            const showEllipsis = prev && n - prev > 1;
            return (
              <span key={n} className="flex items-center gap-1">
                {showEllipsis && (
                  <span className="w-7 h-7 flex items-center justify-center text-[12px] text-stone-400">…</span>
                )}
                <button
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-md border text-[12px] flex items-center justify-center transition-colors ${
                    n === safePage
                      ? "bg-[#3b6d11] text-white border-[#3b6d11] font-semibold"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                  aria-label={`Page ${n}`}
                  aria-current={n === safePage ? "page" : undefined}
                >
                  {n}
                </button>
              </span>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="w-7 h-7 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <i className="ti ti-chevron-right text-[13px]" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
