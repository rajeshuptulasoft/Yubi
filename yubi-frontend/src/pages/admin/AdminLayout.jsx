import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BarChart3, BookOpen, Boxes, ClipboardList, Leaf, Menu, MessageSquare, Package, ShoppingBag, Truck, Users } from "lucide-react";
import { useWindowSize } from "../../hooks/useWindowSize";
import yubiLogo from "../../assets/yubi.png";

const items = [
  [BarChart3, "Dashboard", "/admin/dashboard"],
  [ShoppingBag, "Food Orders", "/admin/orders/food"],
  [Package, "Spice Orders", "/admin/orders/spices"],
  [Users, "User Data", "/admin/users"],
  [ClipboardList, "Order Details Food", "/admin/order-details/food"],
  [ClipboardList, "Order Details Spices", "/admin/order-details/spices"],
  [Boxes, "Food Products", "/admin/products/food"],
  [Leaf, "Spice Products", "/admin/products/spices"],
  [BookOpen, "Blog Management", "/admin/blog"],
  [Truck, "Delivery Partners", "/admin/partners"],
  [MessageSquare, "Enquiries & Messages", "/admin/enquiries"],
];

export default function AdminLayout() {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [isOpen, setIsOpen] = useState(!isMobile);
  const nav = useNavigate();
  useEffect(() => setIsOpen(!isMobile), [isMobile]);
  const logout = () => { localStorage.removeItem("yubiUser"); nav("/admin"); };
  const sideWidth = isOpen ? 250 : 72;
  return <div style={{ color: "#1A1A1A" }}>
    <header style={{ background: "linear-gradient(135deg,#1A2E1A,#2E7D32)", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: isMobile ? "0 12px" : "0 22px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, boxShadow: "0 10px 30px rgba(26,46,26,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14, minWidth: 0 }}><button onClick={() => setIsOpen(!isOpen)} style={hamburger}><Menu size={24} /></button><img src={yubiLogo} alt="YUBI Admin" style={{ height: 46, background: "#FFFFFF", borderRadius: 12, padding: 4, flexShrink: 0 }} /><strong style={{ color: "#FFFFFF", fontSize: 18, whiteSpace: "nowrap" }}>Admin</strong></div>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14, flexShrink: 0 }}>{!isMobile && <span style={{ color: "#FFFFFF", fontSize: 14 }}>Welcome, Admin</span>}<button onClick={logout} style={{ background: "#EF4444", color: "#FFFFFF", padding: isMobile ? "8px 11px" : "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 800 }}>Logout</button></div>
    </header>
    {isMobile && isOpen && <div onClick={() => setIsOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 998 }} />}
    {(!isMobile || isOpen) && <aside style={{ width: sideWidth, background: "#FFFFFF", borderRight: "2px solid #D6E8D6", height: "calc(100vh - 68px)", position: "fixed", left: 0, top: 68, paddingTop: 16, boxShadow: "8px 0 24px rgba(26,46,26,0.08)", zIndex: 999, transition: "width .3s ease" }}>{items.map(([Icon, label, route]) => <NavLink key={route} to={route} title={label} onClick={() => isMobile && setIsOpen(false)} style={({ isActive }) => ({ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", margin: "4px 10px", borderRadius: 12, textDecoration: "none", color: isActive ? "#4CAF50" : "#1A2E1A", background: isActive ? "#E8F5E9" : "#FFFFFF", borderLeft: isActive ? "4px solid #4CAF50" : "4px solid transparent", fontWeight: 800 })}><Icon size={20} />{isOpen && <span>{label}</span>}</NavLink>)}</aside>}
    <main style={{ marginLeft: isMobile ? 0 : sideWidth, marginTop: 68, padding: isMobile ? 16 : 28, background: "linear-gradient(135deg,#F9FBF9,#FFFFFF)", minHeight: "calc(100vh - 68px)", transition: "margin-left .3s ease" }}><Outlet /></main>
  </div>;
}
const hamburger = { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFFFFF", width: 42, height: 42, borderRadius: 12, cursor: "pointer", display: "grid", placeItems: "center" };
