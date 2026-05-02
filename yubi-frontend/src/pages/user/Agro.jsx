import { useEffect, useState } from "react";
import { BannerSlider, CategoryImageSection, ProductGridSection, ProductMarqueeSection, colors } from "./HomeSections";
import MidBannerSlider from "../../components/shared/MidBannerSlider";
import { foodAPI, getApiErrorMessage } from "../../lib/api";
import { extractProductList, mapFoodProductFromApi } from "../../lib/foodProductUtils";
import { agroTextBanners } from "../../data/banners";

const agroBanners = [
  { id: 1, headline: "Organic Farming Solutions", subheadline: "Seeds, tools, and fertilizers for sustainable agriculture", cta: "Explore Now", route: "/agro", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1600&auto=format&fit=crop" },
  { id: 2, headline: "Premium Farm Equipment", subheadline: "Everything farmers need for better harvest", cta: "Shop Tools", route: "/agro", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&auto=format&fit=crop" },
];

const agroCategories = [
  { name: "Seeds", route: "/agro", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop" },
  { name: "Compost", route: "/agro", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop" },
  { name: "Farm Tools", route: "/agro", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop" },
  { name: "Organic Inputs", route: "/agro", image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&auto=format&fit=crop" },
];

export default function Agro() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await foodAPI.getAgroProducts();
        const list = extractProductList(res).map((raw, i) => ({
          ...mapFoodProductFromApi(raw, i),
          category: "agro",
        }));
        if (!cancelled) setItems(list);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ background: "#FFFFFF", color: colors.text }}>
      <BannerSlider items={agroBanners} />

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
          fontSize: 42,
          fontWeight: 700,
          margin: "0 0 10px 0",
          color: "#1A2E1A",
        }}
        >
          Agro Products
        </h1>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
          fontSize: 16,
          color: "#5C7A5C",
          margin: 0,
        }}
        >
          Premium farming solutions and equipment for modern agriculture
        </p>
      </section>
      <CategoryImageSection title="Agro Categories" items={agroCategories} titleInCard borderless />
      <MidBannerSlider items={agroTextBanners} />

      {loading ? (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px", textAlign: "center", color: "#5C7A5C" }}>
          Loading products…
        </section>
      ) : error ? (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px", textAlign: "center", color: "#C62828" }}>
          {error}
        </section>
      ) : items.length === 0 ? (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px", textAlign: "center", color: "#5C7A5C" }}>
          No agro products are available right now.
        </section>
      ) : (
        <>
          <ProductMarqueeSection title="Agro Best Picks" items={items} direction="left" durationSec={46} paddingTop="40px" />
          <ProductGridSection title="All Agro Products" items={items} />
        </>
      )}
    </main>
  );
}
