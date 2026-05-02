// YUBI — centralized light theme tokens (used inline across the app)
export const theme = {
  colors: {
    // Surfaces
    bg: "#FFFFFF",
    surface: "#F9FBF9",
    surfaceAlt: "#F1F8F1",
    // Brand
    primary: "#4CAF50",
    primaryDark: "#388E3C",
    primaryLight: "#A5D6A7",
    accent: "#FF6F00",      // amber CTAs (kept name for back-compat)
    accent2: "#FF8F00",
    // Text
    text: "#1A2E1A",
    textDim: "#5C7A5C",
    // States
    success: "#2E7D32",
    error: "#D32F2F",
    border: "#D6E8D6",
  },
  fonts: {
    heading: "'Montserrat', 'Poppins', 'Inter', system-ui, -apple-system, sans-serif",
    body: "'Montserrat', 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    mono: "'Montserrat', 'JetBrains Mono', ui-monospace, monospace",
  },
  // Primary brand gradient (green) — used as default `gradient`
  gradient: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
  gradientAccent: "linear-gradient(135deg, #FF6F00 0%, #FF8F00 100%)",
  gradientSoft: "linear-gradient(135deg, rgba(76,175,80,0.12) 0%, rgba(56,142,60,0.12) 100%)",
  shadow: "0 10px 30px -10px rgba(76, 175, 80, 0.35)",
  shadowSoft: "0 8px 24px rgba(76, 175, 80, 0.12)",
  glass: {
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(76, 175, 80, 0.18)",
  },
  radius: { sm: "10px", md: "14px", lg: "20px", xl: "24px", pill: "999px" },
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};

export const fmtPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
