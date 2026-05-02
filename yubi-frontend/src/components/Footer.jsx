import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useWindowSize } from "../hooks/useWindowSize";
import yubiLogo from "../assets/yubi.png";

const socialLinks = [
  [Facebook, "Facebook", "#"],
  [Instagram, "Instagram", "#"],
  [Twitter, "Twitter", "#"],
  [Youtube, "YouTube", "#"],
];

export default function Footer() {
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  return (
    <footer style={footer}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr repeat(3,1fr)", gap: 28, textAlign: isMobile ? "center" : "left" }}>
        <div>
          <img src={yubiLogo} alt="YUBI" style={{ height: 58, background: "#FFFFFF", borderRadius: 14, padding: 6, margin: isMobile ? "0 auto" : 0 }} />
          <p style={p}>Yubi Foods offers fresh, flavorful dishes and organic spices for a rich, authentic taste.</p>
          <p style={p}>Hello to: <a href="mailto:yubifoods@gmail.com" style={mailLink}>yubifoods@gmail.com</a></p>
        </div>
        <div><h3 style={h}>Quick Links</h3>{[["Home", "/home"], ["Food", "/home/food"], ["Spices", "/home/spices"], ["Grocery", "/grocery"]].map(([label, route]) => <Link key={label} to={route} style={link}>{label}</Link>)}</div>
        <div><h3 style={h}>Company</h3>{[["About", "/about"], ["Blogs", "/blog"], ["Contact", "/contact"], ["Agro Products", "/agro"]].map(([label, route]) => <Link key={label} to={route} style={link}>{label}</Link>)}</div>
        <div>
          <h3 style={h}>Contact</h3>
          <p style={p}>D2/7, Rasulgarh Industrial Estate - 751010, Bhubaneswar, Odisha</p>
          <p style={p}>+91 9439731691</p>
          <h3 style={{ ...h, marginTop: 20 }}>Social Media</h3>
          <div style={{ ...socialWrap, justifyContent: isMobile ? "center" : "flex-start" }}>
            {socialLinks.map(([Icon, label, href]) => <a key={label} href={href} aria-label={label} className="social-icon-link" style={socialIcon}><Icon size={18} /></a>)}
          </div>
        </div>
      </div>
      <div style={copyright}>Copyright © Uptulasoft 2026. All rights reserved.</div>
    </footer>
  );
}

const footer = { background: "linear-gradient(to right, #a8e063, #56ab2f)", color: "#FFFFFF", padding: "50px 24px 0", marginTop: 60, overflowX: "hidden" };
const p = { color: "rgba(255,255,255,.94)", lineHeight: 1.6, fontWeight: 600 };
const h = { color: "#FFFFFF", marginTop: 0, fontWeight: 900 };
const link = { display: "block", color: "rgba(255,255,255,.94)", textDecoration: "none", marginBottom: 10, fontWeight: 700 };
const mailLink = { color: "#FFFFFF", fontWeight: 900 };
const socialWrap = { display: "flex", alignItems: "center", gap: 10 };
const socialIcon = { color: "#FFFFFF", width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(255,255,255,.16)", transition: "transform .18s ease, background .18s ease" };
const copyright = { marginTop: 36, padding: "18px 0", borderTop: "1px solid rgba(255,255,255,.25)", textAlign: "center", color: "#FFFFFF", fontWeight: 700 };
