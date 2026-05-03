import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { products, banners } from "../../data";
import { useCart } from "../../context/CartContext";
import { useWindowSize } from "../../hooks/useWindowSize";
import { foodAPI, getApiErrorMessage } from "../../lib/api";
import { toast } from "sonner";

export const colors = { green: "#4CAF50", dark: "#1A2E1A", text: "#1A1A1A", border: "#D6E8D6" };
export const fontSans = "'Montserrat', sans-serif";
export const heading = { color: colors.dark, fontSize: 34, margin: "0 0 22px", fontWeight: 800, fontFamily: fontSans };

export function responsiveHeading(width, base = heading) {
  if (width <= 480) return { ...base, fontSize: 22, margin: "0 0 14px", lineHeight: 1.25 };
  if (width <= 768) return { ...base, fontSize: 26, margin: "0 0 18px", lineHeight: 1.3 };
  return base;
}
export const greenButton = { background: "linear-gradient(135deg, #4CAF50, #388E3C)", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "10px 18px", cursor: "pointer", fontWeight: 800, boxShadow: "0 4px 14px rgba(76,175,80,0.28)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 };

export function BannerSlider({ items = banners }) {
  const [active, setActive] = useState(0);
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  useEffect(() => {
    const id = setInterval(() => setActive((value) => (value + 1) % items.length), 3500);
    return () => clearInterval(id);
  }, [items.length]);
  const banner = items[active];
  return <section style={{ position: "relative", height: isMobile ? 220 : 420, overflow: "hidden", background: "#101810", display: "flex", alignItems: "center", padding: isMobile ? "24px 16px" : "80px 40px", marginTop: "22px" }}>
    <img src={banner.image} alt={banner.headline} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
    <div style={{
      position: "absolute",
      inset: 0,
      background: isMobile
        ? "linear-gradient(90deg, rgba(7, 10, 7, 0.82) 0%, rgba(7, 10, 7, 0.58) 62%, rgba(7, 10, 7, 0.22) 100%)"
        : "linear-gradient(90deg, rgba(7, 10, 7, 0.78) 0%, rgba(7, 10, 7, 0.56) 42%, rgba(7, 10, 7, 0.22) 72%, rgba(7, 10, 7, 0.06) 100%)",
    }} />
    <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", width: "100%" }}>
      <h1 style={{ color: "#ffffff", fontSize: isMobile ? 32 : 60, margin: 0, fontWeight: 900, maxWidth: 720 }}>{banner.headline}</h1>
      <p style={{ color: "#ffffff", fontSize: isMobile ? 15 : 21, margin: "12px 0 24px", maxWidth: 560, fontWeight: 700 }}>{banner.subheadline}</p>
      <Link to={banner.route} style={{ background: colors.green, color: "#FFFFFF", padding: "12px 22px", borderRadius: 8, textDecoration: "none", fontWeight: 800 }}>{banner.cta}</Link>
    </div>
  </section>;
}

/** Category tiles — width scales down on small screens so the marquee fits the viewport */
function categoryCardShellForWidth(w) {
  const cardW = w <= 400 ? 148 : w <= 520 ? 168 : w <= 768 ? 188 : 220;
  const imgH = w <= 400 ? 220 : w <= 768 ? 260 : 318;
  const minH = imgH + 72;
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: `${cardW}px`,
    minWidth: `${cardW}px`,
    minHeight: `${minH}px`,
    borderRadius: "18px",
    background: "#FFFFFF",
    boxShadow: "0 3px 16px rgba(76, 175, 80, 0.09)",
    border: "1.5px solid #E8F5E9",
    cursor: "pointer",
    padding: "0",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
    flexShrink: 0,
    position: "relative",
    overflow: "hidden",
    _imgH: imgH,
  };
}

