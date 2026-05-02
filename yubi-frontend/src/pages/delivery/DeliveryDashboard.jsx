import { Link } from "react-router-dom";
import { Clock, IndianRupee, MapPin, Navigation, PackageCheck, Phone, Star, Truck } from "lucide-react";
import { orders } from "../../data";
import { getCurrentDeliveryPartner, isPartnerOnline } from "../../utils/deliveryState";

export default function DeliveryDashboard() {
  const partner = getCurrentDeliveryPartner();
  const partnerOrders = orders.filter((order) => order.deliveryPartnerId === partner.id);
  const active = partnerOrders.find((order) => order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled");
  const deliveredToday = partnerOrders.filter((order) => order.orderStatus === "Delivered").length;
  const pendingOrders = partnerOrders.filter((order) => order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled").length;
  const online = isPartnerOnline(partner);

  return <div style={{ color: "#1A1A1A" }}>
    <section style={hero}>
      <div>
        <div style={eyebrow}>{online ? "Ready for deliveries" : "Offline mode"}</div>
        <h1 style={heroTitle}>Welcome, {partner.name}</h1>
        <p style={heroText}>{online ? "Your active route and delivery performance are ready for today." : "Go online from the sidebar profile switch when you are ready to receive orders."}</p>
      </div>
      <div style={{ ...statusBadge, background: online ? "#E8F5E9" : "#F3F4F6", color: online ? "#2E7D32" : "#6B7280" }}><span style={{ width: 12, height: 12, borderRadius: "50%", background: online ? "#4CAF50" : "#9CA3AF" }} />{online ? "Online" : "Offline"}</div>
    </section>

    <div style={statsGrid}>
      {[[PackageCheck, "Assigned Orders", partnerOrders.length], [IndianRupee, "Total Earnings", `Rs ${partner.earnings}`], [Clock, "Pending Orders", pendingOrders], [Star, "Rating", `${partner.rating} / 5`]].map(([Icon, label, value]) => <div key={label} style={statCard}><div style={icon}><Icon size={23} /></div><div><h2 style={{ color: "#1A2E1A", margin: 0 }}>{value}</h2><p style={{ margin: "5px 0 0", color: "#6B7280", fontWeight: 700 }}>{label}</p></div></div>)}
    </div>

    <div style={contentGrid}>
      <div>
        <h2 style={sectionTitle}>Active Delivery</h2>
        {active ? <OrderCard order={active} /> : <div style={emptyCard}><PackageCheck size={34} /><strong>No active orders right now</strong><span>{online ? "Stay online to receive the next assignment." : "You are offline. Admin will see you as unavailable."}</span></div>}
      </div>
      <div style={sideCard}>
        <h2 style={sectionTitle}>Today Snapshot</h2>
        <div style={miniRow}><span>Delivered</span><strong>{deliveredToday}</strong></div>
        <div style={miniRow}><span>Pending</span><strong>{pendingOrders}</strong></div>
        <div style={miniRow}><span>Current order</span><strong>{active?.id || "Free"}</strong></div>
        <Link to="/delivery-partner/history" style={secondaryLink}>View history</Link>
      </div>
    </div>
  </div>;
}

export function OrderCard({ order }) {
  return <div style={orderCard}>
    <div style={orderTop}>
      <div>
        <div style={orderIdRow}><h2 style={orderId}>{order.id}</h2><span style={typePill}>{order.orderType}</span></div>
        <div style={customerLine}>Customer: <strong>{order.customerName}</strong></div>
      </div>
      <span style={{ ...paymentPill, background: order.paymentMethod === "COD" ? "#FFE8C7" : "#DCFCE7" }}>{order.paymentMethod}</span>
    </div>
    <div style={detailGrid}>
      <div style={inlineInfo}><Phone size={16} />{order.customerPhone}</div>
      <div style={inlineInfo}><IndianRupee size={16} />Rs {order.total}</div>
      <div style={{ ...inlineInfo, gridColumn: "1 / -1", alignItems: "flex-start" }}><MapPin size={16} />{order.customerAddress}</div>
    </div>
    <div style={itemsBox}><span>Items</span><strong>{order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}</strong></div>
    <div style={actionRow}>
      <Link to="/delivery-partner/active" style={primaryLink}><Truck size={17} />Go to Active Delivery</Link>
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerAddress)}`} style={mapLink}><Navigation size={16} />Delivery location</a>
    </div>
  </div>;
}

const hero = { background: "linear-gradient(135deg,#1A2E1A,#4CAF50)", borderRadius: 20, padding: 24, color: "#FFFFFF", display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", flexWrap: "wrap", boxShadow: "0 18px 44px rgba(26,46,26,0.18)" };
const eyebrow = { fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: "#D9F99D", letterSpacing: 0 };
const heroTitle = { margin: "8px 0", fontSize: 34, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" };
const heroText = { margin: 0, maxWidth: 560, color: "#F1F8F1", lineHeight: 1.5 };
const statusBadge = { display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, fontWeight: 900 };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16, margin: "18px 0" };
const statCard = { background: "#FFFFFF", border: "1px solid #D6E8D6", borderRadius: 18, padding: 18, boxShadow: "0 14px 34px rgba(26,46,26,.08)", display: "flex", gap: 14, alignItems: "center" };
const icon = { width: 48, height: 48, borderRadius: 14, display: "grid", placeItems: "center", background: "#E8F5E9", color: "#4CAF50", flexShrink: 0 };
const contentGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18, alignItems: "start" };
const sectionTitle = { color: "#1A2E1A", margin: "0 0 12px", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" };
const orderCard = { background: "linear-gradient(180deg,#FFFFFF,#F7FFF7)", border: "1px solid #D6E8D6", borderRadius: 22, padding: 20, boxShadow: "0 18px 42px rgba(26,46,26,.1)", color: "#1A1A1A" };
const orderTop = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 16 };
const orderIdRow = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" };
const orderId = { color: "#102510", margin: 0, fontSize: 30, lineHeight: 1, fontWeight: 950, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" };
const typePill = { background: "#E8F5E9", color: "#2E7D32", padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900, textTransform: "uppercase" };
const customerLine = { marginTop: 9, color: "#4B5563", fontSize: 15 };
const paymentPill = { color: "#111827", padding: "10px 17px", borderRadius: 999, fontWeight: 950, boxShadow: "0 8px 18px rgba(245,158,11,0.14)" };
const detailGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 14 };
const inlineInfo = { display: "flex", alignItems: "center", gap: 9, background: "#F8FCF8", border: "1px solid #E3F1E3", borderRadius: 13, padding: "11px 12px", color: "#1A2E1A", fontWeight: 800, lineHeight: 1.35 };
const itemsBox = { background: "linear-gradient(135deg,#F1F8F1,#FFFFFF)", border: "1px solid #D6E8D6", borderRadius: 15, padding: 14, color: "#1A2E1A", marginBottom: 16, display: "grid", gap: 5 };
const actionRow = { display: "flex", gap: 10, flexWrap: "wrap" };
const primaryLink = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, flex: "1 1 210px", background: "linear-gradient(135deg,#4CAF50,#2E7D32)", color: "#FFFFFF", padding: "13px 16px", borderRadius: 13, textDecoration: "none", fontWeight: 950, boxShadow: "0 10px 22px rgba(76,175,80,0.24)" };
const mapLink = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, flex: "1 1 160px", background: "#FFFFFF", color: "#2E7D32", border: "2px solid #4CAF50", padding: "11px 14px", borderRadius: 13, textDecoration: "none", fontWeight: 950 };
const sideCard = { background: "#FFFFFF", border: "1px solid #D6E8D6", borderRadius: 18, padding: 20, boxShadow: "0 14px 34px rgba(26,46,26,.08)" };
const miniRow = { display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: "1px solid #E8F5E9", color: "#1A2E1A" };
const secondaryLink = { display: "inline-flex", justifyContent: "center", width: "100%", marginTop: 16, background: "#E8F5E9", color: "#1A2E1A", padding: "11px 14px", borderRadius: 10, textDecoration: "none", fontWeight: 900 };
const emptyCard = { background: "#FFFFFF", border: "1px dashed #A5D6A7", borderRadius: 18, padding: 28, minHeight: 220, display: "grid", placeItems: "center", textAlign: "center", color: "#1A2E1A", gap: 8 };
