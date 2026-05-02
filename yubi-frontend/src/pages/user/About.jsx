import { useEffect, useRef, useState } from "react";
import { theme } from "@/utils/theme";
import BackButton from "@/components/BackButton";
import { Leaf, ChefHat, Sprout, Package, ShieldCheck, Eye, Zap, Linkedin, Truck, CreditCard, Headphones, Star } from "lucide-react";

const TEAM = [
  { name: "Aarav Mehta", role: "Founder & CEO", img: "https://i.pravatar.cc/200?img=12" },
  { name: "Priya Iyer", role: "Head of Operations", img: "https://i.pravatar.cc/200?img=47" },
  { name: "Ravi Kumar", role: "Farm Partnerships", img: "https://i.pravatar.cc/200?img=33" },
  { name: "Meera Shah", role: "Executive Chef", img: "https://i.pravatar.cc/200?img=45" },
];

export default function About() {
  return (
    <div style={{ background: "#FFFFFF" }}>
      {/* Hero */}
      <section style={{
        position: "relative", padding: "80px 24px 100px",
        background: `linear-gradient(135deg, rgba(26,46,26,0.7), rgba(56,142,60,0.6)), url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop) center/cover`,
        color: "#fff", textAlign: "center",
      }}>
        <div style={{ position: "absolute", top: 24, left: 24 }}><BackButton /></div>
        <div style={{
          width: 90, height: 90, borderRadius: "50%", background: "#fff", margin: "0 auto 22px",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: theme.shadow,
        }}>
          <Leaf size={48} color={theme.colors.primaryDark} />
        </div>
        <div style={{ fontFamily: theme.fonts.heading, fontSize: 64, fontWeight: 800, letterSpacing: 2 }}>YUBI</div>
        <p style={{ fontFamily: theme.fonts.heading, fontSize: 26, marginTop: 8, fontWeight: 500, fontStyle: "italic", color: "rgba(255,255,255,0.95)" }}>
          From Nature's Finest — To Your Doorstep
        </p>
      </section>

      {/* Our Story */}
      <Section bg="#FFFFFF">
        <Two>
          <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=900&auto=format&fit=crop" alt="Team" style={imgBox} />
          <div>
            <Tag>Our Story</Tag>
            <H2>Who We Are</H2>
            <P>
              YUBI is a premium Indian e-commerce platform specializing in fresh food delivery,
              authentic spices, and quality agro products sourced directly from farms. We exist to
              shorten the distance between the field and your kitchen — celebrating the people, the
              land, and the craft that make every ingredient extraordinary.
            </P>
            <P>
              <strong>Vision:</strong> To be India's most trusted bridge between farmers and families.<br />
              <strong>Mission:</strong> Deliver pure, traceable, and sustainable food to every doorstep — fast.
            </P>
          </div>
        </Two>
      </Section>

      {/* What We Offer */}
      <Section bg="#F1F8F1">
        <Tag center>What We Offer</Tag>
        <H2 center>Everything you need, sourced with care</H2>
        <Grid cols={4}>
          <OfferCard icon={<ChefHat />} title="Fresh Food Delivery" desc="Chef-crafted meals delivered hot to your door in 30 minutes." />
          <OfferCard icon={<Sprout />} title="Premium Spices" desc="Single-origin, hand-pounded spices from heritage farms." />
          <OfferCard icon={<Leaf />} title="Agro Products" desc="Grains, pulses, seeds, and organic fertilizers — direct from farms." />
          <OfferCard icon={<Package />} title="Bulk Orders" desc="Custom catering, wedding hampers, and wholesale supply." />
        </Grid>
      </Section>

      {/* Our Values */}
      <Section bg="#FFFFFF">
        <Tag center>Our Values</Tag>
        <H2 center>What we stand for</H2>
        <Grid cols={3}>
          <ValueCard icon={<ShieldCheck />} title="Quality" desc="Every product is hand-checked, lab-tested, and small-batch processed." />
          <ValueCard icon={<Eye />} title="Transparency" desc="Trace every ingredient back to the farm and the farmer who grew it." />
          <ValueCard icon={<Zap />} title="Speed" desc="Same-day dispatch, 30-minute meal delivery in supported cities." />
        </Grid>
      </Section>

      {/* Stats */}
      <Stats />

      {/* Team */}
      <Section bg="#F1F8F1">
        <Tag center>Our Team</Tag>
        <H2 center>Meet Our Team</H2>
        <Grid cols={4}>
          {TEAM.map((m) => (
            <div key={m.name} className="ss-hover-lift" style={{ background: "#fff", borderRadius: 20, overflow: "hidden", textAlign: "center", border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadowSoft }}>
              <img src={m.img} alt={m.name} style={{ width: "100%", height: 220, objectFit: "cover" }} />
              <div style={{ padding: 18 }}>
                <div style={{ fontFamily: theme.fonts.heading, fontSize: 22, color: theme.colors.text }}>{m.name}</div>
                <div style={{ fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.primaryDark, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>{m.role}</div>
                <a href="#" style={{ display: "inline-flex", marginTop: 12, color: theme.colors.primaryDark }}><Linkedin size={18} /></a>
              </div>
            </div>
          ))}
        </Grid>
      </Section>

      {/* Why YUBI */}
      <Section bg="#FFFFFF">
        <Tag center>Why YUBI</Tag>
        <H2 center>Built for trust, designed for delight</H2>
        {[
          { icon: <Sprout />, title: "Farm Fresh Quality", desc: "We partner with 500+ farmers and inspect every batch before it ships.", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop" },
          { icon: <Truck />, title: "Fast Delivery", desc: "30-minute meal delivery and 24-hour dispatch on agro orders.", img: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop", flip: true },
          { icon: <CreditCard />, title: "Secure Payments", desc: "PCI-DSS compliant gateway with UPI, cards, and net banking.", img: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&auto=format&fit=crop" },
          { icon: <Headphones />, title: "24/7 Support", desc: "Real humans available round-the-clock via chat, phone, and email.", img: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&auto=format&fit=crop", flip: true },
        ].map((b, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center", margin: "40px 0" }} className="why-row">
            <img src={b.img} alt={b.title} style={{ ...imgBox, order: b.flip ? 2 : 1 }} />
            <div style={{ order: b.flip ? 1 : 2 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: theme.gradientSoft, color: theme.colors.primaryDark, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>{b.icon}</div>
              <H3>{b.title}</H3>
              <P>{b.desc}</P>
            </div>
          </div>
        ))}
      </Section>

      <style>{`
        @media (max-width: 760px) {
          .why-row { grid-template-columns: 1fr !important; }
          .why-row img { order: 1 !important; }
          .why-row > div { order: 2 !important; }
        }
      `}</style>
    </div>
  );
}

function Stats() {
  const stats = [
    { n: 10000, suffix: "+", label: "Happy Customers" },
    { n: 500, suffix: "+", label: "Products" },
    { n: 50, suffix: "+", label: "Delivery Partners" },
    { n: 5, suffix: "★", label: "Average Rating" },
  ];
  return (
    <section style={{ background: theme.gradient, padding: "60px 24px", color: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24, textAlign: "center" }}>
        {stats.map((s) => <CountUp key={s.label} {...s} />)}
      </div>
    </section>
  );
}

function CountUp({ n, suffix, label }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const dur = 1400;
        const start = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - start) / dur);
          setVal(Math.round(p * n));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [n]);
  return (
    <div ref={ref}>
      <div style={{ fontFamily: theme.fonts.heading, fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{val.toLocaleString()}{suffix}</div>
      <div style={{ fontFamily: theme.fonts.mono, fontSize: 12, letterSpacing: 2, marginTop: 8, opacity: 0.9, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

const Section = ({ bg, children }) => (
  <section style={{ background: bg, padding: "80px 24px" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>{children}</div>
  </section>
);
const Two = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }} className="two-col">
    {children}
    <style>{`@media (max-width: 760px){ .two-col{grid-template-columns:1fr !important;} }`}</style>
  </div>
);
const Grid = ({ cols, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${cols >= 4 ? 220 : 260}px, 1fr))`, gap: 22, marginTop: 32 }}>{children}</div>
);
const Tag = ({ children, center }) => (
  <div style={{ fontFamily: theme.fonts.mono, fontSize: 11, color: theme.colors.primary, letterSpacing: 2, textTransform: "uppercase", textAlign: center ? "center" : "left", marginBottom: 8 }}>{children}</div>
);
const H2 = ({ children, center }) => (
  <h2 style={{ fontFamily: theme.fonts.heading, fontSize: "clamp(30px,4vw,48px)", color: theme.colors.text, margin: 0, textAlign: center ? "center" : "left" }}>{children}</h2>
);
const H3 = ({ children }) => <h3 style={{ fontFamily: theme.fonts.heading, fontSize: 28, color: theme.colors.text, margin: "0 0 8px" }}>{children}</h3>;
const P = ({ children }) => <p style={{ color: theme.colors.textDim, fontSize: 16, lineHeight: 1.7, marginTop: 14 }}>{children}</p>;
const OfferCard = ({ icon, title, desc }) => (
  <div className="ss-hover-lift" style={{ background: "#fff", padding: 24, borderRadius: 20, textAlign: "center", border: `1px solid ${theme.colors.border}`, boxShadow: theme.shadowSoft }}>
    <div style={{ width: 56, height: 56, borderRadius: 16, background: theme.gradient, color: "#fff", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
    <div style={{ fontFamily: theme.fonts.heading, fontSize: 22, color: theme.colors.text }}>{title}</div>
    <div style={{ color: theme.colors.textDim, fontSize: 14, marginTop: 6, lineHeight: 1.6 }}>{desc}</div>
  </div>
);
const ValueCard = OfferCard;
const imgBox = { width: "100%", borderRadius: 20, objectFit: "cover", maxHeight: 380, border: `1px solid ${theme.colors.border}` };
