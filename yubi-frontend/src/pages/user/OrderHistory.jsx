import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { foodAPI, getApiErrorMessage } from "@/lib/api";
import OrderCancelModal from "@/components/orders/OrderCancelModal";
import OrderTrackingSlider from "@/components/orders/OrderTrackingSlider";
import OrderViewModal from "@/components/orders/OrderViewModal";
import {
  canShowCancelOrder,
  extractUserOrdersList,
  getResolvedDeliveryTrackState,
  mapUserOrderRow,
  mergeOrderWithStatusSnapshot,
  normalizeFoodOrderStatusPayload,
} from "@/lib/userOrders";
import { useAuth } from "@/context/AuthContext";

const fontHeading = "'Plus Jakarta Sans', 'DM Sans', Montserrat, sans-serif";

/** Refetch tracking from GET /food/order-status while user stays on My Orders (admin updates). */
const ORDER_STATUS_POLL_MS = 15000;

export default function OrderHistory() {
  const { user, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  /** Snapshots from GET /food/order-status/:order_id — keyed by order id string */
  const [statusByOrderId, setStatusByOrderId] = useState({});

  const apiOrderId = (o) => (o.numericId != null ? o.numericId : o.id);

  const loadOrders = useCallback(async () => {
    if (!user?.token) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const raw = await foodAPI.getUserOrders();
      if (raw && typeof raw === "object" && raw.success === false) {
        setError(typeof raw.message === "string" ? raw.message : "Could not load orders.");
        setOrders([]);
        return;
      }
      const list = extractUserOrdersList(raw).map(mapUserOrderRow);
      setOrders(list);
    } catch (e) {
      setError(getApiErrorMessage(e, "Could not load orders."));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!user?.token) return undefined;
    const refresh = () => {
      void loadOrders();
    };
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [user?.token, loadOrders]);

  useEffect(() => {
    if (!user?.token || orders.length === 0) {
      setStatusByOrderId({});
      return undefined;
    }
    let cancelled = false;

    async function fetchOrderStatuses() {
      const pairs = await Promise.all(
        orders.map(async (o) => {
          const id = apiOrderId(o);
          try {
            const res = await foodAPI.getOrderStatus(id);
            const snap = normalizeFoodOrderStatusPayload(res);
            return [String(id), snap];
          } catch {
            return [String(id), null];
          }
        }),
      );
      if (cancelled) return;
      setStatusByOrderId((prev) => {
        const next = {};
        for (const [id, snap] of pairs) {
          if (snap) next[id] = snap;
          else if (prev[id]) next[id] = prev[id];
        }
        return next;
      });
    }

    void fetchOrderStatuses();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void fetchOrderStatuses();
    }, ORDER_STATUS_POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchOrderStatuses();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [orders, user?.token]);

  const viewOrder =
    viewId == null ? null : orders.find((o) => String(apiOrderId(o)) === String(viewId));
  const viewMerged = viewOrder
    ? mergeOrderWithStatusSnapshot(viewOrder, statusByOrderId[String(apiOrderId(viewOrder))])
    : null;
  const canCancelInView = viewMerged ? canShowCancelOrder(viewMerged) : false;

  if (!user) {
    return (
      <main style={shell}>
        <h1 style={title}>My Orders</h1>
        <p style={{ color: "#607060", marginBottom: 20 }}>Sign in to view your order history.</p>
        <button type="button" onClick={() => openAuthModal("login")} style={primaryBtn}>
          Login
        </button>
      </main>
    );
  }

  if (loading) {
    return (
      <main style={shell}>
        <h1 style={title}>My Orders</h1>
        <p style={{ color: "#607060" }}>Loading your orders…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={shell}>
        <h1 style={title}>My Orders</h1>
        <p style={{ color: "#B91C1C", fontWeight: 700 }}>{error}</p>
        <button type="button" onClick={() => loadOrders()} style={primaryBtn}>
          Retry
        </button>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main style={shell}>
        <h1 style={title}>My Orders</h1>
        <p style={{ color: "#607060", marginBottom: 16 }}>You have no orders yet.</p>
        <Link to="/menu" style={{ ...primaryBtn, textDecoration: "none", display: "inline-flex" }}>
          Browse menu
        </Link>
      </main>
    );
  }

  return (
    <main style={shell}>
      <h1 style={title}>My Orders</h1>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {orders.map((o) => {
          const oid = apiOrderId(o);
          const snap = statusByOrderId[String(oid)];
          const merged = mergeOrderWithStatusSnapshot(o, snap);
          const track = getResolvedDeliveryTrackState(
            merged.statusRaw,
            merged.paymentStatusRaw,
            merged.cancelledAt,
            merged.trackingStepIndex,
          );

          return (
            <li
              key={o.id}
              role="button"
              tabIndex={0}
              style={{ ...card, cursor: "pointer" }}
              onClick={() => setViewId(oid)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setViewId(oid);
                }
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    color: track.mode === "cancelled" ? "#C62828" : "#2E7D32",
                    fontSize: 17,
                    fontWeight: 800,
                    letterSpacing: -0.3,
                  }}
                >
                  {track.headline}
                </div>
                <p style={{ margin: "8px 0 0", color: "#334533", fontSize: 14 }}>
                  {formatPlacedWhen(o.createdAt)} · Rs {Number(o.total).toFixed(2)}
                  {o.shippingCharge ? ` · Delivery Rs ${Number(o.shippingCharge).toFixed(2)}` : ""}
                </p>
                {o.deliveryAddress ? (
                  <p style={{ margin: "8px 0 0", color: "#607060", fontSize: 13, maxWidth: 720, lineHeight: 1.45 }}>
                    {o.deliveryAddress}
                  </p>
                ) : null}
              </div>

              <ItemImageStrip items={o.items} />

              <div
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
              >
                <OrderTrackingSlider
                  statusRaw={merged.statusRaw}
                  paymentStatusRaw={merged.paymentStatusRaw}
                  cancelledAt={merged.cancelledAt}
                  trackingStepIndex={merged.trackingStepIndex}
                />
              </div>

              <p style={{ margin: "12px 0 0", fontSize: 13, fontWeight: 700, color: "#2E7D32" }}>Tap for details</p>
            </li>
          );
        })}
      </ul>

      <OrderViewModal
        orderId={viewId}
        open={viewId != null}
        onClose={() => setViewId(null)}
        canCancel={canCancelInView}
        onRequestCancel={() => {
          const id = viewId;
          setViewId(null);
          if (id != null) setCancelId(id);
        }}
      />
      <OrderCancelModal
        orderId={cancelId}
        open={cancelId != null}
        onClose={() => setCancelId(null)}
        onCancelled={() => void loadOrders()}
      />
    </main>
  );
}

