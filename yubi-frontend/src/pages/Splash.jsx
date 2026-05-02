import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, UtensilsCrossed } from "lucide-react";
import { useWindowSize } from "../hooks/useWindowSize";
import yubiLogo from "../assets/yubi.png";

export default function Splash() {
  const nav = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [leftHover, setLeftHover] = useState(false);
  const [rightHover, setRightHover] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => nav("/home"), 15000);
    return () => clearTimeout(timer);
  }, [nav]);

  const halfBase = { flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.4s ease", padding: "40px 24px", textAlign: "center" };

  return <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#FFFFFF", display: "flex", flexDirection: isMobile ? "column" : "row" }}>
    <div onClick={() => nav("/home/spices")} onMouseEnter={() => setLeftHover(true)} onMouseLeave={() => setLeftHover(false)} style={{ ...halfBase, background: "linear-gradient(160deg,#F1F8E9,#DCEDC8)", transform: leftHover ? "scale(1.02)" : "scale(1)", boxShadow: leftHover ? "inset 0 0 0 4px rgba(76,175,80,0.5)" : "none" }}>
      <div style={circle("linear-gradient(135deg,#4CAF50,#388E3C)")}><Leaf size={64} color="#FFFFFF" /></div>
      <h1 style={{ fontSize: "clamp(36px,5vw,64px)", color: "#1B5E20", margin: 0 }}>Explore Our Spices</h1>
      <p style={{ fontSize: 18, color: "#1A1A1A", marginTop: 16 }}>Premium quality, farm to table</p>
    </div>
    <div style={{ position: isMobile ? "absolute" : "relative", top: isMobile ? "50%" : "auto", left: isMobile ? "50%" : "auto", transform: isMobile ? "translate(-50%,-50%)" : "none", width: isMobile ? "auto" : 2, background: isMobile ? "transparent" : "linear-gradient(180deg,transparent,#4CAF50,transparent)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
      <div style={{ width: 104, height: 104, borderRadius: "50%", background: "#FFFFFF", border: "3px solid #4CAF50", boxShadow: "0 12px 40px rgba(76,175,80,0.35)", display: "grid", placeItems: "center", padding: 8 }}><img src={yubiLogo} alt="YUBI" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>
    </div>
    <div onClick={() => nav("/home/food")} onMouseEnter={() => setRightHover(true)} onMouseLeave={() => setRightHover(false)} style={{ ...halfBase, background: "linear-gradient(160deg,#FFF8E1,#FFECB3)", transform: rightHover ? "scale(1.02)" : "scale(1)", boxShadow: rightHover ? "inset 0 0 0 4px rgba(255,111,0,0.5)" : "none" }}>
      <div style={circle("linear-gradient(135deg,#FF6F00,#FF8F00)")}><UtensilsCrossed size={60} color="#FFFFFF" /></div>
      <h1 style={{ fontSize: "clamp(36px,5vw,64px)", color: "#E65100", margin: 0 }}>Order Fresh Food</h1>
      <p style={{ fontSize: 18, color: "#1A1A1A", marginTop: 16 }}>Hot meals delivered to your door</p>
    </div>
    <div style={{ position: "absolute", left: 0, bottom: 0, height: 4, background: "rgba(76,175,80,0.15)", width: "100%" }}><div style={{ height: "100%", background: "#4CAF50", animation: "ssCountdown 15s linear forwards" }} /></div>
  </div>;
}

function circle(background) { return { width: 130, height: 130, borderRadius: "50%", background, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 50px -10px rgba(0,0,0,0.28)", marginBottom: 28 }; }
