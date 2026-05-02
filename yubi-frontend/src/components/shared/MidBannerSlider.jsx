import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { midBanners } from "../../data/banners";
import { useWindowSize } from "../../hooks/useWindowSize";

export default function MidBannerSlider({ items = midBanners }) {
  const slides = items?.length ? items : midBanners;
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [slides.length]);

  function goTo(index) {
    stopTimer();
    setCurrent(index);
    startTimer();
  }

  function prev() {
    goTo((current - 1 + slides.length) % slides.length);
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  const banner = slides[current];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: isMobile ? "220px" : "420px",
        overflow: "hidden",
        borderRadius: "0px",
        margin: "0",
      }}
    >
      {slides.map((b, i) => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.7s ease",
            backgroundImage: `url(${b.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: i === current ? 1 : 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: b.overlayColor,
            }}
          />
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          zIndex: 10,
          top: "50%",
          left: isMobile ? "5%" : "8%",
          transform: "translateY(-50%)",
          maxWidth: isMobile ? "75%" : "50%",
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? "1.4rem" : "2.8rem",
            fontWeight: "800",
            color: "#FFFFFF",
            fontFamily: "'Montserrat', sans-serif",
            lineHeight: "1.2",
            marginBottom: isMobile ? "6px" : "12px",
            textShadow: "0 2px 12px rgba(0,0,0,0.3)",
          }}
        >
          {banner.headline}
        </h2>
        <p
          style={{
            fontSize: isMobile ? "12px" : "16px",
            color: "rgba(255,255,255,0.92)",
            marginBottom: isMobile ? "14px" : "24px",
            lineHeight: "1.5",
            textShadow: "0 1px 6px rgba(0,0,0,0.25)",
          }}
        >
          {banner.subheadline}
        </p>
        <button
          type="button"
          onClick={() => navigate(banner.route)}
          style={{
            background: "linear-gradient(135deg, #4CAF50, #388E3C)",
            color: "#FFFFFF",
            border: "none",
            padding: isMobile ? "9px 20px" : "13px 32px",
            borderRadius: "30px",
            fontSize: isMobile ? "12px" : "15px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(76,175,80,0.4)",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          {banner.cta} →
        </button>
      </div>

      <button
        type="button"
        onClick={prev}
        style={{
          position: "absolute",
          left: isMobile ? "8px" : "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          background: "rgba(255,255,255,0.22)",
          backdropFilter: "blur(6px)",
          border: "1.5px solid rgba(255,255,255,0.35)",
          color: "#FFFFFF",
          width: isMobile ? "32px" : "46px",
          height: isMobile ? "32px" : "46px",
          borderRadius: "50%",
          fontSize: isMobile ? "16px" : "22px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        ‹
      </button>

      <button
        type="button"
        onClick={next}
        style={{
          position: "absolute",
          right: isMobile ? "8px" : "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          background: "rgba(255,255,255,0.22)",
          backdropFilter: "blur(6px)",
          border: "1.5px solid rgba(255,255,255,0.35)",
          color: "#FFFFFF",
          width: isMobile ? "32px" : "46px",
          height: isMobile ? "32px" : "46px",
          borderRadius: "50%",
          fontSize: isMobile ? "16px" : "22px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        ›
      </button>

      <div
        style={{
          position: "absolute",
          bottom: isMobile ? "10px" : "18px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          zIndex: 20,
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            style={{
              width: i === current ? (isMobile ? "22px" : "28px") : isMobile ? "7px" : "9px",
              height: isMobile ? "7px" : "9px",
              borderRadius: "10px",
              background: i === current ? "#4CAF50" : "rgba(255,255,255,0.55)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
