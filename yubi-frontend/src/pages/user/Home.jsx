import { Link } from "react-router-dom";
import { theme } from "@/utils/theme";
import { GradientText, Button, Badge, Card } from "@/components/UI";
import { FOODS, SPICES } from "@/utils/catalog";
import { useCart } from "@/context/CartContext";
import { fmtPrice } from "@/utils/theme";
import heroImg from "@/assets/hero-spices.jpg";
import { Star, Truck, Award, Clock, ChefHat, ArrowRight, Flame } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { addItem } = useCart();
  const [cd, setCd] = useState({ h: 5, m: 32, s: 11 });

  useEffect(() => {
    const t = setInterval(() => {
      setCd((p) => {
        let s = p.s - 1, m = p.m, h = p.h;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 5; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: "linear-gradient(135deg, #feeebf 0%, #fff9e6 40%, #fef5dc 70%, #fffbf0 100%)", minHeight: "100vh", fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>
      {/* HERO */}
      <section className="ss-grain" style={{
        position: "relative", overflow: "hidden", padding: "80px 24px 100px",
        background: `linear-gradient(180deg, rgba(13,13,13,0.4) 0%, rgba(13,13,13,0.85) 60%, #0D0D0D 100%), url(${heroImg}) center/cover`,
        minHeight: 640,
      }}>
        <div className="ss-fade-up" style={{ position: "relative", maxWidth: 1100, margin: "0 auto", textAlign: "center", paddingTop: 60 }}>
          <Badge color={theme.colors.accent} style={{ marginBottom: 20 }}>
            <Flame size={11} /> NEW SEASON · MONSOON SPECIALS
          </Badge>
          <h1 style={{
            fontFamily: "Montserrat, sans-serif", fontSize: "clamp(40px, 7vw, 84px)",
            fontWeight: 700, lineHeight: 1.05, margin: 0, letterSpacing: -1,
          }}>
            Taste the Finest <br />
            <GradientText>Spices &amp; Food</GradientText>,<br />
            Delivered to Your Door
          </h1>
          <p style={{ fontSize: "clamp(15px, 1.4vw, 19px)", color: theme.colors.textDim, maxWidth: 620, margin: "24px auto 36px", lineHeight: 1.6, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>
            Single-origin spices, slow-cooked meals, and bulk wholesale — sourced directly from heritage farms and crafted in our boutique kitchen.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/menu" style={{ textDecoration: "none" }}>
              <Button size="lg">Order Food Now <ArrowRight size={18} /></Button>
            </Link>
            <Link to="/spices" style={{ textDecoration: "none" }}>
              <Button size="lg" variant="glass">Shop Spices</Button>
            </Link>
          </div>

          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 60, flexWrap: "wrap" }}>
            {[
              { icon: <Truck size={18} />, label: "Free delivery > ₹500" },
              { icon: <Award size={18} />, label: "100% Authentic" },
              { icon: <Clock size={18} />, label: "30-min delivery" },
            ].map((b) => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8, color: theme.colors.textDim, fontSize: 14, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>
                <span style={{ color: theme.colors.accent }}>{b.icon}</span> {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "60px 24px", background: "linear-gradient(135deg, #feeebf 0%, #fff9e6 50%, #fef5dc 100%)" }}>
        <SectionHeader eyebrow="EXPLORE" title="Featured Categories" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 20 }}>
          {[
            { title: "Chef-Crafted Food", desc: "30+ dishes, ready in 30 mins", emoji: "🍛", to: "/menu", grad: "linear-gradient(135deg, #E85D04, #F4A623)" },
            { title: "Premium Spice Blends", desc: "Single-origin, freshly ground", emoji: "✨", to: "/spices", grad: "linear-gradient(135deg, #F4A623, #FFB84D)" },
            { title: "Bulk & Wholesale", desc: "Up to 30% off on 5kg+", emoji: "📦", to: "/spices", grad: "linear-gradient(135deg, #8B4513, #E85D04)" },
          ].map((c) => (
            <Link key={c.title} to={c.to} style={{ textDecoration: "none" }}>
              <div className="ss-hover-scale featured-category-card" style={{
                position: "relative", overflow: "hidden", padding: 32, minHeight: 240,
                borderRadius: theme.radius.lg, background: c.grad, color: "#0D0D0D",
                display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer",
                boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                transition: "all 0.3s ease-out",
              }}>
                <div style={{ fontSize: 72, animation: "float 3s ease-in-out infinite" }}>{c.emoji}</div>
                <div>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 26, fontWeight: 600 }}>{c.title}</div>
                  <div style={{ marginTop: 8, opacity: 0.9, fontSize: 14, lineHeight: 1.5, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>{c.desc}</div>
                  <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14, fontFamily: "Montserrat, sans-serif" }}>
                    Explore <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          .featured-category-card {
            transition: all 0.3s ease-out;
          }
          .featured-category-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          }
        `}</style>
      </section>

      {/* BESTSELLERS */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px 60px", background: "linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 50%, #F0F7F0 100%)" }}>
        <SectionHeader eyebrow="LOVED BY ALL" title="Popular Products" />
        <style>{`
          @keyframes scrollLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .bestsellers-scroll-container:hover .bestsellers-inner {
            animation-play-state: paused;
          }
          .bestsellers-inner {
            animation: scrollLeft 30s linear infinite;
          }
        `}</style>
        <div className="bestsellers-scroll-container" style={{ display: "flex", gap: 18, overflow: "hidden", position: "relative" }}>
          <div className="bestsellers-inner" style={{ display: "flex", gap: 18, paddingBottom: 8 }}>
            {[...FOODS.slice(0, 4), ...SPICES.slice(0, 4), ...FOODS.slice(0, 4), ...SPICES.slice(0, 4)].map((p, idx) => {
              const isFood = !p.tiers;
              const price = isFood ? p.price : p.tiers[0].price;
              return (
                <div key={`${p.id}-${idx}`} className="ss-hover-scale" style={{
                  minWidth: 260, flex: "0 0 260px", borderRadius: theme.radius.lg, overflow: "hidden",
                  background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
                  boxShadow: "0 8px 24px rgba(76,175,80,0.08)",
                  transition: theme.transition,
                }}>
                  <div style={{ height: 160, fontSize: 72, display: "flex", alignItems: "center", justifyContent: "center", background: theme.gradientSoft }}>{p.emoji}</div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: theme.colors.accent, fontSize: 11 }}>
                      <Star size={12} fill="currentColor" /> {p.rating}
                    </div>
                    <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 15, marginTop: 6, color: "#1A1A1A", lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: theme.colors.textDim, marginTop: 6, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>
                      {p.description || "Premium quality product"}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                      <span style={{ fontFamily: theme.fonts.mono, fontWeight: 700, color: theme.colors.accent, fontSize: 14 }}>{fmtPrice(price)}</span>
                      <Button size="sm" onClick={() => addItem({
                        key: `${p.id}-${isFood ? "default" : p.tiers[0].weight}`,
                        productId: p.id, name: p.name, price, emoji: p.emoji,
                        variant: isFood ? null : p.tiers[0].weight,
                      })}>Add</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BANNER - PHARMACY/PRODUCTS */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {[
          { title: "Pharmacy at your doorstep!", desc: "Cough syrups, pain relief sprays & more", emoji: "💊" },
          { title: "Pet care supplies at your door", desc: "Food, treats, toys & more", emoji: "🐕" },
          { title: "No time for a diaper run?", desc: "Get baby care essentials", emoji: "👶" },
        ].map((b) => (
          <div key={b.title} style={{
            borderRadius: theme.radius.lg, padding: 28, background: "linear-gradient(135deg, #E85D04, #F4A623)",
            color: "#FFFFFF", textAlign: "left", boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, fontFamily: "Montserrat, sans-serif" }}>{b.title}</div>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 16, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>{b.desc}</div>
            <button style={{ background: "#FFFFFF", color: "#E85D04", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", fontFamily: "Montserrat, sans-serif" }}>Order Now</button>
          </div>
        ))}
      </section>

      {/* FOOD DELIVERED BY YUBI FOODS */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "60px 24px", background: "linear-gradient(135deg, #FFF8DC 0%, #FFFAEB 50%, #FFF5D6 100%)" }}>
        <SectionHeader eyebrow="FRESH & READY" title="Food Delivered by YUBI Foods" />
        <style>{`
          @keyframes scrollRightToLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .food-scroll-container {
            overflow: hidden;
          }
          .food-scroll-container:hover .food-scroll-inner {
            animation-play-state: paused;
          }
          .food-scroll-inner {
            animation: scrollRightToLeft 40s linear infinite;
          }
        `}</style>
        <div className="food-scroll-container" style={{ display: "flex", gap: 16, overflow: "hidden", position: "relative" }}>
          <div className="food-scroll-inner" style={{ display: "flex", gap: 16, paddingBottom: 8 }}>
            {[...FOODS.slice(0, 6), ...FOODS.slice(0, 6)].map((p, idx) => (
              <Link key={`${p.id}-${idx}`} to={`/product/${p.id}`} style={{ textDecoration: "none" }}>
                <div className="ss-hover-scale" style={{
                  borderRadius: theme.radius.lg, overflow: "hidden",
                  background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
                  boxShadow: "0 8px 24px rgba(76,175,80,0.08)",
                  transition: theme.transition,
                  cursor: "pointer",
                  minWidth: 200, flex: "0 0 200px",
                }}>
                  <div style={{ height: 140, fontSize: 64, display: "flex", alignItems: "center", justifyContent: "center", background: theme.gradientSoft }}>{p.emoji}</div>
                  <div style={{ padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: theme.colors.accent, fontSize: 11 }}>
                      <Star size={11} fill="currentColor" /> {p.rating}
                    </div>
                    <div style={{ fontFamily: theme.fonts.heading, fontWeight: 600, fontSize: 14, marginTop: 6, color: "#1A1A1A" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.3 }}>
                      {p.description}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <span style={{ fontFamily: theme.fonts.mono, fontWeight: 700, color: theme.colors.accent, fontSize: 12 }}>{fmtPrice(p.price)}</span>
                      <Button size="sm" onClick={(e) => { e.preventDefault(); addItem({ key: p.id, productId: p.id, name: p.name, price: p.price, emoji: p.emoji }); }}>Add</Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER - FOOD PRODUCTS */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{
          borderRadius: theme.radius.lg, padding: 28, 
          background: "linear-gradient(90deg, #E85D04, #F4A623)",
          color: "#FFFFFF", textAlign: "center", boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
        }}>
          <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 8, fontFamily: "Montserrat, sans-serif" }}>Fresh Food Delivered Daily</div>
          <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 20, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>Chef-crafted meals prepared fresh in our kitchen</div>
          <Link to="/menu" style={{ textDecoration: "none" }}>
            <button style={{ background: "#FFFFFF", color: "#E85D04", border: "none", borderRadius: 8, padding: "12px 24px", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "Montserrat, sans-serif" }}>Order Now</button>
          </Link>
        </div>
      </section>

      {/* SPICES DELIVERED BY YUBI SPICES */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "60px 24px", background: "linear-gradient(135deg, #FFEFD5 0%, #FFE8B3 50%, #FFE0A3 100%)" }}>
        <SectionHeader eyebrow="PURE & AROMATIC" title="Spices Delivered by YUBI Spices" />
        <style>{`
          @keyframes scrollSpices {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .spices-scroll-container:hover .spices-scroll-inner {
            animation-play-state: paused;
          }
          .spices-scroll-inner {
            animation: scrollSpices 35s linear infinite;
          }
        `}</style>
        <div className="spices-scroll-container" style={{ display: "flex", gap: 16, overflow: "hidden", position: "relative" }}>
          <div className="spices-scroll-inner" style={{ display: "flex", gap: 16, paddingBottom: 8 }}>
            {[...SPICES.slice(0, 6), ...SPICES.slice(0, 6)].map((p, idx) => (
              <Link key={`${p.id}-${idx}`} to={`/product/${p.id}`} style={{ textDecoration: "none" }}>
                <div className="ss-hover-scale" style={{
                  borderRadius: theme.radius.lg, overflow: "hidden",
                  background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
                  boxShadow: "0 8px 24px rgba(76,175,80,0.08)",
                  transition: theme.transition,
                  cursor: "pointer",
                  minWidth: 200, flex: "0 0 200px",
                }}>
                  <div style={{ height: 140, fontSize: 64, display: "flex", alignItems: "center", justifyContent: "center", background: theme.gradientSoft }}>{p.emoji}</div>
                  <div style={{ padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: theme.colors.accent, fontSize: 11 }}>
                      <Star size={11} fill="currentColor" /> {p.rating}
                    </div>
                    <div style={{ fontFamily: theme.fonts.heading, fontWeight: 600, fontSize: 14, marginTop: 6, color: "#1A1A1A" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.3 }}>
                      {p.description}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <span style={{ fontFamily: theme.fonts.mono, fontWeight: 700, color: theme.colors.accent, fontSize: 12 }}>{fmtPrice(p.tiers[0].price)}</span>
                      <Button size="sm" onClick={(e) => { e.preventDefault(); addItem({ key: p.id, productId: p.id, name: p.name, price: p.tiers[0].price, emoji: p.emoji, variant: p.tiers[0].weight }); }}>Add</Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER - SPICES PRODUCTS */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{
          borderRadius: theme.radius.lg, padding: 28, 
          background: "linear-gradient(90deg, #F4A623, #FFB84D)",
          color: "#FFFFFF", textAlign: "center", boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
        }}>
          <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 8, fontFamily: "Montserrat, sans-serif" }}>Premium Spices Sourced Fresh</div>
          <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 20, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>Single-origin spices for authentic flavors in your kitchen</div>
          <Link to="/spices" style={{ textDecoration: "none" }}>
            <button style={{ background: "#FFFFFF", color: "#F4A623", border: "none", borderRadius: 8, padding: "12px 24px", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "Montserrat, sans-serif" }}>Shop Spices</button>
          </Link>
        </div>
      </section>

      <SpiceStats />

      {/* INSPIRATION FOR FIRST ORDER - FOODS */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "60px 24px", background: "linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 50%, #F0F7F0 100%)" }}>
        <SectionHeader eyebrow="GET STARTED" title="Inspiration for your first order (Foods)" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
          {FOODS.slice(0, 6).map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: "none" }}>
              <Card>
                <div style={{ height: 120, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center", background: theme.gradientSoft, borderRadius: theme.radius.md }}>{p.emoji}</div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "#1A1A1A" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 4, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>⭐ {p.rating}</div>
                  <div style={{ marginTop: 10, fontFamily: theme.fonts.mono, fontWeight: 700, color: theme.colors.accent }}>{fmtPrice(p.price)}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* INSPIRATION FOR FIRST ORDER - SPICES */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "60px 24px", background: "linear-gradient(135deg, #FFF9E6 0%, #FFFFFF 50%, #FFFAEB 100%)" }}>
        <SectionHeader eyebrow="FLAVOR ESSENTIALS" title="Inspiration for your first order of Spices" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
          {SPICES.slice(0, 6).map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: "none" }}>
              <Card>
                <div style={{ height: 120, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center", background: theme.gradientSoft, borderRadius: theme.radius.md }}>{p.emoji}</div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "#1A1A1A" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: theme.colors.textDim, marginTop: 4, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>⭐ {p.rating}</div>
                  <div style={{ marginTop: 10, fontFamily: theme.fonts.mono, fontWeight: 700, color: theme.colors.accent }}>{fmtPrice(p.tiers[0].price)}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "60px 24px", background: "linear-gradient(135deg, #F0F7F0 0%, #FFFFFF 50%, #E8F5E9 100%)" }}>
        <SectionHeader eyebrow="EFFORTLESS" title="How It Works" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[
            { n: "01", t: "Browse & Choose", d: "Pick from food or spices, single or bulk", icon: <ChefHat /> },
            { n: "02", t: "Place Your Order", d: "Pay with card, UPI, or COD", icon: <Award /> },
            { n: "03", t: "Real-Time Tracking", d: "Watch your order from kitchen to door", icon: <Truck /> },
            { n: "04", t: "Enjoy", d: "Fresh, premium, delivered with care", icon: <Star /> },
          ].map((s, i) => (
            <Card key={s.n} className="ss-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: theme.colors.accent, marginBottom: 14, fontWeight: 600 }}>{s.n}</div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: theme.gradientSoft, display: "flex", alignItems: "center", justifyContent: "center", color: theme.colors.accent, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 17, fontWeight: 600 }}>{s.t}</div>
              <div style={{ color: theme.colors.textDim, fontSize: 13, marginTop: 6, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>{s.d}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* PROMO COUNTDOWN */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px" }}>
        <Card style={{
          padding: 40, textAlign: "center", background: theme.gradient, color: "#0D0D0D", border: "none",
          backgroundImage: theme.gradient,
        }} glass={false}>
          <Badge color="#0D0D0D" style={{ background: "rgba(0,0,0,0.15)", color: "#0D0D0D", border: "none" }}>FLASH DEAL</Badge>
          <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(28px, 4vw, 44px)", margin: "12px 0 8px", color: "#0D0D0D", fontWeight: 600 }}>
            20% OFF on First Order
          </h2>
          <div style={{ marginBottom: 20, fontSize: 14, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>Use code <strong>FIRST</strong> at checkout</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {[["HRS", cd.h], ["MIN", cd.m], ["SEC", cd.s]].map(([l, v]) => (
              <div key={l} style={{ background: "rgba(0,0,0,0.15)", padding: "12px 20px", borderRadius: 12, minWidth: 80 }}>
                <div style={{ fontFamily: theme.fonts.mono, fontSize: 32, fontWeight: 800, color: "#0D0D0D" }}>{String(v).padStart(2, "0")}</div>
                <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, letterSpacing: 2, fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "60px 24px", background: "linear-gradient(135deg, #FFFAEB 0%, #FFFFFF 50%, #FFF9E6 100%)" }}>
        <SectionHeader eyebrow="REAL STORIES" title="From Our Customers" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 20 }}>
          {[
            { name: "Priya M.", role: "Home Cook", text: "The Lakadong turmeric is a game-changer. You can taste the difference instantly.", emoji: "👩‍🍳" },
            { name: "Aarav K.", role: "Restaurant Owner", text: "Bulk pricing is fair, quality is consistent. Reliable partner for our kitchen.", emoji: "👨‍🍳" },
            { name: "Mira S.", role: "Food Blogger", text: "Their biryani arrived hot, fragrant, and packed beautifully. 10/10.", emoji: "📸" },
          ].map((t) => (
            <Card key={t.name}>
              <div style={{ display: "flex", gap: 4, color: theme.colors.accent }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p style={{ marginTop: 14, color: theme.colors.text, lineHeight: 1.6, fontSize: 14, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>"{t.text}"</p>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: theme.gradientSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{t.emoji}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, fontFamily: "Montserrat, sans-serif" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: theme.colors.textDim, fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, letterSpacing: 3, color: theme.colors.accent, marginBottom: 8, fontWeight: 600 }}>{eyebrow}</div>
      <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, margin: 0 }}>{title}</h2>
    </div>
  );
}

function SpiceStats() {
  const stats = [
    { value: "4.9", label: "Average Rating", sub: "from verified buyers" },
    { value: "25K+", label: "Spice Orders", sub: "packed fresh monthly" },
    { value: "18+", label: "Signature Blends", sub: "whole and ground spices" },
    { value: "98%", label: "Repeat Customers", sub: "trusted kitchen staples" },
  ];
  return (
    <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 60px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: 16,
        background: "linear-gradient(135deg, #E8F5E9, #FFFFFF)",
        border: "1px solid #C8E6C9",
        borderRadius: 22,
        padding: 24,
        boxShadow: "0 18px 46px rgba(26,46,26,0.08)",
      }}>
        {stats.map((stat, index) => (
          <div key={stat.label} className="home-stat-card" style={{ animationDelay: `${index * 90}ms` }}>
            <div className="home-stat-card__value" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>{stat.value}</div>
            <div className="home-stat-card__label" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>{stat.label}</div>
            <div className="home-stat-card__sub" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400 }}>{stat.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
