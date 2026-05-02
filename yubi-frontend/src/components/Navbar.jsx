import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Facebook, Instagram, MapPin, Menu, ShoppingCart, Twitter, X, Youtube } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWindowSize } from "../hooks/useWindowSize";
import AuthModal from "./ui/AuthModal";
import yubiLogo from "../assets/yubi.png";

const links = [
  { to: "/home", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/home/food", label: "Food" },
  { to: "/home/spices", label: "Spices" },
  { to: "/gallery", label: "Gallery" },
  { to: "/grocery", label: "Grocery" },
  { to: "/agro", label: "Agro Products" },
  { to: "/blog", label: "Blogs" },
  { to: "/contact", label: "Contact" },
];

const socialLinks = [
  [Facebook, "Facebook", "#"],
  [Instagram, "Instagram", "#"],
  [Twitter, "Twitter", "#"],
  [Youtube, "YouTube", "#"],
];

export default function Navbar() {
  const { count } = useCart();
  const { user, logout, showAuthModal, setShowAuthModal, authMode, setAuthMode, openAuthModal } = useAuth();
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const isMobile = width <= 1024;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const close = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  const openAuth = (mode) => { openAuthModal(mode); setIsMenuOpen(false); };
  const navLinkStyle = ({ isActive }) => ({ fontFamily: "Montserrat, sans-serif", color: isActive ? "#4CAF50" : "#000000", textDecoration: "none", fontWeight: 400, padding: "8px 2px", borderBottom: isActive ? "3px solid #4CAF50" : "3px solid transparent" });

  return (
    <header style={headerShell}>
      <div style={topStrip}>
        <div style={topStripInner}>
          <span style={locationText}><MapPin size={14} /> Bhubaneswar, India</span>
          <div style={socialWrap}>
            {socialLinks.map(([Icon, label, href]) => (
              <a key={label} href={href} aria-label={label} className="social-icon-link" style={socialIcon}><Icon size={15} /></a>
            ))}
          </div>
        </div>
      </div>
      <div style={navWrap}>
        <Link to="/home" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}><img src={yubiLogo} alt="YUBI" style={{ height: width <= 520 ? 46 : 52, width: "auto", objectFit: "contain" }} /></Link>
        {!isMobile && <nav style={{ display: "flex", gap: 18, alignItems: "center" }}>{links.map((link) => <NavLink key={link.to} to={link.to} end={link.to === "/home"} style={navLinkStyle}>{link.label}</NavLink>)}</nav>}
        {!isMobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? <><CartLink count={count} /><div ref={dropdownRef} style={{ position: "relative" }}><button onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }} style={avatarStyle}>{(user.name || "U")[0].toUpperCase()}</button>{profileOpen && <div style={dropdownStyle}><div style={nameItemStyle}>{user.name}<div style={{ color: "#888888", fontSize: 12, fontWeight: 500, marginTop: 4 }}>{user.email}</div></div><DropItem onClick={() => { navigate("/profile"); setProfileOpen(false); }}>My Profile</DropItem><DropItem onClick={() => { navigate("/orders"); setProfileOpen(false); }}>My Orders</DropItem><DropItem danger onClick={() => { logout(); setProfileOpen(false); }}>Logout</DropItem></div>}</div></> : <><button onClick={() => openAuth("login")} style={loginButton}>Login</button><button onClick={() => openAuth("register")} style={registerButton}>Register</button></>}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user && <CartLink count={count} />}
            <button onClick={() => setIsMenuOpen(true)} style={hamburgerButton} aria-label="Open menu"><Menu size={28} /></button>
          </div>
        )}
      </div>

      {isMobile && isMenuOpen && (
        <>
          <div onClick={() => setIsMenuOpen(false)} style={mobileBackdrop} />
          <div style={mobilePanel}>
            <button onClick={() => setIsMenuOpen(false)} style={mobileClose} aria-label="Close menu"><X size={26} /></button>
            <img src={yubiLogo} alt="YUBI" style={{ height: 62, margin: "0 auto 18px", display: "block" }} />
            <nav style={{ display: "grid", gap: 6 }}>
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === "/home"} onClick={() => setIsMenuOpen(false)} style={({ isActive }) => ({ ...mobileLink, background: isActive ? "#F1F8F1" : "#FFFFFF", color: isActive ? "#2E7D32" : "#1A1A1A" })}>{link.label}</NavLink>
              ))}
            </nav>
            <div style={{ paddingTop: 16, display: "grid", gap: 10 }}>
              {user ? <><button onClick={() => { navigate("/profile"); setIsMenuOpen(false); }} style={drawerButton}>My Profile</button><button onClick={() => { logout(); setIsMenuOpen(false); }} style={{ ...drawerButton, color: "#EF4444" }}>Logout</button></> : <><button onClick={() => openAuth("login")} style={loginButton}>Login</button><button onClick={() => openAuth("register")} style={{ ...registerButton, marginLeft: 0 }}>Register</button></>}
            </div>
          </div>
        </>
      )}
      {showAuthModal && <AuthModal initialTab={authMode} onClose={() => setShowAuthModal(false)} setMode={setAuthMode} />}
    </header>
  );
}

