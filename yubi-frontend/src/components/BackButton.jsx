import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { theme } from "@/utils/theme";
import { useState } from "react";

export default function BackButton({ to, label }) {
  const nav = useNavigate();
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => (to ? nav(to) : nav(-1))}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Go back"
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: label ? "8px 14px 8px 8px" : 0,
        width: label ? "auto" : 44, height: 44,
        borderRadius: 999,
        background: hover ? theme.colors.primary : "#FFFFFF",
        color: hover ? "#FFFFFF" : theme.colors.primaryDark,
        border: `2px solid ${theme.colors.primary}`,
        cursor: "pointer",
        fontFamily: theme.fonts.body, fontWeight: 600, fontSize: 14,
        transition: theme.transition,
        justifyContent: "center",
        boxShadow: hover ? theme.shadow : "none",
      }}
    >
      <ArrowLeft size={18} strokeWidth={2.5} />
      {label && <span>{label}</span>}
    </button>
  );
}
