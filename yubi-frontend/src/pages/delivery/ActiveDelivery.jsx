import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  RefreshCw,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { deliveryPartnerAPI, getApiErrorMessage } from "../../lib/api";
import { getCurrentDeliveryPartner, getDeliveryPartnerIdFromSession } from "../../utils/deliveryState";

const STATUS_ACTIONS = [
  { value: "accept", label: "Accepted (admin assigned → accept)" },
  { value: "pickup", label: "Picked (pickup)" },
  { value: "out", label: "Out for delivery (out)" },
  { value: "deliver", label: "Delivered (deliver)" },
];

function formatMoney(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : String(v ?? "—");
}

export default function ActiveDelivery() {
  const partner = getCurrentDeliveryPartner();
  const dpId = getDeliveryPartnerIdFromSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState(null);
  const [actionByOrder, setActionByOrder] = useState({});
  const [codPaidByOrder, setCodPaidByOrder] = useState({});

  const load = useCallback(async () => {
    if (!dpId) {
      toast.error("Missing delivery partner id. Please log in again.");
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await deliveryPartnerAPI.getActiveOrders(dpId);
      if (res?.status === "error" || res?.success === false) {
        toast.error(res?.message || "Could not load active orders.");
        setOrders([]);
        return;
      }
      setOrders(Array.isArray(res?.orders) ? res.orders : []);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not load active orders."));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [dpId]);

  useEffect(() => {
    load();
  }, [load]);

  const applyStatus = async (order) => {
    const oid = order.order_id;
    const action = actionByOrder[oid];
    if (!action) {
      toast.error("Choose a status update first.");
      return;
    }
    if (!dpId || !oid) {
      toast.error("Missing order or partner information.");
      return;
    }

    const payMethod = String(order.payment_method ?? "").toLowerCase();
    const payload = {
      order_id: Number(oid),
      action,
    };
    if (action === "deliver" && payMethod === "cod") {
      payload.payment_received = codPaidByOrder[oid] ? 1 : 0;
    }

    setUpdatingKey(oid);
    try {
      const res = await deliveryPartnerAPI.patchOrderStatus(dpId, payload);
      if (res?.status === "error" || res?.success === false) {
        toast.error(res?.message || "Could not update status.");
        return;
      }
      toast.success(res?.message || "Status updated.");
      setActionByOrder((prev) => ({ ...prev, [oid]: "" }));
      setCodPaidByOrder((prev) => {
        const next = { ...prev };
        delete next[oid];
        return next;
      });
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not update status."));
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <div style={{ color: "#1A1A1A" }}>
      <section style={activeHero}>
        <div>
          <div style={heroEyebrow}>Delivery mission</div>
          <h1 style={heroTitle}>Active orders</h1>
          <p style={heroText}>
            {loading
              ? "Loading…"
              : orders.length
                ? `${partner.name}, update each order’s status as you progress.`
                : `No active orders assigned to ${partner.name} right now.`}
          </p>
        </div>
        <button type="button" style={refreshBtn} onClick={load} disabled={loading}>
          <RefreshCw size={18} className={loading ? "spin-icon" : undefined} />
          Refresh
        </button>
      </section>

      {!loading && !orders.length && (
        <div style={emptyCard}>
          <PackageCheck size={34} />
          <strong>No active delivery</strong>
          <span>Assigned orders appear here when the admin assigns you.</span>
          <Link to="/delivery-partner/dashboard" style={backLink}>
            Back to dashboard
          </Link>
        </div>
      )}

      {orders.map((order, idx) => {
        const oid = order.order_id;
        const key = oid != null ? `active-${oid}` : `active-${idx}`;
        const busy = updatingKey === oid;
        const customer = order.customer_name ?? "—";
        const phone = order.customer_phone ?? "—";
        const address = order.delivery_address ?? "—";
        const total = formatMoney(order.total_amount);
        const pay = order.payment_method ?? "—";
        const st = order.status ?? "—";
        const isCod = String(order.payment_method ?? "").toLowerCase() === "cod";

        return (
          <article key={key} style={orderCard}>
            <div style={orderTop}>
              <div>
                <div style={customerName}>{customer}</div>
                <div style={statusLine}>Current status: {st}</div>
              </div>
              <span style={paymentPill}>{pay}</span>
            </div>

            <div style={detailGrid}>
              <div style={detailItem}>
                <Phone size={17} />
                <span>{phone}</span>
              </div>
              <div style={detailItem}>
                <IndianRupee size={17} />
                <span>Rs {total}</span>
              </div>
              <div style={{ ...detailItem, gridColumn: "1 / -1", alignItems: "flex-start" }}>
                <MapPin size={17} />
                <span>{address}</span>
              </div>
            </div>

            <div style={updateRow}>
              <label style={labelStrong} htmlFor={`action-${oid}`}>
                Update status
              </label>
              <select
                id={`action-${oid}`}
                style={selectStyle}
                value={actionByOrder[oid] ?? ""}
                disabled={busy}
                onChange={(e) =>
                  setActionByOrder((prev) => ({ ...prev, [oid]: e.target.value }))
                }
              >
                <option value="">Choose action…</option>
                {STATUS_ACTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {actionByOrder[oid] === "deliver" && isCod && (
                <label style={codRow}>
                  <input
                    type="checkbox"
                    checked={!!codPaidByOrder[oid]}
                    onChange={(e) =>
                      setCodPaidByOrder((prev) => ({
                        ...prev,
                        [oid]: e.target.checked,
                      }))
                    }
                  />
                  COD collected (mark paid)
                </label>
              )}
              <button
                type="button"
                style={applyBtn}
                disabled={busy || !actionByOrder[oid]}
                onClick={() => applyStatus(order)}
              >
                {busy ? (
                  <>
                    <Loader2 size={18} className="spin-icon" /> Updating…
                  </>
                ) : (
                  "Apply update"
                )}
              </button>
            </div>

            <div style={linksRow}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                style={secondaryAction}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation size={17} /> Open map
              </a>
              <Link to="/delivery-partner/history" style={mutedLink}>
                View history
              </Link>
            </div>
          </article>
        );
      })}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}

const activeHero = {
  background: "linear-gradient(135deg,#1A2E1A,#4CAF50)",
  color: "#FFFFFF",
  borderRadius: 20,
  padding: 22,
  marginBottom: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap",
  boxShadow: "0 18px 44px rgba(26,46,26,0.18)",
};
const heroEyebrow = {
  color: "#D9F99D",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: 0,
};
const heroTitle = {
  margin: "6px 0",
  fontSize: 32,
  fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
};
const heroText = {
  margin: 0,
  color: "#F1F8F1",
  lineHeight: 1.5,
  maxWidth: 560,
};
const refreshBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "rgba(255,255,255,0.2)",
  border: "1px solid rgba(255,255,255,0.35)",
  color: "#FFFFFF",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 800,
  cursor: "pointer",
};
const emptyCard = {
  background: "#FFFFFF",
  border: "1px dashed #A5D6A7",
  borderRadius: 18,
  padding: 28,
  color: "#1A2E1A",
  fontWeight: 800,
  display: "grid",
  placeItems: "center",
  gap: 8,
  textAlign: "center",
};
const backLink = {
  marginTop: 8,
  display: "inline-block",
  background: "#4CAF50",
  color: "#FFFFFF",
  padding: "10px 14px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 800,
};
const orderCard = {
  background: "#FFFFFF",
  border: "1px solid #D6E8D6",
  borderRadius: 20,
  padding: 20,
  marginBottom: 16,
  boxShadow: "0 14px 34px rgba(26,46,26,.08)",
};
const orderTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 14,
  marginBottom: 14,
};
const customerName = { fontSize: 20, fontWeight: 900, color: "#1A2E1A" };
const statusLine = { marginTop: 6, color: "#6B7280", fontWeight: 700, fontSize: 14 };
const paymentPill = {
  background: "#FFE8C7",
  color: "#111827",
  padding: "10px 17px",
  borderRadius: 999,
  fontWeight: 950,
};
const detailGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: 10,
  marginBottom: 16,
};
const detailItem = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  background: "#F8FCF8",
  border: "1px solid #E3F1E3",
  borderRadius: 13,
  padding: "11px 12px",
  color: "#1A2E1A",
  fontWeight: 800,
  lineHeight: 1.35,
};
const updateRow = {
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: 10,
  paddingTop: 8,
  borderTop: "1px solid #E8F5E9",
};
const labelStrong = { fontWeight: 900, color: "#1A2E1A", fontSize: 14 };
const selectStyle = {
  width: "100%",
  maxWidth: 480,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #D6E8D6",
  fontWeight: 700,
  background: "#FFFFFF",
};
const codRow = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700,
  color: "#374151",
};
const applyBtn = {
  alignSelf: "flex-start",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "linear-gradient(135deg,#4CAF50,#2E7D32)",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 12,
  padding: "12px 20px",
  fontWeight: 900,
  cursor: "pointer",
};
const linksRow = {
  marginTop: 14,
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "center",
};
const secondaryAction = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  background: "#FFFFFF",
  color: "#2E7D32",
  border: "2px solid #4CAF50",
  padding: "10px 14px",
  borderRadius: 13,
  textDecoration: "none",
  fontWeight: 900,
};
const mutedLink = {
  color: "#6B7280",
  fontWeight: 800,
  textDecoration: "underline",
};
