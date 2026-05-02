import { useCallback, useEffect, useState } from "react";
import { adminAPI, getApiErrorMessage } from "../../lib/api";
import { title, StatusBadge } from "./AdminDashboard";
import { AdminModal } from "./AdminProducts";

function extractOrderList(res) {
  if (!res || typeof res !== "object") return [];
  if (res.success === false) return [];
  if (Array.isArray(res.orders)) return res.orders;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

/**
 * Food vs spices: use explicit API fields when present; otherwise default to "food"
 * (Postman sample has no type — all rows appear under Food until backend adds order_type).
 */
function inferOrderType(raw) {
  const t = String(
    raw.order_type ??
      raw.orderType ??
      raw.order_category ??
      raw.category ??
      raw.type ??
      raw.product_type ??
      "",
  )
    .trim()
    .toLowerCase();
  if (t === "spices" || t === "spice" || t.includes("spice") || t === "masala") return "spices";
  return "food";
}

function normalizeOrder(raw) {
  if (!raw || typeof raw !== "object") return null;
  const orderId = raw.order_id ?? raw.id ?? raw.orderId;
  if (orderId === undefined || orderId === null) return null;
  const st = String(raw.status ?? raw.order_status ?? "").trim().toLowerCase();
  return {
    order_id: orderId,
    id: orderId,
    customer_name: String(raw.customer_name ?? raw.customerName ?? ""),
    customer_phone: String(raw.customer_phone ?? raw.customerPhone ?? ""),
    customer_email: raw.customer_email != null ? String(raw.customer_email) : "",
    email: raw.email != null ? String(raw.email) : "",
    delivery_address: String(
      raw.delivery_address ?? raw.deliveryAddress ?? raw.customerAddress ?? "",
    ),
    total_amount: raw.total_amount ?? raw.total ?? raw.totalAmount ?? "",
    shipping_charge: raw.shipping_charge ?? raw.shippingCharge ?? raw.shipping ?? "",
    payment_method: String(raw.payment_method ?? raw.paymentMethod ?? ""),
    payment_status: String(raw.payment_status ?? raw.paymentStatus ?? ""),
    status: st,
    order_status: String(raw.order_status ?? raw.orderStatus ?? ""),
    delivery_partner_id: raw.delivery_partner_id ?? raw.deliveryPartnerId ?? null,
    delivery_partner_name: raw.delivery_partner_name != null ? String(raw.delivery_partner_name) : "",
    created_at: raw.created_at ?? raw.createdAt ?? "",
    cancelled_at: raw.cancelled_at ?? raw.cancelledAt ?? null,
    cancel_reason: raw.cancel_reason ?? raw.cancelReason ?? "",
    orderType: inferOrderType(raw),
    raw,
  };
}

function extractPartnerList(res) {
  if (!res || typeof res !== "object") return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.delivery_partners)) return res.delivery_partners;
  if (Array.isArray(res.partners)) return res.partners;
  if (Array.isArray(res)) return res;
  return [];
}

function partnerAvailable(p) {
  const active = p.is_active ?? p.isActive;
  if (active === 1 || active === true || active === "1") return true;
  const st = String(p.status ?? "").trim().toLowerCase();
  return st === "available" || st === "active";
}

function fmtDateTime(iso) {
  if (iso == null || iso === "") return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(iso);
  }
}

export default function AdminOrderDetailsFood() {
  return <Details type="food" />;
}

const ORDER_STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmed" },
  { value: "assigned", label: "Assigned" },
  { value: "picked", label: "Picked" },
  { value: "out_for_delivery", label: "Out for delivery" },
];

const orderCardStyle = {
  background: "#FFFFFF",
  border: "1px solid #D6E8D6",
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  boxShadow: "0 10px 36px rgba(26,46,26,0.1)",
  borderLeft: "4px solid #4CAF50",
  color: "#1A1A1A",
};

const fieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "14px 20px",
  fontSize: 14,
  marginTop: 16,
};