function CartLink({ count }) {
  return <Link to="/cart" style={{ position: "relative", color: "#000000", width: 42, height: 42, display: "grid", placeItems: "center", border: "1px solid #D6E8D6", borderRadius: 12, background: "#FFFFFF" }}><ShoppingCart size={22} />{count > 0 && <span style={{ position: "absolute", top: -8, right: -8, background: "#4CAF50", color: "#FFFFFF", borderRadius: "50%", minWidth: 20, height: 20, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{count}</span>}</Link>;
}

function DropItem({ children, danger, onClick }) {
  return <button onClick={onClick} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", fontSize: 14, color: danger ? "#EF4444" : "#1A1A1A", background: "#FFFFFF", border: "none", cursor: "pointer" }}>{children}</button>;
}

const headerShell = { position: "sticky", top: 0, zIndex: 3000, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(16px)", borderBottom: "1px solid #D6E8D6", boxShadow: "0 6px 20px rgba(26,46,26,0.06)" };
const topStrip = { minHeight: 34, background: "linear-gradient(to right, #a8e063, #56ab2f)", color: "#FFFFFF" };
const topStripInner = { maxWidth: 1320, margin: "0 auto", minHeight: 34, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "0 20px" };
const locationText = { fontSize: 13, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 5 };
const socialWrap = { display: "flex", alignItems: "center", gap: 10 };
const socialIcon = { color: "#FFFFFF", width: 26, height: 26, display: "grid", placeItems: "center", borderRadius: "50%", transition: "transform .18s ease, background .18s ease", background: "rgba(255,255,255,.14)" };
const navWrap = { maxWidth: 1320, margin: "0 auto", minHeight: 72, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", gap: 18 };
const loginButton = { background: "#FFFFFF", color: "#4CAF50", border: "2px solid #4CAF50", padding: "8px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" };
const registerButton = { background: "linear-gradient(135deg, #4CAF50, #388E3C)", color: "#FFFFFF", border: "none", padding: "8px 20px", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", marginLeft: 8 };
const hamburgerButton = { border: "1px solid #D6E8D6", background: "#FFFFFF", color: "#1A2E1A", width: 44, height: 44, borderRadius: 12, cursor: "pointer", display: "grid", placeItems: "center" };
const avatarStyle = { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #4CAF50, #388E3C)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16, cursor: "pointer", position: "relative" };
const dropdownStyle = { position: "absolute", top: 50, right: 0, background: "#FFFFFF", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1px solid #E8F5E9", minWidth: 180, zIndex: 3200, overflow: "hidden", animation: "slideDown 0.2s ease" };
const nameItemStyle = { padding: "14px 16px 8px", fontSize: 14, fontWeight: 800, color: "#1A2E1A", borderBottom: "1px solid #F0F0F0" };
const mobileBackdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.48)", zIndex: 3100 };
const mobilePanel = { position: "fixed", top: 0, left: 0, right: 0, maxHeight: "92vh", overflowY: "auto", background: "#FFFFFF", zIndex: 3101, boxShadow: "0 18px 40px rgba(0,0,0,0.2)", padding: "24px 18px 22px", animation: "slideDown 0.22s ease" };
const mobileClose = { position: "absolute", top: 18, right: 18, border: "none", background: "#E8F5E9", color: "#1A2E1A", borderRadius: "50%", width: 40, height: 40, display: "grid", placeItems: "center" };
const mobileLink = { fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", display: "block", textAlign: "center", padding: "13px 16px", fontSize: 17, fontWeight: 900, textDecoration: "none", borderRadius: 12 };
const drawerButton = { fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", border: "1px solid #D6E8D6", background: "#FFFFFF", color: "#1A1A1A", borderRadius: 10, padding: "12px 14px", fontWeight: 900, cursor: "pointer" };
