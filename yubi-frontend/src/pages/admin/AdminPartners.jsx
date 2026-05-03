import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { adminAPI, getApiErrorMessage } from "../../lib/api";
import { title } from "./AdminDashboard";
import { AdminModal } from "./AdminProducts";

const blankForm = { name: "", email: "", phone: "", password: "" };

function extractList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.delivery_partners)) return res.delivery_partners;
  if (Array.isArray(res.partners)) return res.partners;
  return [];
}

function normalizePartner(p) {
  if (!p || typeof p !== "object") return null;
  const id = p.id ?? p.delivery_partner_id ?? p.partner_id;
  return {
    id: id != null ? id : `row-${p.email ?? p.phone ?? Math.random()}`,
    name: String(p.name ?? ""),
    phone: String(p.phone ?? ""),
    email: String(p.email ?? ""),
    vehicle_type: String(p.vehicle_type ?? "—"),
    status: String(p.status ?? "—"),
    is_active: p.is_active === 1 || p.is_active === true || p.is_active === "1" ? 1 : 0,
  };
}

function formatPartnerStatus(status) {
  const value = String(status ?? "").trim();
  if (!value || value === "â€”") return "â€”";
  return value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isPartnerAvailable(partner) {
  const status = String(partner.status ?? "").trim().toLowerCase();
  return partner.is_active === 1 || status === "available";
}

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAPI.getAdminDeliveryPartners();
      if (res?.success === false) {
        setError(getApiErrorMessage(res, "Could not load delivery partners."));
        setPartners([]);
        return;
      }
      setPartners(extractList(res).map(normalizePartner).filter(Boolean));
    } catch (e) {
      setError(getApiErrorMessage(e, "Could not load delivery partners."));
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  return (
    <div>
      <div className="admin-page-head">
        <h1 style={{ ...title, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>Delivery Partners</h1>
        <button className="admin-add-btn" type="button" onClick={() => setOpen(true)}>
          <Plus size={18} /> Create Partner
        </button>
      </div>

      {error && (
        <p style={{ color: "#B91C1C", fontWeight: 800, marginBottom: 12 }}>
          {error}{" "}
          <button type="button" className="admin-view-btn" onClick={() => loadPartners()}>
            Retry
          </button>
        </p>
      )}

      {loading ? (
        <p style={{ fontWeight: 700, color: "#1A1A1A" }}>Loading partners…</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {partners.map((p) => (
            <article
              key={p.id}
              style={{
                background: "#FFFFFF",
                border: "1px solid #D6E8D6",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 12px 34px rgba(26,46,26,0.08)",
                color: "#1A1A1A",
              }}
            >
              <h2 style={{ margin: "0 0 12px", fontSize: 18, color: "#1A2E1A" }}>{p.name || "—"}</h2>
              <dl style={{ margin: 0, display: "grid", gap: 8, fontSize: 14 }}>
                <div>
                  <dt style={{ fontWeight: 800, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Phone
                  </dt>
                  <dd style={{ margin: "4px 0 0" }}>{p.phone || "—"}</dd>
                </div>
                <div>
                  <dt style={{ fontWeight: 800, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Email
                  </dt>
                  <dd style={{ margin: "4px 0 0", wordBreak: "break-word" }}>{p.email || "—"}</dd>
                </div>
                <div>
                  <dt style={{ fontWeight: 800, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Vehicle
                  </dt>
                  <dd style={{ margin: "4px 0 0" }}>{p.vehicle_type}</dd>
                </div>
                <div>
                  <dt style={{ fontWeight: 800, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Status
                  </dt>
                  <dd style={{ margin: "4px 0 0" }}>{formatPartnerStatus(p.status)}</dd>
                </div>
              </dl>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #E8F5E9" }}>
                <AvailabilityPill active={isPartnerAvailable(p)} />
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !partners.length && !error && (
        <p style={{ color: "#6B7280", fontWeight: 700 }}>No delivery partners yet.</p>
      )}

      {open && (
        <AdminModal title="Create Delivery Partner" onClose={() => setOpen(false)}>
          <DeliveryPartnerForm
            onCancel={() => setOpen(false)}
            onCreated={async () => {
              await loadPartners();
              setOpen(false);
            }}
          />
        </AdminModal>
      )}
    </div>
  );
}

function AvailabilityPill({ active }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        fontWeight: 900,
        fontSize: 13,
        background: active ? "#E8F5E9" : "#F3F4F6",
        color: active ? "#2E7D32" : "#6B7280",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: active ? "#4CAF50" : "#9CA3AF",
        }}
      />
      {active ? "Available" : "Not available"}
    </span>
  );
}

function DeliveryPartnerForm({ onCancel, onCreated }) {
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email";
    if (!form.password) next.password = "Required";
    else if (form.password.length < 6) next.password = "At least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await adminAPI.createDeliveryPartner({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      if (res?.success === false) {
        setApiError(getApiErrorMessage(res, "Could not create partner."));
        return;
      }
      setForm(blankForm);
      await onCreated();
    } catch (e) {
      setApiError(getApiErrorMessage(e, "Could not create partner."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="admin-product-form" onSubmit={submit}>
      {apiError && <div className="admin-form-error">{apiError}</div>}
      <Field label="Name" error={errors.name}>
        <input value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" />
      </Field>
      <Field label="Phone" error={errors.phone}>
        <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" />
      </Field>
      <Field label="Email" error={errors.email}>
        <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
      </Field>
      <Field label="Password" error={errors.password}>
        <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} autoComplete="new-password" />
      </Field>
      <div className="admin-form-actions">
        <button type="button" className="admin-secondary-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="admin-add-btn" disabled={loading}>
          {loading ? "Creating…" : "Create Partner"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="admin-form-field">
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
