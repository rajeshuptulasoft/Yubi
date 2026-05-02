import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Power, Star, Truck } from "lucide-react";
import { getCurrentDeliveryPartner, isPartnerOnline, updateCurrentDeliveryPartnerStatus } from "../../utils/deliveryState";

export default function DeliveryProfile() {
  const nav = useNavigate();
  const [partner, setPartner] = useState(() => getCurrentDeliveryPartner());
  const online = isPartnerOnline(partner);
  const logout = () => { localStorage.removeItem("yubiUser"); nav("/delivery-partner"); };
  const toggleOnline = () => setPartner(updateCurrentDeliveryPartnerStatus(!online));

  return <div style={{ color: "#1A1A1A" }}>
    <section style={profileHero}>
      <div style={avatar}>{partner.name?.[0] || "D"}</div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <h1 style={title}>{partner.name}</h1>
        <p style={{ margin: "6px 0 0", color: "#6B7280", fontWeight: 700 }}>{partner.email}</p>
      </div>
      <div style={{ ...statusPill, background: online ? "#E8F5E9" : "#F3F4F6", color: online ? "#2E7D32" : "#6B7280" }}>{online ? "Online" : "Offline"}</div>
    </section>

    <div style={grid}>
      {[["Phone", partner.phone], ["Current Order", partner.currentOrderId || "Free"], ["Total Deliveries", partner.totalDeliveries], ["Rating", `${partner.rating} / 5`], ["Total Earnings", `Rs ${partner.earnings}`], ["Partner ID", partner.id]].map(([label, value]) => <div key={label} style={infoCard}><div style={{ fontSize: 12, color: "#6B7280", marginBottom: 5, fontWeight: 800 }}>{label}</div><strong style={{ color: "#1A2E1A" }}>{value}</strong></div>)}
    </div>

    <section style={availabilityCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={powerIcon}><Power size={22} /></div>
        <div>
          <h2 style={{ color: "#1A2E1A", margin: 0, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>Availability</h2>
          <p style={{ margin: "5px 0 0", color: "#6B7280", fontWeight: 700 }}>{online ? "Admin can assign deliveries to you." : "Admin will see you as offline."}</p>
        </div>
      </div>
      <button onClick={toggleOnline} style={{ ...switchTrack, background: online ? "#4CAF50" : "#9CA3AF" }} aria-label="Toggle online status"><span style={{ ...switchThumb, transform: online ? "translateX(26px)" : "translateX(0)" }} /></button>
    </section>

    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
      <button style={softButton}><Truck size={17} /> Vehicle: Bike</button>
      <button style={softButton}><Star size={17} /> Trusted Partner</button>
      <button onClick={logout} style={logoutButton}><LogOut size={17} /> Logout</button>
    </div>
  </div>;
}

const profileHero = { background: "#FFFFFF", border: "1px solid #D6E8D6", borderRadius: 20, padding: 24, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", boxShadow: "0 14px 34px rgba(26,46,26,.09)" };
const avatar = { width: 76, height: 76, borderRadius: 20, background: "linear-gradient(135deg,#4CAF50,#1A2E1A)", color: "#FFFFFF", display: "grid", placeItems: "center", fontSize: 34, fontWeight: 900 };
const title = { color: "#1A2E1A", margin: 0, fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" };
const statusPill = { padding: "9px 14px", borderRadius: 999, fontWeight: 900 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12, marginTop: 16 };
const infoCard = { background: "#F8FCF8", border: "1px solid #D6E8D6", borderRadius: 14, padding: "14px 16px" };
const availabilityCard = { marginTop: 16, background: "linear-gradient(135deg,#FFFFFF,#F5FFF5)", border: "1px solid #D6E8D6", borderRadius: 18, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", boxShadow: "0 14px 34px rgba(26,46,26,.08)" };
const powerIcon = { width: 48, height: 48, borderRadius: 14, display: "grid", placeItems: "center", background: "#E8F5E9", color: "#4CAF50" };
const switchTrack = { border: "none", borderRadius: 999, width: 60, height: 34, padding: 4, cursor: "pointer", display: "flex", alignItems: "center", transition: "background .2s ease" };
const switchThumb = { width: 26, height: 26, borderRadius: "50%", background: "#FFFFFF", display: "block", transition: "transform .2s ease", boxShadow: "0 3px 8px rgba(0,0,0,0.2)" };
const softButton = { display: "inline-flex", alignItems: "center", gap: 8, background: "#E8F5E9", color: "#1A2E1A", border: "none", borderRadius: 12, padding: "11px 14px", fontWeight: 900 };
const logoutButton = { display: "inline-flex", alignItems: "center", gap: 8, background: "#EF4444", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "11px 16px", fontWeight: 900, cursor: "pointer" };
