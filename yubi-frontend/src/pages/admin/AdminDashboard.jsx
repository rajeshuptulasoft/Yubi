import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock, IndianRupee, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { adminAPI, getApiErrorMessage } from "../../lib/api";

const text = "#1A1A1A";
const green = "#4CAF50";
const PIE_COLORS = ["#4CAF50", "#FF6F00", "#2196F3", "#9C27B0", "#607D8B"];
const badge = { Pending: "#FEF3C7", Preparing: "#DBEAFE", "Out for Delivery": "#FFEDD5", Delivered: "#DCFCE7", Cancelled: "#FEE2E2" };

function num(v) {
  if (v === undefined || v === null || v === "") return 0;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function unwrapData(raw) {
  if (!raw || typeof raw !== "object") return {};
  if (raw.data != null && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    return raw.data;
  }
  return raw;
}

function mapDashboardOrder(o) {
  if (!o || typeof o !== "object") return null;
  const id = String(o.id ?? o.order_id ?? o.orderId ?? "");
  const itemsRaw = o.items ?? o.line_items ?? o.order_items ?? o.products ?? [];
  const items = (Array.isArray(itemsRaw) ? itemsRaw : []).map((it) => {
    if (typeof it === "string") return { name: it, quantity: 1 };
    const name = String(it.name ?? it.product_name ?? it.title ?? "Item");
    const quantity = num(it.quantity ?? it.qty ?? 1) || 1;
    return { name, quantity };
  });

  const orderStatus = String(o.orderStatus ?? o.status ?? o.order_status ?? "—");

  return {
    id,
    customerName: String(o.customerName ?? o.customer_name ?? o.name ?? "—"),
    customerPhone: String(o.customerPhone ?? o.phone ?? o.customer_phone ?? "—"),
    customerAddress: String(o.customerAddress ?? o.address ?? o.delivery_address ?? "—"),
    orderType: String(o.orderType ?? o.order_type ?? o.type ?? "—"),
    total: num(o.total ?? o.amount ?? o.grand_total),
    paymentMethod: String(o.paymentMethod ?? o.payment_method ?? "—"),
    orderStatus,
    items: items.length ? items : [{ name: "—", quantity: 0 }],
    createdAt: String(o.createdAt ?? o.created_at ?? ""),
  };
}

function extractOrderList(root) {
  const list = root.all_orders ?? root.orders ?? root.recent_orders ?? root.latest_orders ?? [];
  if (!Array.isArray(list)) return [];
  return list.map(mapDashboardOrder).filter(Boolean);
}

function extractStatsFromFields(root) {
  const s = root.stats ?? root.summary ?? root.kpis ?? {};
  const pick = (a, b, c, d) => {
    const v = a ?? b ?? c ?? d;
    return v !== undefined && v !== null ? num(v) : null;
  };
  return {
    totalOrdersToday: pick(
      s.total_orders_today,
      s.totalOrdersToday,
      root.total_orders_today,
      root.totalOrdersToday,
    ),
    revenueToday: pick(
      s.revenue_today,
      s.revenueToday,
      root.revenue_today,
      root.revenueToday,
    ),
    activeDeliveries: pick(
      s.active_deliveries,
      s.activeDeliveries,
      root.active_deliveries,
      root.activeDeliveries,
    ),
    pendingOrders: pick(
      s.pending_orders,
      s.pendingOrders,
      root.pending_orders,
      root.pendingOrders,
    ),
  };
}

function formatRevenue(v) {
  if (v === null || v === undefined) return "₹0";
  if (typeof v === "string" && /^\s*₹/.test(v)) return v.trim();
  const n = num(v);
  return `₹${n.toLocaleString("en-IN")}`;
}

function buildStatsFromOrders(orders) {
  const today = new Date().toISOString().slice(0, 10);
  const todays = orders.filter((o) => (o.createdAt || "").startsWith(today));
  const used = todays.length ? todays : orders;
  const rev = used.reduce((sum, o) => sum + num(o.total), 0);
  const norm = (st) => String(st).trim().toLowerCase();
  const isOutForDelivery = (st) => {
    const n = norm(st);
    return n === "out for delivery" || (n.includes("out for") && n.includes("delivery") && !n.includes("delivered"));
  };
  return {
    totalOrdersToday: used.length,
    revenueToday: rev,
    activeDeliveries: orders.filter((o) => isOutForDelivery(o.orderStatus)).length,
    pendingOrders: orders.filter((o) => {
      const n = norm(o.orderStatus);
      return n === "pending" || n === "preparing";
    }).length,
  };
}

function extractLast7(root) {
  const arr = root.orders_last_7_days ?? root.last_7_days ?? root.weekly_orders ?? root.chart_orders;
  if (!Array.isArray(arr) || !arr.length) return [];
  return arr.map((row, i) => ({
    day: String(row.day ?? row.label ?? row.name ?? `Day ${i + 1}`),
    orders: num(row.orders ?? row.count ?? row.total ?? 0),
  }));
}

function extractPie(root) {
  const p = root.order_types ?? root.orderTypes ?? root.type_breakdown;
  if (Array.isArray(p) && p.length) {
    return p
      .map((x) => ({
        name: String(x.name ?? x.type ?? x.label ?? "—"),
        value: num(x.value ?? x.count ?? 0),
      }))
      .filter((x) => x.name !== "—" || x.value > 0);
  }
  if (p && typeof p === "object" && !Array.isArray(p)) {
    return Object.entries(p).map(([name, value]) => ({ name, value: num(value) }));
  }
  return [];
}

function buildPieFromOrders(orders) {
  const byType = {};
  for (const o of orders) {
    const t = String(o.orderType || "other").toLowerCase();
    byType[t] = (byType[t] || 0) + 1;
  }
  return Object.entries(byType).map(([name, value]) => ({ name, value }));
}

/** Normalize GET /admin/admin-dashboard payload for this page */
function normalizeAdminDashboard(raw) {
  const root = unwrapData(raw);
  const allOrders = extractOrderList(root);
  const fromApi = extractStatsFromFields(root);
  const computed = buildStatsFromOrders(allOrders);

  const stats = {
    totalOrdersToday: fromApi.totalOrdersToday ?? computed.totalOrdersToday,
    revenueTodayRaw: fromApi.revenueToday ?? computed.revenueToday,
    activeDeliveries: fromApi.activeDeliveries ?? computed.activeDeliveries,
    pendingOrders: fromApi.pendingOrders ?? computed.pendingOrders,
  };

  let last7 = extractLast7(root);
  let pie = extractPie(root);
  if (!pie.length && allOrders.length) {
    pie = buildPieFromOrders(allOrders);
  }

  const recentOrders = allOrders.slice(0, 6);

  return {
    stats,
    last7,
    pie,
    recentOrders,
  };
}

export function StatusBadge({ status }) {
  return (
    <span
      style={{
        background: badge[status] || "#EEEEEE",
        color: text,
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {status}
    </span>
  );
}

export function OrdersTable({ rows = [] }) {
  const [selected, setSelected] = useState(null);
  const safeRows = Array.isArray(rows) ? rows : [];
  return (
    <>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {["Order ID", "Customer", "Type", "Amount", "Status", "Payment", "Action"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeRows.map((o) => (
              <tr key={o.id || JSON.stringify(o)}>
                <td data-label="Order ID">{o.id}</td>
                <td data-label="Customer">{o.customerName}</td>
                <td data-label="Type">{o.orderType}</td>
                <td data-label="Amount">₹{num(o.total).toLocaleString("en-IN")}</td>
                <td data-label="Status">
                  <StatusBadge status={o.orderStatus} />
                </td>
                <td data-label="Payment">{o.paymentMethod}</td>
                <td data-label="Action">
                  <button type="button" onClick={() => setSelected(o)} className="admin-view-btn">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal__head">
              <h3 className="admin-modal__title">Order Information</h3>
            </div>
            <div className="admin-modal__body">
              <div className="admin-modal__row">
                <span className="admin-modal__label">Order ID</span>
                <span className="admin-modal__value">{selected.id}</span>
              </div>
              <div className="admin-modal__row">
                <span className="admin-modal__label">Customer</span>
                <span className="admin-modal__value">{selected.customerName}</span>
              </div>
              <div className="admin-modal__row">
                <span className="admin-modal__label">Phone</span>
                <span className="admin-modal__value">{selected.customerPhone}</span>
              </div>
              <div className="admin-modal__row">
                <span className="admin-modal__label">Address</span>
                <span className="admin-modal__value">{selected.customerAddress}</span>
              </div>
              <div className="admin-modal__row">
                <span className="admin-modal__label">Type</span>
                <span className="admin-modal__value">{selected.orderType}</span>
              </div>
              <div className="admin-modal__row">
                <span className="admin-modal__label">Items</span>
                <span className="admin-modal__value">
                  {(selected.items || []).map((item) => `${item.name} x ${item.quantity}`).join(", ") || "—"}
                </span>
              </div>
              <div className="admin-modal__row">
                <span className="admin-modal__label">Total</span>
                <span className="admin-modal__value">₹{num(selected.total).toLocaleString("en-IN")}</span>
              </div>
              <div className="admin-modal__row">
                <span className="admin-modal__label">Status</span>
                <span className="admin-modal__value">{selected.orderStatus}</span>
              </div>
            </div>
            <div className="admin-modal__foot">
              <button type="button" onClick={() => setSelected(null)} className="admin-modal__close">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminDashboard() {
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await adminAPI.getDashboard();
        if (cancelled) return;
        if (res?.success === false) {
          setError(getApiErrorMessage(res, "Could not load dashboard."));
          setDash(null);
          return;
        }
        setDash(normalizeAdminDashboard(res));
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load dashboard."));
          setDash(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const stats = useMemo(() => {
    if (!dash) {
      return [
        [ShoppingBag, "Total Orders Today", "—"],
        [IndianRupee, "Revenue Today", "—"],
        [Truck, "Active Deliveries", "—"],
        [Clock, "Pending Orders", "—"],
      ];
    }
    const { stats: s } = dash;
    return [
      [ShoppingBag, "Total Orders Today", s.totalOrdersToday],
      [IndianRupee, "Revenue Today", formatRevenue(s.revenueTodayRaw)],
      [Truck, "Active Deliveries", s.activeDeliveries],
      [Clock, "Pending Orders", s.pendingOrders],
    ];
  }, [dash]);

  if (loading) {
    return (
      <div>
        <h1 style={{ ...title, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>Admin Dashboard</h1>
        <p style={{ color: text, fontWeight: 700 }}>Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ ...title, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>Admin Dashboard</h1>
        <p style={{ color: "#D32F2F", fontWeight: 800, marginBottom: 12 }}>{error}</p>
        <button
          type="button"
          className="admin-view-btn"
          onClick={() => setReloadKey((k) => k + 1)}
        >
          Retry
        </button>
      </div>
    );
  }

  const last7 = dash?.last7?.length ? dash.last7 : [];
  const pie = dash?.pie?.length ? dash.pie : [];
  const recentOrders = dash?.recentOrders ?? [];

  return (
    <div>
      <h1 style={{ ...title, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>Admin Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16, marginBottom: 24 }}>
        {stats.map(([Icon, label, value]) => (
          <div key={label} style={card}>
            <div style={iconWrap}>
              <Icon size={25} />
            </div>
            <h2 style={{ color: "#1A2E1A", margin: "14px 0 4px", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
              {value}
            </h2>
            <p style={{ color: text, margin: 0, fontWeight: 700 }}>{label}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 24 }}>
        <ChartCard title="Orders Last 7 Days">
          {last7.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill={green} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: text, margin: 0, fontWeight: 600 }}>No chart data from API.</p>
          )}
        </ChartCard>
        <ChartCard title="Order Types">
          {pie.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pie.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: text, margin: 0, fontWeight: 600 }}>No breakdown data from API.</p>
          )}
        </ChartCard>
      </div>
      <h2 style={subTitle}>
        <PackageCheck size={22} /> Recent Orders
      </h2>
      {recentOrders.length ? (
        <OrdersTable rows={recentOrders} />
      ) : (
        <p style={{ color: text, fontWeight: 700 }}>No recent orders.</p>
      )}
    </div>
  );
}

export function ChartCard({ title, children }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 14,
        padding: 24,
        boxShadow: "0 12px 34px rgba(26,46,26,0.08)",
        border: "1px solid #D6E8D6",
      }}
    >
      <h3 style={{ color: "#1A2E1A", marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

const card = {
  background: "#FFFFFF",
  borderLeft: "5px solid #4CAF50",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 12px 34px rgba(26,46,26,0.08)",
  color: text,
  borderTop: "1px solid #D6E8D6",
  borderRight: "1px solid #D6E8D6",
  borderBottom: "1px solid #D6E8D6",
};
const iconWrap = {
  width: 48,
  height: 48,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background: "#E8F5E9",
  color: "#4CAF50",
};
export const title = { color: "#1A2E1A", marginTop: 0, fontSize: 34, display: "flex", alignItems: "center", gap: 8 };
export const subTitle = { color: "#1A2E1A", display: "flex", alignItems: "center", gap: 8 };