function ItemImageStrip({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginTop: 14,
        overflowX: "auto",
        paddingBottom: 4,
        scrollSnapType: "x mandatory",
      }}
    >
      {items.map((it, idx) => (
        <div
          key={it.orderItemId ?? `${it.productId}-${idx}`}
          style={{
            flex: "0 0 auto",
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 88,
          }}
        >
          {it.image ? (
            <img
              src={it.image}
              alt=""
              style={{
                width: 72,
                height: 72,
                borderRadius: 14,
                objectFit: "cover",
                background: "#F1F8F1",
                border: "1px solid #E8F5E9",
              }}
            />
          ) : (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 14,
                background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
                display: "grid",
                placeItems: "center",
                color: "#2E7D32",
                fontWeight: 800,
                fontSize: 18,
                border: "1px solid #A5D6A7",
              }}
            >
              {(it.name || "?").trim().charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 11, color: "#607060", marginTop: 6, textAlign: "center", lineHeight: 1.25 }}>
            {it.quantity}× {truncate(it.name, 22)}
          </span>
          <span style={{ fontSize: 11, color: "#1A2E1A", fontWeight: 700 }}>Rs {Number(it.price || 0).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function truncate(s, n) {
  const t = String(s || "");
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
}

/** Swiggy-style “Placed today, 4:20 pm” line */
function formatPlacedWhen(iso) {
  if (!iso) return "Placed —";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return `Placed ${String(iso)}`;
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((startToday - startThat) / 86400000);
    const timeStr = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    if (diffDays === 0) return `Placed today, ${timeStr}`;
    if (diffDays === 1) return `Placed yesterday, ${timeStr}`;
    return `Placed ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${timeStr}`;
  } catch {
    return `Placed ${String(iso)}`;
  }
}

const shell = { maxWidth: 1000, margin: "0 auto", padding: "50px 20px", color: "#1A1A1A" };
const title = { color: "#1A2E1A", fontFamily: fontHeading, fontSize: "clamp(26px, 4vw, 34px)", marginBottom: 8 };
const card = {
  background: "#FFFFFF",
  border: "1px solid #D6E8D6",
  borderRadius: 14,
  padding: 20,
  marginBottom: 16,
  boxShadow: "0 4px 14px rgba(26,46,26,0.06)",
};
const primaryBtn = {
  background: "linear-gradient(135deg, #4CAF50, #388E3C)",
  color: "#FFFFFF",
  border: "none",
  padding: "12px 22px",
  borderRadius: 12,
  fontWeight: 800,
  cursor: "pointer",
  fontSize: 14,
};