export function CategoryImageSection({ title = "Categories", items, titleInCard = false, titleRight, borderless = false }) {
  const { width } = useWindowSize();
  const [hovered, setHovered] = useState(null);
  const trackRef = useRef(null);
  const loopItems = buildSeamlessMarqueeItems(items, width <= 768 ? 8 : 14);
  const displayItems = [...loopItems, ...loopItems];
  return <section style={{ padding: width <= 768 ? "28px 16px" : "60px 40px", maxWidth: 1280, margin: "0 auto" }}>
    {titleInCard
      ? <div className={`category-section-title-card${borderless ? " category-section-title-card--plain" : ""}`}>
        <div className="category-section-title-copy">
          <h2 style={{ ...responsiveHeading(width), margin: 0 }}>{title}</h2>
        </div>
        <div className="category-section-title-media">
          {titleRight}
        </div>
      </div>
      : <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <h2 style={{ ...responsiveHeading(width), margin: 0 }}>{title}</h2>
        {titleRight}
      </div>}
    <div
      className="category-scroll"
      style={{
        overflow: "hidden",
        width: "100%",
        padding: "8px 0 16px 0",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
      onMouseEnter={() => {
        if (trackRef.current) trackRef.current.style.animationPlayState = "paused";
      }}
      onMouseLeave={() => {
        if (trackRef.current) trackRef.current.style.animationPlayState = "running";
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          width: "max-content",
          padding: "0 4px",
          animation: "autoScrollLeft 42s linear infinite",
          willChange: "transform",
        }}
      >
        {displayItems.map((item, index) => {
          const isH = hovered === `${item.name}-${index}`;
          const shell = categoryCardShellForWidth(width);
          const imgH = shell._imgH;
          const { _imgH: _drop, ...shellStyle } = shell;
          return <Link
            key={`${item.name}-${index}`}
            to={item.route || "#"}
            onClick={(event) => {
              if (typeof item.onClick === "function") {
                event.preventDefault();
                item.onClick();
              }
            }}
            onMouseEnter={() => setHovered(`${item.name}-${index}`)}
            onMouseLeave={() => setHovered(null)}
            style={{
              ...shellStyle,
              textDecoration: "none",
              transform: isH ? "translateY(-5px)" : "translateY(0)",
              boxShadow: isH ? "0 12px 32px rgba(76,175,80,0.16)" : "0 3px 16px rgba(76, 175, 80, 0.09)",
              border: borderless ? "none" : isH ? "1.5px solid #4CAF50" : "1.5px solid #E8F5E9",
            }}
          >
            <div style={{
              width: "100%",
              height: `${imgH}px`,
              minHeight: `${imgH}px`,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#101810",
              overflow: "hidden",
              position: "relative",
            }}>
              <img
                src={item.image}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: item.imageFit || "cover",
                  objectPosition: item.imagePosition || "center",
                  transform: isH ? "scale(1.08)" : "scale(1)",
                  transition: "transform 0.32s ease",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.24))",
                }}
              />
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: width <= 520 ? "8px 8px 10px" : "10px 12px 12px" }}>
              <span style={{
                fontSize: width <= 520 ? 13 : 15,
                fontWeight: "800",
                color: "#1A2E1A",
                textAlign: "center",
                fontFamily: fontSans,
                letterSpacing: "0.2px",
                lineHeight: "1.25",
                wordBreak: "break-word",
              }}>{item.name}</span>
            </div>
          </Link>;
        })}
      </div>
    </div>
  </section>;
}

