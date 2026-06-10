import { useState, useEffect, useRef } from "react";

/**
 * FormModal
 * A tabbed create/edit modal with flexible field definitions.
 *
 * Props:
 *   open          – boolean
 *   onClose       – () => void
 *   onSubmit      – (formData: object) => void
 *   title         – string  e.g. "Add new user"
 *   subtitle      – string  e.g. "Fill in the details below"
 *   icon          – Tabler icon class e.g. "ti-user-plus"
 *   tabs          – Tab[]   (optional; defaults to single unnamed tab)
 *   submitLabel   – string  default "Save"
 *   initialValues – object  pre-fill for edit mode
 *   loading       – boolean show spinner on submit button
 *
 * Tab shape:
 *   { label: string, fields: Field[] }
 *
 * Field shape:
 *   {
 *     key:         string        – form data key
 *     label:       string
 *     type?:       "text" | "email" | "password" | "tel" | "number"
 *                  | "textarea" | "select" | "checkbox"   (default "text")
 *     placeholder? string
 *     hint?        string        – helper text below field
 *     required?    boolean
 *     options?     { label, value }[]   for select fields
 *     halfWidth?   boolean       true = 2-col grid with sibling
 *     validate?    (val) => string | null   returns error msg or null
 *   }
 */

// ── Single field renderer ─────────────────────────────────────────────────────

function Field({ field, value, onChange, error }) {
  const base =
    "w-full px-2.5 py-2 border rounded-lg text-[13px] text-stone-800 bg-stone-50 outline-none transition-colors placeholder:text-stone-400 " +
    (error
      ? "border-red-300 focus:border-red-400"
      : "border-stone-200 focus:border-[#5a9e30] focus:bg-white");

  if (field.type === "select") {
    return (
      <select
        id={field.key}
        value={value ?? ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={base + " appearance-none cursor-pointer"}
      >
        <option value="" disabled>
          {field.placeholder ?? "Select…"}
        </option>
        {(field.options ?? []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        id={field.key}
        value={value ?? ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className={base + " resize-none"}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          id={field.key}
          checked={!!value}
          onChange={(e) => onChange(field.key, e.target.checked)}
          className="w-4 h-4 rounded accent-[#3b6d11]"
        />
        <span className="text-[13px] text-stone-600">{field.placeholder ?? field.label}</span>
      </label>
    );
  }

  return (
    <input
      id={field.key}
      type={field.type ?? "text"}
      value={value ?? ""}
      onChange={(e) => onChange(field.key, e.target.value)}
      placeholder={field.placeholder}
      className={base}
    />
  );
}

function FieldGroup({ field, value, onChange, error }) {
  if (field.type === "checkbox") {
    return (
      <div className={field.halfWidth ? "" : "col-span-2"}>
        <Field field={field} value={value} onChange={onChange} error={error} />
        {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={field.halfWidth ? "" : "col-span-2"}>
      <label htmlFor={field.key} className="block text-[12px] font-medium text-stone-500 mb-1.5">
        {field.label}
        {field.required && <span className="text-[#3b6d11] ml-0.5">*</span>}
      </label>
      <Field field={field} value={value} onChange={onChange} error={error} />
      {field.hint && !error && (
        <p className="text-[11px] text-stone-400 mt-1">{field.hint}</p>
      )}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const DEFAULT_TABS = [
  {
    label: "Details",
    fields: [
      { key: "firstName", label: "First name", halfWidth: true, required: true, placeholder: "Priya" },
      { key: "lastName",  label: "Last name",  halfWidth: true, required: true, placeholder: "Sharma" },
      { key: "email",     label: "Email address", type: "email", required: true, placeholder: "priya@example.com", hint: "Used for login and notifications" },
      {
        key: "role", label: "Role", type: "select", halfWidth: true,
        options: [{ label: "Admin", value: "admin" }, { label: "Editor", value: "editor" }, { label: "Viewer", value: "viewer" }],
      },
      {
        key: "status", label: "Status", type: "select", halfWidth: true,
        options: [{ label: "Active", value: "active" }, { label: "Pending", value: "pending" }, { label: "Inactive", value: "inactive" }],
      },
      { key: "department", label: "Department", placeholder: "e.g. Engineering" },
    ],
  },
];

export default function FormModal({
  open,
  onClose,
  onSubmit,
  title = "Add new record",
  subtitle = "Fill in the details below",
  icon = "ti-plus",
  tabs = DEFAULT_TABS,
  submitLabel = "Save",
  initialValues = {},
  loading = false,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const dialogRef = useRef(null);

  // Sync initial values when modal opens
  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setErrors({});
      setActiveTab(0);
    }
  }, [open]);

  // Trap focus / close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (key, val) => {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const newErrors = {};
    tabs.forEach((tab) => {
      tab.fields.forEach((f) => {
        if (f.required && !values[f.key]) {
          newErrors[f.key] = `${f.label} is required`;
        } else if (f.validate) {
          const msg = f.validate(values[f.key]);
          if (msg) newErrors[f.key] = msg;
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit?.(values);
  };

  const currentFields = tabs[activeTab]?.fields ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl border border-stone-200 w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* ── Head ── */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-stone-200">
          <div className="w-9 h-9 rounded-xl bg-[#f2f7ee] flex items-center justify-center shrink-0">
            <i className={`ti ${icon} text-[#3b6d11] text-[17px]`} aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="modal-title" className="text-[15px] font-semibold text-stone-850 leading-tight">
              {title}
            </h2>
            <p className="text-[11px] text-stone-400 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-50 transition-colors"
            aria-label="Close"
          >
            <i className="ti ti-x text-sm" aria-hidden />
          </button>
        </div>

        {/* ── Tabs ── */}
        {tabs.length > 1 && (
          <div className="flex gap-1 px-5 bg-stone-50 border-b border-stone-200">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={`px-3.5 py-2.5 text-[13px] border-b-2 -mb-px transition-colors ${
                  i === activeTab
                    ? "text-[#3b6d11] border-[#3b6d11] font-semibold"
                    : "text-stone-400 border-transparent hover:text-stone-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Fields ── */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {currentFields.map((field) => (
            <FieldGroup
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={handleChange}
              error={errors[field.key]}
            />
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-stone-200">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[13px] border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 transition-colors bg-transparent font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#3b6d11] hover:bg-[#27500a] text-white text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <i className="ti ti-loader-2 animate-spin text-sm" aria-hidden />
            ) : (
              <i className="ti ti-check text-sm" aria-hidden />
            )}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