function OrderField({ label, value, fullWidth }) {
  return (
    <div style={fullWidth ? { gridColumn: "1 / -1" } : undefined}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 600,
          color: "#1A1A1A",
          wordBreak: "break-word",
          lineHeight: 1.45,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function Details({ type }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [assignOrder, setAssignOrder] = useState(null);
  const [statusOrder, setStatusOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAPI.getAdminOrders();
      if (res?.success === false) {
        setError(getApiErrorMessage(res, "Could not load orders."));
        setOrders([]);
        return;
      }
      const list = extractOrderList(res).map(normalizeOrder).filter(Boolean);
      setOrders(list);
    } catch (e) {
      setError(getApiErrorMessage(e, "Could not load orders."));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const rows = orders.filter((order) => order.orderType === type);

  const fmtMoney = (v) => {
    if (v === "" || v == null) return "—";
    const n = Number(String(v).replace(/[^\d.-]/g, ""));
    if (Number.isFinite(n)) return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    return String(v);
  };

  const fmtLabel = (s) => (s ? String(s).replace(/_/g, " ") : "—");

  return (
    <div>
      <div className="admin-page-head">
        <h1 style={{ ...title, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
          Order Details — {type === "food" ? "Food" : "Spices"}
        </h1>
      </div>

      {error && (
        <p style={{ color: "#B91C1C", fontWeight: 800, marginBottom: 12 }}>
          {error}{" "}
          <button type="button" className="admin-view-btn" onClick={() => loadOrders()}>
            Retry
          </button>
        </p>
      )}

      {loading ? (
        <p style={{ fontWeight: 700 }}>Loading orders…</p>
      ) : (
        <>
          {!rows.length && !error && (
            <p style={{ color: "#6B7280", fontWeight: 700 }}>
              No {type === "food" ? "food" : "spice"} orders.
            </p>
          )}
          {rows.map((order) => {
            const r = order.raw && typeof order.raw === "object" ? order.raw : {};
            return (
              <article key={String(order.order_id)} style={orderCardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#1A2E1A",
                        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                      }}
                    >
                      {order.customer_name || "Customer"}
                    </h2>
                    <p style={{ margin: "8px 0 0", color: "#4B5563", fontSize: 14, fontWeight: 600 }}>
                      {order.customer_phone || "—"}
                    </p>
                  </div>
                  <StatusBadge status={formatStatusForBadge(order.status)} />
                </div>

                <div style={fieldGridStyle}>
                  <OrderField
                    label="Email"
                    value={order.email || order.customer_email || "—"}
                  />
                  <OrderField label="Payment method" value={fmtLabel(order.payment_method)} />
                  <OrderField label="Payment status" value={fmtLabel(order.payment_status)} />
                  <OrderField label="Order status" value={fmtLabel(order.status)} />
                  {order.order_status && (
                    <OrderField label="Fulfillment status" value={fmtLabel(order.order_status)} />
                  )}
                  <OrderField label="Total amount" value={fmtMoney(order.total_amount)} />
                  <OrderField label="Shipping charge" value={fmtMoney(order.shipping_charge)} />
                  {r.delivery_fee != null && r.delivery_fee !== "" && (
                    <OrderField label="Delivery fee" value={fmtMoney(r.delivery_fee)} />
                  )}
                  <OrderField
                    label="Delivery partner"
                    value={order.delivery_partner_name || "—"}
                  />
                  <OrderField label="Placed on" value={fmtDateTime(order.created_at)} />
                  {r.refund_status && (
                    <OrderField label="Refund status" value={fmtLabel(String(r.refund_status))} />
                  )}
                  <OrderField
                    label="Delivery address"
                    value={order.delivery_address || "—"}
                    fullWidth
                  />
                </div>

                {(order.status === "cancelled" ||
                  order.cancel_reason ||
                  order.cancelled_at ||
                  r.cancel_reason) && (
                  <div style={{ ...fieldGridStyle, marginTop: 12 }}>
                    {(r.cancelled_by || order.cancel_reason) && (
                      <OrderField
                        label="Cancelled by / reason"
                        value={
                          order.cancel_reason ||
                          r.cancel_reason ||
                          (r.cancelled_by ? String(r.cancelled_by) : "—")
                        }
                      />
                    )}
                    {(r.cancelled_at || order.cancelled_at) && (
                      <OrderField
                        label="Cancelled at"
                        value={fmtDateTime(r.cancelled_at ?? order.cancelled_at)}
                      />
                    )}
                    {r.cancel_code && (
                      <OrderField label="Cancel code" value={String(r.cancel_code)} />
                    )}
                  </div>
                )}

                {order.status !== "cancelled" && order.status !== "canceled" && (
                  <div
                    style={{
                      marginTop: 18,
                      paddingTop: 16,
                      borderTop: "1px solid #E8F5E9",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    {order.status === "pending" && (
                      <button
                        type="button"
                        className="admin-add-btn"
                        style={{ padding: "10px 18px", fontSize: 14, fontWeight: 800 }}
                        onClick={() => setAssignOrder(order)}
                      >
                        Assign delivery partner
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-view-btn"
                      style={{ padding: "10px 18px", fontSize: 14, fontWeight: 800 }}
                      onClick={() => setStatusOrder(order)}
                    >
                      Update order status
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </>
      )}

      {assignOrder && (
        <AssignPartnerModal
          order={assignOrder}
          onClose={() => setAssignOrder(null)}
          onAssigned={() => {
            setAssignOrder(null);
            loadOrders();
          }}
        />
      )}

      {statusOrder && (
        <UpdateStatusModal
          order={statusOrder}
          onClose={() => setStatusOrder(null)}
          onUpdated={() => {
            setStatusOrder(null);
            loadOrders();
          }}
        />
      )}
    </div>
  );
}

function AssignPartnerModal({ order, onClose, onAssigned }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await adminAPI.getAdminDeliveryPartners();
        if (cancelled) return;
        if (res?.success === false) {
          setError(getApiErrorMessage(res, "Could not load partners."));
          setPartners([]);
          return;
        }
        const list = extractPartnerList(res)
          .map((p) => ({
            id: p.id ?? p.delivery_partner_id ?? p.partner_id,
            name: String(p.name ?? ""),
            is_active: p.is_active,
            status: p.status,
          }))
          .filter((p) => p.id != null && partnerAvailable(p));
        setPartners(list);
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e, "Could not load partners."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const confirm = async () => {
    if (selectedId == null) {
      setError("Select an available delivery partner.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await adminAPI.assignAdminOrderPartner(order.order_id, {
        delivery_partner_id: selectedId,
      });
      if (res?.success === false) {
        setError(getApiErrorMessage(res, "Assignment failed."));
        return;
      }
      onAssigned();
    } catch (e) {
      setError(getApiErrorMessage(e, "Assignment failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminModal title="Assign delivery partner" onClose={onClose}>
      <p style={{ marginTop: 0, color: "#4B5563", fontSize: 14 }}>
        Order #{order.order_id} — {order.customer_name}
      </p>
      {loading && <p style={{ fontWeight: 700 }}>Loading partners…</p>}
      {error && <div className="admin-form-error">{error}</div>}
      {!loading && !partners.length && !error && (
        <p style={{ color: "#6B7280" }}>No available delivery partners.</p>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: "12px 0", maxHeight: 280, overflow: "auto" }}>
        {partners.map((p) => (
          <li key={String(p.id)} style={{ marginBottom: 8 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 12,
                border: "1px solid #D6E8D6",
                borderRadius: 10,
                cursor: "pointer",
                background: selectedId === p.id ? "#E8F5E9" : "#fff",
              }}
            >
              <input
                type="radio"
                name="partner"
                checked={selectedId === p.id}
                onChange={() => setSelectedId(p.id)}
              />
              <span style={{ fontWeight: 800 }}>{p.name}</span>
              <span style={{ color: "#6B7280", fontSize: 13 }}>Available</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="admin-form-actions" style={{ marginTop: 16 }}>
        <button type="button" className="admin-secondary-btn" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="admin-add-btn"
          disabled={submitting || loading}
          onClick={confirm}
        >
          {submitting ? "Confirming…" : "Confirm"}
        </button>
      </div>
    </AdminModal>
  );
}

function UpdateStatusModal({ order, onClose, onUpdated }) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!value) {
      setError("Select a status.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await adminAPI.patchAdminOrderStatus(order.order_id, { status: value });
      if (res?.success === false) {
        setError(getApiErrorMessage(res, "Update failed."));
        return;
      }
      onUpdated();
    } catch (e) {
      setError(getApiErrorMessage(e, "Update failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminModal title="Update order status" onClose={onClose}>
      <p style={{ marginTop: 0, color: "#4B5563", fontSize: 14 }}>
        Order #{order.order_id} — current: <strong>{order.status || "—"}</strong>
      </p>
      {error && <div className="admin-form-error">{error}</div>}
      <label className="admin-form-field">
        <span>New status</span>
        <select value={value} onChange={(e) => setValue(e.target.value)}>
          <option value="">Choose…</option>
          {ORDER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div className="admin-form-actions" style={{ marginTop: 16 }}>
        <button type="button" className="admin-secondary-btn" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="admin-add-btn" disabled={submitting} onClick={submit}>
          {submitting ? "Updating…" : "Update status"}
        </button>
      </div>
    </AdminModal>
  );
}

/** Map API status to labels StatusBadge knows */
function formatStatusForBadge(status) {
  const s = String(status || "").trim().toLowerCase().replace(/_/g, " ");
  const map = {
    pending: "Pending",
    confirmed: "Confirmed",
    assigned: "Assigned",
    picked: "Picked",
    "out for delivery": "Out for Delivery",
    preparing: "Preparing",
    delivered: "Delivered",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };
  const compact = String(status || "").trim().toLowerCase();
  if (compact === "out_for_delivery") return "Out for Delivery";
  if (map[s]) return map[s];
  if (!s) return "Pending";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