export function MealImageGroupsSection({ groups, title = "Fresh picks & platters" }) {
  const { width } = useWindowSize();
  const tileMin = width <= 480 ? 200 : width <= 768 ? 220 : 248;
  return (
    <section style={{ padding: width <= 768 ? "24px 16px 0" : "32px 40px 0", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <h2 style={{ ...responsiveHeading(width), marginBottom: 18 }}>{title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: width <= 768 ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: width <= 480 ? 12 : 16 }}>
        {groups.map((group) => (
          <Link
            key={group.title}
            to={group.to || "#"}
            onClick={(event) => {
              if (typeof group.onClick === "function") {
                event.preventDefault();
                group.onClick();
              }
            }}
            style={{
              minHeight: tileMin,
              borderRadius: 12,
              overflow: "hidden",
              background: "#101810",
              boxShadow: "0 12px 30px rgba(26,46,26,0.14)",
              position: "relative",
              display: "block",
            }}
          >
            <img
              src={group.images[0]}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                minHeight: tileMin,
                maxHeight: width <= 768 ? 320 : "none",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.58))" }} />
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 18 }}>
              <div style={{ color: "#FFFFFF", fontSize: width <= 768 ? 22 : 26, fontWeight: 900, fontFamily: fontSans, textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
                {group.title}
              </div>
              <div style={{ marginTop: 5, color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 700 }}>
                {group.subtitle}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function productCardShellForWidth(w) {
  const narrow = w <= 768;
  return {
    width: narrow ? "100%" : "220px",
    minWidth: narrow ? "0" : "220px",
    maxWidth: narrow ? "100%" : "220px",
    minHeight: narrow ? "min-content" : "405px",
    background: "#FFFFFF",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 3px 16px rgba(76, 175, 80, 0.09)",
    border: "1.5px solid #E8F5E9",
    cursor: "pointer",
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
    flexShrink: narrow ? 1 : 0,
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  };
}

function productMediaWrapForWidth(w) {
  const h = w <= 480 ? 140 : w <= 768 ? 150 : 160;
  return {
    width: "100%",
    height: `${h}px`,
    minHeight: `${h}px`,
    maxHeight: `${h}px`,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7fbf7",
  };
}

const productImgStyle = {
  maxWidth: "100%",
  maxHeight: "100%",
  width: "auto",
  height: "auto",
  objectFit: "contain",
  objectPosition: "center",
  display: "block",
};

const productBodyStyle = {
  padding: "12px 14px 14px 14px",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
};

const SPICE_GRAM_OPTIONS = ["50g", "100g", "150g", "200g", "250g", "500g", "1kg"];

function normalizeCategory(value) {
  return String(value || "").trim().toLowerCase();
}

function isSpiceCategory(value) {
  const category = normalizeCategory(value);
  return category === "spice" || category === "spices" || category.includes("spice");
}

function canSubmitProductEnquiryCategory(value) {
  return isSpiceCategory(value) || normalizeCategory(value) === "grocery";
}

function defaultSpiceGrams(unit) {
  if (!unit || typeof unit !== "string") return "200g";
  const kg = unit.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (kg) {
    const label = `${parseFloat(kg[1])}kg`;
    return SPICE_GRAM_OPTIONS.includes(label) ? label : "1kg";
  }
  const g = unit.match(/(\d+)\s*g/i);
  if (g) {
    const label = `${g[1]}g`;
    return SPICE_GRAM_OPTIONS.includes(label) ? label : "200g";
  }
  return "200g";
}

const spiceGramSelectStyle = {
  width: "100%",
  height: "30px",
  boxSizing: "border-box",
  fontSize: "11px",
  fontWeight: 600,
  border: "1px solid #C8E6C9",
  borderRadius: "8px",
  padding: "0 8px",
  color: "#1A2E1A",
  background: "#FAFFF9",
  cursor: "pointer",
  flexShrink: 0,
  fontFamily: fontSans,
};

const addToCartBtnStyle = {
  flex: 1,
  padding: "9px 0",
  background: "linear-gradient(135deg, #4CAF50, #388E3C)",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  fontFamily: fontSans,
  boxShadow: "0 3px 10px rgba(76,175,80,0.25)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

export function ProductCard({ product }) {
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [hover, setHover] = useState(false);
  const category = normalizeCategory(product.category);
  const isSpice = isSpiceCategory(category);
  const isGrocery = category === "grocery";
  const needsGrams = isSpice || isGrocery;
  const showEnquiryAndAdd = canSubmitProductEnquiryCategory(product.category);
  const rating = product.rating ?? 4.7;
  const reviewCount = product.reviews ?? 0;
  const initialGrams = useMemo(() => defaultSpiceGrams(product.unit), [product.id, product.unit]);
  const [grams, setGrams] = useState(initialGrams);
  useEffect(() => {
    setGrams(defaultSpiceGrams(product.unit));
  }, [product.id, product.unit]);

  const pushCart = () => {
    const key = needsGrams ? `${product.id}::${grams}` : String(product.id);
    addItem({
      key,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      variant: needsGrams ? grams : undefined,
      grams: needsGrams ? grams : undefined,
    });
  };

  return <div
    onClick={() => navigate(`/product/${product.id}`)}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    style={{
      ...productCardShellForWidth(width),
      transform: !isMobile && hover ? "translateY(-5px)" : "translateY(0)",
      boxShadow: hover ? "0 12px 32px rgba(76,175,80,0.16)" : "0 3px 16px rgba(76, 175, 80, 0.09)",
    }}
  >
    <div style={productMediaWrapForWidth(width)}>
      <img src={product.image} alt={product.name} style={productImgStyle} />
    </div>
    <div style={productBodyStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
        <span style={{ fontSize: "11px" }}>⭐</span>
        <span style={{ fontSize: "12px", color: "#5C7A5C", fontWeight: 600 }}>{rating}</span>
        <span style={{ fontSize: "11px", color: "#AAAAAA" }}>({reviewCount} reviews)</span>
      </div>
      <h3 style={{
        fontSize: "15px",
        fontWeight: "700",
        color: "#1A2E1A",
        fontFamily: fontSans,
        lineHeight: "1.3",
        margin: "0",
        marginTop: "10px",
        marginBottom: "3px",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      }}>{product.name}</h3>
      <p style={{
        fontSize: "12px",
        color: "#5C7A5C",
        fontFamily: fontSans,
        lineHeight: "1.4",
        margin: "0",
        marginBottom: "6px",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      }}>{product.description || "Premium quality product"}</p>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "4px",
        marginBottom: "2px",
        flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: "20px",
          fontWeight: "800",
          color: "#2E7D32",
          fontFamily: "'JetBrains Mono', 'Montserrat', monospace",
          letterSpacing: "-0.5px",
          background: "linear-gradient(135deg, #e8f5e9, #f1fff4)",
          padding: "3px 10px",
          borderRadius: "8px",
          border: "1.5px solid #a5d6a7",
          lineHeight: "1.3",
          display: "inline-block",
        }}>₹{product.price}</span>
        {product.bulkPrice != null && product.bulkPrice < product.price && (
          <span style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#888888",
            textDecoration: "line-through",
            fontFamily: "'JetBrains Mono', monospace",
          }}>₹{product.price + Math.round(product.price * 0.15)}</span>
        )}
        {product.bulkPrice != null && product.bulkPrice < product.price && (
          <span style={{
            fontSize: "10px",
            fontWeight: "700",
            color: "#FFFFFF",
            background: "linear-gradient(135deg, #FF6F00, #E65100)",
            padding: "2px 7px",
            borderRadius: "6px",
            letterSpacing: "0.3px",
          }}>BULK OFFER</span>
        )}
        {product.unit && (
          <span style={{ fontSize: "11px", color: "#5C7A5C", fontWeight: "500" }}>/ {product.unit}</span>
        )}
      </div>

      <div style={{ marginTop: "auto", width: "100%", paddingTop: "8px" }}>
        <div
          style={{
            height: "34px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          {needsGrams ? (
            <select
              value={grams}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                setGrams(e.target.value);
              }}
              aria-label={isGrocery ? "Quantity (grams)" : "Pack size"}
              style={spiceGramSelectStyle}
            >
              {SPICE_GRAM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <div style={{ width: "100%", height: "1px" }} aria-hidden />
          )}
        </div>
        <div style={{
          display: "flex",
          gap: "8px",
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
        }}
        >
        {showEnquiryAndAdd ? <>
          <button type="button" onClick={(event) => { event.stopPropagation(); setShowEnquiryModal(true); }} style={{ background: "#FFFFFF", color: "#4CAF50", border: "2px solid #4CAF50", padding: isMobile ? "10px 10px" : "9px 8px", borderRadius: "10px", fontSize: isMobile ? 13 : 12, fontWeight: "700", cursor: "pointer", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", minHeight: 40 }}>📩 Enquiry</button>
          <button type="button" className="standard-add-btn" onClick={(event) => { event.stopPropagation(); pushCart(); }} style={{ ...addToCartBtnStyle, flex: 1, minHeight: 40 }}><ShoppingCart size={15} /> Add to Cart</button>
        </> : <button type="button" className="standard-add-btn" onClick={(event) => { event.stopPropagation(); pushCart(); }} style={{ ...addToCartBtnStyle, width: "100%" }}><ShoppingCart size={15} /> Add to Cart</button>}
        </div>
      </div>
    </div>
    {showEnquiryModal && <EnquiryModal product={product} onClose={() => setShowEnquiryModal(false)} />}
  </div>;
}

export function ProductGridSection({ title = "Popular Products", items }) {
  const { width } = useWindowSize();
  const columns = width <= 768 ? "1fr" : width <= 1024 ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))";
  return <section style={{ padding: width <= 768 ? "28px 16px" : "60px 40px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
    <h2 style={responsiveHeading(width)}>{title}</h2>
    <div style={{
      display: "grid",
      gridTemplateColumns: columns,
      gap: width <= 480 ? 14 : 18,
      alignItems: "stretch",
      justifyItems: "stretch",
      width: "100%",
    }}>{items.map((product) => <ProductCard key={product.id} product={product} />)}</div>
  </section>;
}

/** Repeat items so the track is long enough that the loop never looks like it “ends” mid-viewport. */
function buildSeamlessMarqueeItems(items, minUnits = 18) {
  if (!items?.length) return [];
  const out = [...items];
  let guard = 0;
  while (out.length < minUnits && guard < 48) {
    out.push(...items);
    guard++;
  }
  return out;
}

export function ProductMarqueeSection({
  items,
  title,
  subtitle,
  direction = "left",
  durationSec = 55,
  paddingTop = "40px",
}) {
  const { width } = useWindowSize();
  const trackRef = useRef(null);
  const loopBase = buildSeamlessMarqueeItems(items);
  const doubledProducts = [...loopBase, ...loopBase];
  const animation =
    direction === "left"
      ? `autoScrollLeft ${durationSec}s linear infinite`
      : `autoScrollRight ${durationSec}s linear infinite`;
  const titlePad = width <= 768 ? "0 16px" : "0 40px";

  return (
    <section style={{ padding: `${paddingTop} 0 0 0`, overflow: "hidden" }}>
      <div style={{ padding: titlePad, marginBottom: "28px" }}>
        <h2 style={{
          fontSize: width <= 480 ? "1.2rem" : width <= 768 ? "1.35rem" : "2rem",
          fontWeight: "800",
          color: "#1A2E1A",
          fontFamily: fontSans,
          marginBottom: subtitle ? "6px" : "0",
          whiteSpace: width <= 768 ? "normal" : "nowrap",
          overflow: width <= 768 ? "visible" : "hidden",
          textOverflow: width <= 768 ? "clip" : "ellipsis",
          lineHeight: 1.25,
          wordBreak: "break-word",
        }}>{title}</h2>
        {subtitle ? <p style={{ color: "#5C7A5C", fontSize: width <= 480 ? 13 : 15, fontFamily: fontSans, lineHeight: 1.45 }}>{subtitle}</p> : null}
      </div>
      <div
        style={{ overflow: "hidden", width: "100%", position: "relative" }}
        onMouseEnter={() => {
          if (trackRef.current) trackRef.current.style.animationPlayState = "paused";
        }}
        onMouseLeave={() => {
          if (trackRef.current) trackRef.current.style.animationPlayState = "running";
        }}
      >
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: width <= 768 ? 36 : 80,
          background: "linear-gradient(to right, rgba(254,238,191,0.9), transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0,
          width: width <= 768 ? 36 : 80,
          background: "linear-gradient(to left, rgba(254,238,191,0.9), transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }} />
        <div
          ref={trackRef}
          style={{
            display: "flex",
            flexDirection: "row",
            gap: width <= 768 ? 12 : 20,
            padding: width <= 768 ? "10px 12px 16px 12px" : "12px 20px 20px 20px",
            width: "max-content",
            animation,
            willChange: "transform",
          }}
        >
          {doubledProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              style={{
                flexShrink: 0,
                width: width <= 768 ? Math.min(280, Math.max(240, width - 56)) : 220,
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PopularProductsScrollSection({
  items,
  title = "Popular Products",
  subtitle = "Our most loved items — ordered fresh every day",
  durationSec = 52,
  direction = "left",
  paddingTop = "48px",
}) {
  return (
    <ProductMarqueeSection
      items={items}
      title={title}
      subtitle={subtitle}
      direction={direction}
      durationSec={durationSec}
      paddingTop={paddingTop}
    />
  );
}

export function ManualProductsRowSection({ title, subtitle, items }) {
  const { width } = useWindowSize();
  return (
    <section style={{ padding: width <= 768 ? "32px 16px 0" : "40px 40px 0", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <h2 style={{ ...responsiveHeading(width), marginBottom: subtitle ? 8 : 18 }}>{title}</h2>
      {subtitle ? <p style={{ color: "#5C7A5C", fontSize: "15px", fontFamily: fontSans, marginBottom: 18 }}>{subtitle}</p> : null}
      <div
        className="manual-product-row-scroll"
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 18,
          overflowX: "auto",
          padding: "8px 4px 20px 4px",
          scrollbarWidth: "thin",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {items.map((product) => (
          <div
            key={product.id}
            style={{
              flexShrink: 0,
              width: width <= 768 ? Math.min(280, Math.max(240, width - 56)) : 220,
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SpotlightImageStrip({ title, subtitle, images }) {
  const { width } = useWindowSize();
  const gap = width <= 480 ? 12 : 16;
  const compact = width <= 768;
  /** Full-width cards on compact layouts so Fresh picks / Spice highlights aren’t clipped */
  const cardOuterW = compact
    ? Math.min(360, Math.max(240, width - 32))
    : width <= 1100
      ? Math.min(310, Math.max(260, width - 200))
      : 335;
  const step = cardOuterW + gap;
  const visible = width <= 700 ? 1 : width <= 1100 ? 2 : 3;
  const maxIndex = Math.max(0, images.length - visible);
  const [scrollIndex, setScrollIndex] = useState(0);
  const displayIndex = Math.min(scrollIndex, maxIndex);

  useEffect(() => {
    setScrollIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex, images.length]);

  const prev = () => setScrollIndex((i) => Math.max(0, i - 1));
  const next = () => setScrollIndex((i) => Math.min(maxIndex, i + 1));

  const arrowBtn = {
    flexShrink: 0,
    width: compact ? 44 : 40,
    height: compact ? 44 : 40,
    borderRadius: "50%",
    border: "1.5px solid #C8E6C9",
    background: "#FFFFFF",
    color: "#2E7D32",
    fontSize: 22,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 10px rgba(76,175,80,0.15)",
    lineHeight: 1,
    padding: 0,
  };

  const imgBoxH = compact ? (width <= 400 ? 160 : 172) : 195;

  const carousel = (
    <div style={{ flex: 1, minWidth: 0, overflow: "hidden", padding: "4px 0 8px 0", width: "100%" }}>
      <div style={{
        display: "flex",
        gap,
        transform: `translateX(-${displayIndex * step}px)`,
        transition: "transform 0.35s ease",
        willChange: "transform",
      }}>
        {images.map((img, index) => (
          <Link
            key={`${img.src}-${index}`}
            to={img.to || "#"}
            style={{
              flexShrink: 0,
              textDecoration: "none",
              width: cardOuterW,
              minWidth: cardOuterW,
              maxWidth: "100%",
            }}
          >
            <div style={{
              width: "100%",
              height: `${imgBoxH}px`,
              minHeight: `${imgBoxH}px`,
              borderRadius: "16px",
              overflow: "hidden",
              border: "1.5px solid #E8F5E9",
              boxShadow: "0 4px 18px rgba(76, 175, 80, 0.12)",
              background: "#f7fbf7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <img
                src={img.src}
                alt={img.alt || ""}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <section style={{
      padding: width <= 768 ? "24px 16px 0" : "28px 40px 0",
      maxWidth: 1280,
      margin: "0 auto",
      width: "100%",
      boxSizing: "border-box",
    }}
    >
      <h2 style={{
        ...responsiveHeading(width),
        marginBottom: subtitle ? 8 : 16,
        whiteSpace: compact ? "normal" : "nowrap",
        overflow: compact ? "visible" : "hidden",
        textOverflow: compact ? "clip" : "ellipsis",
        wordBreak: "break-word",
      }}>{title}</h2>
      {subtitle ? <p style={{ color: "#5C7A5C", fontSize: width <= 480 ? 13 : 14, fontFamily: fontSans, marginBottom: 16, lineHeight: 1.45 }}>{subtitle}</p> : null}
      {compact ? (
        <>
          {carousel}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            marginTop: 8,
            paddingBottom: 8,
          }}
          >
            <button
              type="button"
              aria-label="Previous spotlight images"
              onClick={prev}
              disabled={displayIndex <= 0}
              style={{
                ...arrowBtn,
                opacity: displayIndex <= 0 ? 0.35 : 1,
                cursor: displayIndex <= 0 ? "not-allowed" : "pointer",
              }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next spotlight images"
              onClick={next}
              disabled={displayIndex >= maxIndex}
              style={{
                ...arrowBtn,
                opacity: displayIndex >= maxIndex ? 0.35 : 1,
                cursor: displayIndex >= maxIndex ? "not-allowed" : "pointer",
              }}
            >
              ›
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            aria-label="Previous spotlight images"
            onClick={prev}
            disabled={displayIndex <= 0}
            style={{
              ...arrowBtn,
              opacity: displayIndex <= 0 ? 0.35 : 1,
              cursor: displayIndex <= 0 ? "not-allowed" : "pointer",
            }}
          >
            ‹
          </button>
          {carousel}
          <button
            type="button"
            aria-label="Next spotlight images"
            onClick={next}
            disabled={displayIndex >= maxIndex}
            style={{
              ...arrowBtn,
              opacity: displayIndex >= maxIndex ? 0.35 : 1,
              cursor: displayIndex >= maxIndex ? "not-allowed" : "pointer",
            }}
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}

function EnquiryModal({ product, onClose }) {
  const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", address: "", quantity: "", unit: "grams (g)", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const resetAndClose = () => {
    setEnquiryForm({ name: "", email: "", phone: "", address: "", quantity: "", unit: "grams (g)", message: "" });
    setErrors({});
    setSuccess(false);
    onClose();
  };

  const submit = async () => {
    if (!canSubmitProductEnquiryCategory(product.category)) {
      toast.error("Enquiry is available only for spices and grocery products.");
      resetAndClose();
      return;
    }

    const nextErrors = {};
    ["name", "email", "phone", "address", "quantity"].forEach((field) => {
      if (!String(enquiryForm[field] ?? "").trim()) nextErrors[field] = "This field is required";
    });
    const qtyNum = Number(enquiryForm.quantity);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      nextErrors.quantity = "Enter a valid quantity";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const product_id = Number.parseInt(String(product.id), 10);
    if (Number.isNaN(product_id)) {
      toast.error("Invalid product. Please try again.");
      return;
    }

    const messageBody = enquiryForm.message.trim()
      ? `${enquiryForm.message.trim()}\n\n[Unit: ${enquiryForm.unit}]`
      : `[Unit: ${enquiryForm.unit}]`;

    const payload = {
      product_id,
      name: enquiryForm.name.trim(),
      email: enquiryForm.email.trim(),
      phone: enquiryForm.phone.trim(),
      address: enquiryForm.address.trim(),
      quantity: qtyNum,
      message: messageBody,
    };

    setLoading(true);
    try {
      const res = await foodAPI.submitEnquiry(payload);
      if (res && typeof res === "object" && res.success === false) {
        toast.error(getApiErrorMessage(res, "Could not submit enquiry."));
        return;
      }
      setSuccess(true);
      toast.success("Enquiry submitted successfully!");
      setTimeout(resetAndClose, 3000);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not submit enquiry."));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(<div onClick={(event) => { event.stopPropagation(); resetAndClose(); }} style={modalOverlayStyle}>
    <div style={modalCenterWrap}>
    <div onClick={(event) => event.stopPropagation()} style={{ ...modalCardStyle, maxWidth: "520px" }}>
      <div style={modalHeaderStyle}>
        <div><h2 style={modalTitleStyle}>Product Enquiry</h2><p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{product.name}</p></div>
        <button onClick={resetAndClose} style={modalCloseStyle}>×</button>
      </div>
      {success ? <div style={{ padding: "36px 28px", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#4CAF50", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, margin: "0 auto 18px" }}>✓</div>
        <h3 style={{ color: "#1A2E1A", fontSize: 24, fontWeight: 800, margin: "0 0 10px" }}>Enquiry Submitted!</h3>
        <p style={{ color: "#1A1A1A", lineHeight: 1.5 }}>We'll contact you within 24 hours regarding your enquiry for {product.name}.</p>
        <button onClick={resetAndClose} style={{ ...outlineModalButton, marginTop: 20 }}>Close</button>
      </div> : <>
        <div style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F1F8F1", padding: "12px 16px", borderRadius: "12px", marginBottom: "24px" }}>
            <img src={product.image} alt={product.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
            <div><div style={{ fontWeight: 800, fontSize: 15, color: "#1A2E1A" }}>{product.name}</div><div style={{ color: "#4CAF50", fontSize: 14, fontWeight: 700 }}>₹{product.price}</div></div>
          </div>
          <ModalField label="Full Name *" error={errors.name}><input placeholder="Your full name" value={enquiryForm.name} onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })} style={modalInputStyle} onFocus={focusGreen} onBlur={blurGreen} /></ModalField>
          <ModalField label="Email Address *" error={errors.email}><input type="email" placeholder="your@email.com" value={enquiryForm.email} onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })} style={modalInputStyle} onFocus={focusGreen} onBlur={blurGreen} /></ModalField>
          <ModalField label="Phone Number *" error={errors.phone}><input type="tel" maxLength={13} placeholder="+91 XXXXX XXXXX" value={enquiryForm.phone} onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })} style={modalInputStyle} onFocus={focusGreen} onBlur={blurGreen} /></ModalField>
          <ModalField label="Delivery Address *" error={errors.address}><textarea placeholder="Full delivery address" value={enquiryForm.address} onChange={(e) => setEnquiryForm({ ...enquiryForm, address: e.target.value })} style={{ ...modalInputStyle, minHeight: 70, resize: "vertical" }} onFocus={focusGreen} onBlur={blurGreen} /></ModalField>
          <ModalField label="Quantity Required *" error={errors.quantity}><div style={{ display: "flex", gap: 12 }}><input type="number" placeholder="e.g. 5" value={enquiryForm.quantity} onChange={(e) => setEnquiryForm({ ...enquiryForm, quantity: e.target.value })} style={{ ...modalInputStyle, flex: 1 }} onFocus={focusGreen} onBlur={blurGreen} /><select value={enquiryForm.unit} onChange={(e) => setEnquiryForm({ ...enquiryForm, unit: e.target.value })} style={{ ...modalInputStyle, flex: 1 }} onFocus={focusGreen} onBlur={blurGreen}><option>grams (g)</option><option>Kilograms (kg)</option><option>Pieces</option><option>Packets</option></select></div></ModalField>
          <ModalField label="Additional Message"><textarea placeholder="Any special requirements, custom blend requests, packaging needs..." value={enquiryForm.message} onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })} style={{ ...modalInputStyle, minHeight: 80, resize: "vertical" }} onFocus={focusGreen} onBlur={blurGreen} /></ModalField>
        </div>
        <div style={{ padding: "16px 28px 24px", display: "flex", gap: 12, justifyContent: "flex-end" }}><button onClick={resetAndClose} style={outlineModalButton}>Cancel</button><button disabled={loading} onClick={submit} style={{ ...primaryModalButton, opacity: loading ? 0.7 : 1 }}>{loading ? "Submitting..." : "📩 Submit Enquiry"}</button></div>
      </>}
    </div>
    </div>
  </div>, document.body);
}

function ModalField({ label, error, children }) {
  return <div style={{ marginBottom: 18 }}><label style={{ color: "#1A2E1A", fontSize: 14, fontWeight: 600, marginBottom: 6, display: "block" }}>{label}</label>{children}{error && <p style={{ color: "#EF4444", fontSize: 12, fontWeight: 700, margin: "6px 0 0" }}>{error}</p>}</div>;
}

const modalOverlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 2147483000, padding: "16px", animation: "fadeIn 0.2s ease", overflowY: "auto" };
const modalCenterWrap = { minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0" };
const modalCardStyle = { background: "#FFFFFF", borderRadius: "24px", width: "min(520px, calc(100vw - 32px))", maxHeight: "calc(100vh - 48px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", boxShadow: "0 24px 80px rgba(0,0,0,0.18)", animation: "slideUp 0.3s ease", position: "relative", zIndex: 1 };
const modalHeaderStyle = { background: "linear-gradient(135deg, #4CAF50, #388E3C)", padding: "22px 28px", borderRadius: "24px 24px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 1 };
const modalTitleStyle = { color: "#FFFFFF", fontSize: "20px", fontWeight: "700", fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 };
const modalCloseStyle = { background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF", width: "36px", height: "36px", borderRadius: "50%", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", lineHeight: 1 };
const modalInputStyle = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #E8F5E9", fontSize: "15px", color: "#1A1A1A", outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FFFFFF" };
const outlineModalButton = { background: "#FFFFFF", color: "#4CAF50", border: "2px solid #4CAF50", padding: "11px 28px", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer" };
const primaryModalButton = { background: "linear-gradient(135deg, #4CAF50, #388E3C)", color: "#FFFFFF", border: "none", padding: "13px 32px", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(76,175,80,0.35)" };
function focusGreen(event) { event.target.style.borderColor = "#4CAF50"; }
function blurGreen(event) { event.target.style.borderColor = "#E8F5E9"; }

export function AutoScrollProducts({ items }) {
  return <PopularProductsScrollSection items={items} />;
}

export function GallerySection({ items = products.slice(0, 6) }) {
  const { width } = useWindowSize();
  return <section style={{ padding: width <= 768 ? "28px 16px" : "60px 40px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" }}><h2 style={responsiveHeading(width)}>Gallery</h2><div style={{ display: "grid", gridTemplateColumns: width <= 480 ? "1fr" : width <= 768 ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 12 }}>{items.slice(0, 6).map((product) => <img key={product.id} src={product.image} alt={product.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 10 }} />)}</div></section>;
}

export function buildCategoryItems(list, route = "#") {
  const grouped = new Map();
  list.forEach((product) => {
    const label = product.subCategory || product.categoryLabel || product.category || "Products";
    if (!grouped.has(label)) grouped.set(label, { name: label[0].toUpperCase() + label.slice(1), image: product.image, route });
  });
  return [...grouped.values()];
}

export function RiderAnimation() { return <div style={{ width: 180, height: 80, overflow: "hidden", position: "relative" }}><style>{`@keyframes rideLeft{0%{transform:translateX(180px)}100%{transform:translateX(-180px)}}`}</style><div style={{ position: "absolute", bottom: 10, width: "100%", height: 2, background: "#333333" }} /><div style={{ position: "absolute", top: 24, animation: "rideLeft 3s linear infinite" }}><div style={{ position: "relative", width: 90, height: 42 }}><div style={{ position: "absolute", left: 18, top: 18, width: 54, height: 16, borderRadius: 12, background: colors.green }} /><div style={{ position: "absolute", left: 8, top: 30, width: 18, height: 18, borderRadius: "50%", background: "#333333" }} /><div style={{ position: "absolute", left: 62, top: 30, width: 18, height: 18, borderRadius: "50%", background: "#333333" }} /><div style={{ position: "absolute", left: 42, top: 0, width: 14, height: 26, borderRadius: 8, background: "#FF6F00" }} /><div style={{ position: "absolute", left: 44, top: -12, width: 16, height: 16, borderRadius: "50%", background: "#F4C7A1" }} /><div style={{ position: "absolute", left: 24, top: 4, width: 18, height: 22, borderRadius: 4, background: "#8B4513" }} /></div></div></div>; }
export function TruckAnimation() { return <div style={{ width: 220, height: 90, overflow: "hidden", position: "relative" }}><style>{`@keyframes truckMove{0%{transform:translateX(220px)}100%{transform:translateX(-220px)}}@keyframes smoke{0%{opacity:0;transform:scale(.6)}50%{opacity:.5}100%{opacity:0;transform:scale(1.3)}}`}</style><div style={{ position: "absolute", top: 24, animation: "truckMove 4s linear infinite" }}><div style={{ position: "relative", width: 130, height: 56 }}><div style={{ position: "absolute", left: 0, top: 18, width: 38, height: 28, background: "#388E3C", borderRadius: 4 }} /><div style={{ position: "absolute", left: 36, top: 8, width: 82, height: 38, background: colors.green, borderRadius: 4, color: "#FFFFFF", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>YUBI</div><div style={{ position: "absolute", left: 18, top: 44, width: 18, height: 18, borderRadius: "50%", background: "#222222" }} /><div style={{ position: "absolute", left: 88, top: 44, width: 18, height: 18, borderRadius: "50%", background: "#222222" }} /><div style={{ position: "absolute", left: -18, top: 12, width: 12, height: 12, borderRadius: "50%", background: "gray", animation: "smoke 1s infinite" }} /><div style={{ position: "absolute", left: -30, top: 5, width: 10, height: 10, borderRadius: "50%", background: "gray", animation: "smoke 1s .3s infinite" }} /></div></div></div>; }
