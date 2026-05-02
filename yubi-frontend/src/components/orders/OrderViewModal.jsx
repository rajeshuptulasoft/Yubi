import { useEffect, useState } from "react";
import { MapPin, Package, X } from "lucide-react";
import { foodAPI, getApiErrorMessage } from "@/lib/api";

const skipKeys = new Set([
  "items",
  "order_items",
  "order_id",
  "orderId",
  "razorpay_order_id",
  "payment_id",
]);

const labelMap = {
  customer_name: "Customer",
  customer_phone: "Phone",
  customer_email: "Email",
  delivery_address: "Deliver to",
  total_amount: "Total",
  shipping_charge: "Delivery fee",
  payment_method: "Payment",
  status: "Order status",
  payment_status: "Payment status",
  payment_collected_at: "Paid at",
  created_at: "Placed on",
  delivered_at: "Delivered at",
  cancelled_at: "Cancelled at",
};

/** GET /food/order-details/:orderId — attractive sheet-style modal */
export default function OrderViewModal({ orderId, open, onClose, canCancel, onRequestCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!open || orderId == null || orderId === "") return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);
    (async () => {
      try {
        const res = await foodAPI.getOrderDetails(orderId);
        if (!cancelled) setDetail(res?.data ?? res);
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e, "Could not load order details."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, orderId]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="presentation" style={overlay} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-view-title"
        style={sheet}
        onClick={(e) => e.stopPropagation()}
      >
        <header style={header}>
          <div style={{ minWidth: 0 }}>
            <h2 id="order-view-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#FFFFFF" }}>
              Order details
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.88)", fontWeight: 600 }}>
              Items, delivery &amp; payment summary
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} style={iconClose}>
            <X size={22} strokeWidth={2.5} />
          </button>
        </header>

        <div style={body}>
          {loading ? (
            <p style={{ color: "#607060", margin: 0 }}>Loading details…</p>
          ) : null}
          {error ? (
            <p style={{ color: "#C62828", fontWeight: 700, margin: 0 }}>{error}</p>
          ) : null}
          {!loading && !error && detail ? <DetailBody data={detail} /> : null}
        </div>

        {canCancel ? (
          <footer style={footer}>
            <button type="button" onClick={() => onRequestCancel?.()} style={cancelBtn}>
              Cancel order
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );
}

function DetailBody({ data }) {
  if (data == null || typeof data !== "object") {
    return <pre style={preStyle}>{String(data)}</pre>;
  }

  const order = data.order ?? data;
  const items = order.items ?? data.items ?? [];
  const address = String(order.delivery_address ?? order.deliveryAddress ?? "").trim();
  const metaRows = buildMetaRows(order);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {address ? (
        <section style={section}>
          <div style={sectionHead}>
            <MapPin size={18} color="#2E7D32" />
            <span style={sectionTitle}>Delivery</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#334533", lineHeight: 1.5 }}>{address}</p>
        </section>
      ) : null}

      {Array.isArray(items) && items.length > 0 ? (
        <section style={section}>
          <div style={sectionHead}>
            <Package size={18} color="#2E7D32" />
            <span style={sectionTitle}>Items</span>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((it, i) => (
              <li key={it.order_item_id ?? i} style={itemCard}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: "#1A2E1A", fontSize: 15 }}>{it.product_name ?? it.name}</div>
                  <div style={{ fontSize: 12, color: "#607060", marginTop: 4 }}>Qty {it.quantity ?? 1}</div>
                </div>
                {it.price != null ? (
                  <div style={{ fontWeight: 800, color: "#2E7D32", fontSize: 15, flexShrink: 0 }}>Rs {it.price}</div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {metaRows.length > 0 ? (
        <section style={{ ...section, background: "#FAFAFA" }}>
          <div style={{ ...sectionHead, marginBottom: 8 }}>
            <span style={sectionTitle}>Summary</span>
          </div>
          <dl style={{ margin: 0, display: "grid", gap: 10 }}>{metaRows}</dl>
        </section>
      ) : null}
    </div>
  );
}

function buildMetaRows(order) {
  const rows = [];
  const keys = [
    "status",
    "payment_status",
    "payment_method",
    "total_amount",
    "shipping_charge",
    "customer_name",
    "customer_phone",
    "created_at",
    "delivered_at",
  ];
  for (const k of keys) {
    if (!Object.prototype.hasOwnProperty.call(order, k)) continue;
    const v = order[k];
    if (v == null || v === "") continue;
    if (skipKeys.has(k)) continue;
    const label = labelMap[k] ?? k.replace(/_/g, " ");
    rows.push(
      <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <dt style={{ margin: 0, fontSize: 13, color: "#757575", fontWeight: 600 }}>{label}</dt>
        <dd style={{ margin: 0, fontSize: 14, color: "#1A1A1A", fontWeight: 700, textAlign: "right" }}>
          {formatVal(k, v)}
        </dd>
      </div>,
    );
  }
  return rows;
}

function formatVal(key, v) {
  if (v == null) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (key.includes("at") && typeof v === "string" && /\d{4}-\d{2}-\d{2}/.test(v)) {
    try {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch {
      /* fall through */
    }
  }
  return String(v);
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 15, 0.55)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  backdropFilter: "blur(4px)",
};

const sheet = {
  background: "#FFFFFF",
  borderRadius: 20,
  maxWidth: 480,
  width: "100%",
  maxHeight: "min(92vh, 640px)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "0 24px 64px rgba(26, 46, 26, 0.22)",
};

const header = {
  flexShrink: 0,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  padding: "20px 20px 18px",
  background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 45%, #43A047 100%)",
};

const iconClose = {
  flexShrink: 0,
  width: 44,
  height: 44,
  borderRadius: 12,
  border: "none",
  background: "rgba(255,255,255,0.18)",
  color: "#FFFFFF",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  transition: "background 0.15s",
};

const body = {
  flex: 1,
  overflowY: "auto",
  padding: "20px",
  WebkitOverflowScrolling: "touch",
};

const footer = {
  flexShrink: 0,
  padding: "16px 20px 20px",
  borderTop: "1px solid #E8F5E9",
  background: "#FAFCFA",
};

const cancelBtn = {
  width: "100%",
  padding: "14px 20px",
  borderRadius: 14,
  border: "2px solid #E57373",
  background: "#FFFFFF",
  color: "#C62828",
  fontWeight: 800,
  fontSize: 15,
  cursor: "pointer",
};

const section = {
  background: "#FFFFFF",
  border: "1px solid #E8F5E9",
  borderRadius: 14,
  padding: 14,
};

const sectionHead = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 10,
};

const sectionTitle = {
  fontSize: 12,
  fontWeight: 800,
  color: "#1A2E1A",
  letterSpacing: 0.6,
  textTransform: "uppercase",
};

const itemCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  padding: 12,
  background: "#F8FCF8",
  borderRadius: 12,
  border: "1px solid #E8F5E9",
};

const preStyle = {
  fontSize: 12,
  overflow: "auto",
  maxHeight: 320,
  background: "#F5F5F5",
  padding: 12,
  borderRadius: 8,
};
