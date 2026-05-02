import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { ClipboardList, Home, Menu, Package, UserRound } from "lucide-react";
import { useWindowSize } from "../../hooks/useWindowSize";
import { getCurrentDeliveryPartner, isPartnerOnline, updateCurrentDeliveryPartnerStatus } from "../../utils/deliveryState";
import yubiLogo from "../../assets/yubi.png";

const items = [[Home, "Dashboard", "/delivery-partner/dashboard"], [Package, "Active", "/delivery-partner/active"], [ClipboardList, "History", "/delivery-partner/history"], [UserRound, "Profile", "/delivery-partner/profile"]];

export default function DeliveryLayout() {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [partner, setPartner] = useState(() => getCurrentDeliveryPartner());
  const online = isPartnerOnline(partner);

  useEffect(() => setIsOpen(!isMobile), [isMobile]);
  useEffect(() => {
    const syncPartner = () => setPartner(getCurrentDeliveryPartner());
    window.addEventListener("storage", syncPartner);
    window.addEventListener("focus", syncPartner);
    window.addEventListener("yubiDeliveryPartnersUpdated", syncPartner);
    return () => {
      window.removeEventListener("storage", syncPartner);
      window.removeEventListener("focus", syncPartner);
      window.removeEventListener("yubiDeliveryPartnersUpdated", syncPartner);
    };
  }, []);

  const toggleOnline = () => setPartner(updateCurrentDeliveryPartnerStatus(!online));
  const sideWidth = isOpen ? 250 : 76;

  return <div style={{ color: "#1A1A1A" }}>
    <header style={header}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {!isMobile && <button onClick={() => setIsOpen(!isOpen)} style={hamburger} aria-label={isOpen ? "Close delivery menu" : "Open delivery menu"}><Menu size={23} /></button>}
        <img src={yubiLogo} alt="YUBI Delivery" style={{ height: 46, background: "#FFFFFF", borderRadius: 12, padding: 4 }} />
        <strong style={{ color: "#FFFFFF", fontSize: 18 }}>Delivery</strong>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: online ? "#7CFC00" : "#D1D5DB", boxShadow: online ? "0 0 0 5px rgba(124,252,0,0.18)" : "none" }} />
        <span style={{ color: "#FFFFFF", fontSize: 13, fontWeight: 800 }}>{online ? "Online" : "Offline"}</span>
        {!isMobile && <strong style={{ color: "#FFFFFF", fontWeight: 800 }}>{partner?.name?.split(" ")[0] || "Partner"}</strong>}
      </div>
    </header>
    {!isMobile && <aside style={{ ...sidebar, width: sideWidth }}>
      <div>
        {items.map(([Icon, label, route]) => <NavLink key={route} to={route} title={label} style={({ isActive }) => navItem(isActive)}><Icon size={20} />{isOpen && <span>{label}</span>}</NavLink>)}
      </div>
      {isOpen && <StatusPanel partner={partner} online={online} onToggle={toggleOnline} />}
    </aside>}
    <main style={{ marginLeft: isMobile ? 0 : sideWidth, marginTop: 68, marginBottom: isMobile ? 72 : 0, padding: isMobile ? 16 : 28, minHeight: "calc(100vh - 68px)", background: "linear-gradient(135deg,#F5FAF6,#FFFFFF)", transition: "margin-left .3s ease" }}><Outlet /></main>
    {isMobile && <nav style={bottomNav}>{items.map(([Icon, label, route]) => <NavLink key={route} to={route} style={({ isActive }) => bottomNavItem(isActive)}><Icon size={22} />{label}</NavLink>)}</nav>}
  </div>;
}

function StatusPanel({ partner, online, onToggle }) {
  return <div style={statusPanel}>
    <div>
      <div style={{ color: "#6B7280", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>Profile Status</div>
      <strong style={{ color: "#1A2E1A", display: "block", marginTop: 4 }}>{partner?.name || "Delivery Partner"}</strong>
    </div>
    <button onClick={onToggle} style={{ ...switchTrack, background: online ? "#4CAF50" : "#9CA3AF" }} aria-label="Toggle online status">
      <span style={{ ...switchThumb, transform: online ? "translateX(22px)" : "translateX(0)" }} />
    </button>
    <div style={{ color: online ? "#2E7D32" : "#6B7280", fontSize: 13, fontWeight: 900 }}>{online ? "Online and visible to admin" : "Offline for admin"}</div>
  </div>;
}

const header = { background: "linear-gradient(135deg,#286D31,#4CAF50)", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 1002, boxShadow: "0 10px 30px rgba(26,46,26,0.18)" };
const hamburger = { background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", color: "#FFFFFF", width: 42, height: 42, borderRadius: 12, cursor: "pointer", display: "grid", placeItems: "center" };
const sidebar = { position: "fixed", top: 68, left: 0, height: "calc(100vh - 68px)", background: "#FFFFFF", borderRight: "2px solid #D6E8D6", padding: "16px 0", boxShadow: "8px 0 24px rgba(26,46,26,0.08)", transition: "width .3s ease, transform .3s ease", display: "flex", flexDirection: "column", justifyContent: "space-between" };
const navItem = (isActive) => ({ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", margin: "4px 10px", borderRadius: 12, color: isActive ? "#4CAF50" : "#1A2E1A", background: isActive ? "#E8F5E9" : "#FFFFFF", textDecoration: "none", fontWeight: 800, borderLeft: isActive ? "4px solid #4CAF50" : "4px solid transparent" });
const bottomNav = { position: "fixed", bottom: 0, left: 0, right: 0, height: 68, background: "#FFFFFF", borderTop: "2px solid #D6E8D6", display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 1001, boxShadow: "0 -10px 24px rgba(26,46,26,0.08)" };
const bottomNavItem = (isActive) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 62, color: isActive ? "#4CAF50" : "#6B7280", textDecoration: "none", fontSize: 11, fontWeight: 900 });
const statusPanel = { margin: "10px", padding: 14, borderRadius: 16, border: "1px solid #D6E8D6", background: "linear-gradient(180deg,#F8FCF8,#FFFFFF)", boxShadow: "0 10px 24px rgba(26,46,26,0.08)" };
const switchTrack = { border: "none", borderRadius: 999, width: 52, height: 30, padding: 4, margin: "12px 0 8px", cursor: "pointer", display: "flex", alignItems: "center", transition: "background .2s ease" };
const switchThumb = { width: 22, height: 22, borderRadius: "50%", background: "#FFFFFF", display: "block", transition: "transform .2s ease", boxShadow: "0 3px 8px rgba(0,0,0,0.2)" };
