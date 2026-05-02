import { theme } from "@/utils/theme";

export function Button({ children, variant = "primary", size = "md", style, className = "", ...props }) {
  const sizes = {
    sm: { padding: "8px 16px", fontSize: 14, height: 36 },
    md: { padding: "12px 22px", fontSize: 15, height: 44 },
    lg: { padding: "16px 32px", fontSize: 16, height: 54 },
    xl: { padding: "18px 36px", fontSize: 17, height: 60 },
  };
  const variants = {
    primary: { background: theme.gradient, color: "#0D0D0D", boxShadow: theme.shadow, fontWeight: 600 },
    ghost: { background: "transparent", color: theme.colors.text, border: `1px solid ${theme.colors.border}`, fontWeight: 400 },
    outline: { background: "transparent", color: theme.colors.accent, border: `1.5px solid ${theme.colors.accent}`, fontWeight: 600 },
    glass: { background: "rgba(255,255,255,0.06)", color: theme.colors.text, backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", fontWeight: 400 },
    danger: { background: theme.colors.error, color: "#fff", fontWeight: 600 },
    success: { background: theme.colors.success, color: "#0D0D0D", fontWeight: 600 },
  };
  return (
    <button
      className={`ss-hover-lift ${variant === "primary" ? "standard-add-btn" : ""} ${className}`.trim()}
      style={{
        ...sizes[size],
        ...variants[variant],
        borderRadius: theme.radius.md,
        cursor: "pointer",
        fontFamily: "Montserrat, sans-serif",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        outline: "none",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, style, glass = true, ...props }) {
  return (
    <div
      style={{
        ...(glass ? theme.glass : { background: theme.colors.surface }),
        borderRadius: theme.radius.lg,
        border: glass ? theme.glass.border : `1px solid ${theme.colors.border}`,
        padding: 20,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ children, color = theme.colors.accent, style }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        borderRadius: theme.radius.pill,
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        fontSize: 11,
        fontFamily: theme.fonts.mono,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Input({ style, ...props }) {
  return (
    <input
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: theme.radius.sm,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.surfaceAlt,
        color: theme.colors.text,
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 400,
        fontSize: 15,
        outline: "none",
        transition: theme.transition,
        ...style,
      }}
      onFocus={(e) => (e.target.style.borderColor = theme.colors.accent)}
      onBlur={(e) => (e.target.style.borderColor = theme.colors.border)}
      {...props}
    />
  );
}

export function Loader({ size = 40 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
      <div
        className="ss-spin"
        style={{
          width: size, height: size, borderRadius: "50%",
          border: `3px solid ${theme.colors.border}`,
          borderTopColor: theme.colors.accent,
        }}
      />
    </div>
  );
}

export function Skeleton({ height = 20, width = "100%", borderRadius = 8, style }) {
  return <div className="ss-shimmer" style={{ height, width, borderRadius, ...style }} />;
}

export function GradientText({ children, style }) {
  return (
    <span style={{
      background: theme.gradient,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      ...style,
    }}>{children}</span>
  );
}

export function Modal({ open, onClose, children, maxWidth = 500 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="ss-fade-in"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        padding: 16, overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ss-fade-up"
        style={{
          ...theme.glass,
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(20,20,20,0.95)",
          border: `1px solid ${theme.colors.accent}33`,
          borderRadius: theme.radius.lg,
          padding: 28,
          maxWidth, width: "100%",
          maxHeight: "90vh", overflow: "auto", scrollbarWidth: "none", msOverflowStyle: "none",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(244,166,35,0.1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
