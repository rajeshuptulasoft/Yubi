import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { theme } from "@/utils/theme";

export default function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      style={{
        position: "fixed", bottom: 92, right: 28, zIndex: 90,
        width: 48, height: 48, borderRadius: "50%",
        background: theme.gradient, color: "#fff", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: theme.shadow, transition: theme.transition,
      }}>
      <ArrowUp size={20} />
    </button>
  );
}
