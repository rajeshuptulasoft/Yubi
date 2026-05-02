import { useState } from "react";
import { orders as seedOrders, deliveryPartners } from "../../data";
import { OrdersTable, title } from "./AdminDashboard";

export default function AdminOrdersFood() { return <AdminOrders type="food" />; }
export function AdminOrders({ type }) {
  const [orders, setOrders] = useState(seedOrders.filter((o) => o.orderType === type));
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [assignId, setAssignId] = useState(null);
  const filtered = orders.filter((o) => (tab === "All" || o.orderStatus === tab) && `${o.id} ${o.customerName}`.toLowerCase().includes(q.toLowerCase()));
  const assign = (partner) => { setOrders((prev) => prev.map((o) => o.id === assignId ? { ...o, deliveryPartnerId: partner.id, orderStatus: "Out for Delivery" } : o)); setAssignId(null); localStorage.setItem("yubiDeliveryPartners", JSON.stringify(deliveryPartners.map((p) => p.id === partner.id ? { ...p, status: "On Delivery", currentOrderId: assignId } : p))); };
  return <div><h1 style={{...title, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif"}}>{type === "food" ? "Food Orders" : "Spice Orders"}</h1><input placeholder="Search by Order ID or Customer Name" value={q} onChange={(e) => setQ(e.target.value)} style={input} /><div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "16px 0" }}>{["All", "Pending", "Preparing", "Out for Delivery", "Delivered"].map((s) => <button key={s} onClick={() => setTab(s)} style={{ padding: "9px 16px", borderRadius: 999, border: "1px solid #4CAF50", background: tab === s ? "#4CAF50" : "#FFFFFF", color: tab === s ? "#FFFFFF" : "#1A1A1A", flexShrink: 0 }}>{s}</button>)}</div><OrdersTable rows={filtered} /><div style={{ marginTop: 16 }}>{filtered.filter((o) => !o.deliveryPartnerId).map((o) => <button key={o.id} onClick={() => setAssignId(o.id)} style={{ marginRight: 8, marginBottom: 8, background: "#4CAF50", color: "#FFFFFF", border: "none", padding: "10px 14px", borderRadius: 8 }}>Assign Delivery Partner for {o.id}</button>)}</div>{assignId && <div onClick={() => setAssignId(null)} style={modalBackdrop}><div onClick={(event) => event.stopPropagation()} style={modal}><h2 style={{ color: "#1A2E1A" }}>Assign Partner</h2>{deliveryPartners.filter((p) => p.status === "Available").map((p) => <button key={p.id} onClick={() => assign(p)} style={partnerBtn}>{p.name} - {p.phone}</button>)}<button onClick={() => setAssignId(null)} style={{ ...partnerBtn, background: "#EF4444" }}>Cancel</button></div></div>}</div>;
}
const input = { width: "100%", maxWidth: 420, padding: 12, border: "1px solid #D6E8D6", borderRadius: 8, color: "#1A1A1A" };
const modalBackdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 5000 };
const modal = { background: "#FFFFFF", borderRadius: 8, padding: 24, maxWidth: 420, width: "calc(100% - 32px)", position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
const partnerBtn = { display: "block", width: "100%", marginTop: 10, padding: 12, background: "#4CAF50", color: "#FFFFFF", border: "none", borderRadius: 8 };
