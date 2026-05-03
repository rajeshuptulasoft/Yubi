import { useEffect, useMemo, useState } from "react";
import {
  BannerSlider,
  CategoryImageSection,
  ProductGridSection,
  ProductMarqueeSection,
  colors,
} from "./HomeSections";
import MidBannerSlider from "../../components/shared/MidBannerSlider";
import { foodAPI, getApiErrorMessage } from "../../lib/api";
import { extractProductList, mapFoodProductFromApi } from "../../lib/foodProductUtils";
import { groceryHeroBanners, groceryTextBanners } from "../../data/banners";
import { useWindowSize } from "../../hooks/useWindowSize";

const emptyStateStyle = {
  maxWidth: 1280,
  margin: "0 auto",
  padding: "48px 24px",
  textAlign: "center",
  color: "#5C7A5C",
  fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
};

function productLabel(product) {
  if (product.category === "agro") return "Agro Products";
  if (product.category === "spices") return "Spices";
  if (product.category === "grocery") return "Grocery";
  return product.category ? product.category[0].toUpperCase() + product.category.slice(1) : "Products";
}

export default function Grocery() {
  const { width } = useWindowSize();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [foodsSpicesRes, agroRes] = await Promise.all([
          foodAPI.getFoodsSpices(),
          foodAPI.getAgroProducts(),
        ]);
        /** GET /food/foods-spices (spice/masala catalog) + GET /food/agro-products — merged, deduped by product id. */
        let index = 0;
        const byId = new Map();
        for (const raw of extractProductList(foodsSpicesRes)) {
          const p = mapFoodProductFromApi(raw, index++);
          byId.set(String(p.id), p);
        }
        for (const raw of extractProductList(agroRes)) {
          const p = {
            ...mapFoodProductFromApi(raw, index++),
            category: "agro",
          };
          if (!byId.has(String(p.id))) byId.set(String(p.id), p);
        }
        if (!cancelled) setItems(Array.from(byId.values()));
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

  const categories = useMemo(() => {
    const grouped = new Map();
    items.forEach((product) => {
      const id = product.category || "products";
      if (!grouped.has(id)) {
        grouped.set(id, {
          id,
          label: productLabel(product),
          count: 0,
          image: product.image,
        });
      }
      grouped.get(id).count += 1;
    });
    return [
      {
        id: "all",
        label: "All Products",
        count: items.length,
        image: items[0]?.image || groceryHeroBanners[0]?.image,
      },
      ...Array.from(grouped.values()),
    ];
  }, [items]);

  const filteredProducts = useMemo(
    () => items.filter((product) => selectedCategory === "all" || product.category === selectedCategory),
    [items, selectedCategory],
  );

  const categoryCards = categories.map((cat) => ({
    name: `${cat.label} (${cat.count})`,
    image: cat.image,
    route: "#",
    onClick: () => setSelectedCategory(cat.id),
  }));

  const showProductSections = !loading && !error && filteredProducts.length > 0;

  return (
    <main style={{ background: "#FFFFFF", color: colors.text }}>
      <BannerSlider items={groceryHeroBanners} />

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: width <= 768 ? "28px 16px" : "40px 24px" }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
          fontSize: width <= 768 ? 32 : 42,
          fontWeight: 700,
          margin: "0 0 10px 0",
          color: "#1A2E1A",
        }}>
          Fresh Groceries
        </h1>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
          fontSize: 16,
          color: "#5C7A5C",
          margin: 0,
        }}>
          Shop live products from YUBI spices and agro catalog.
        </p>
      </section>

      {showProductSections && (
        <ProductMarqueeSection
          title="Fresh Grocery Highlights"
          items={filteredProducts.slice(0, 12)}
          direction="left"
          durationSec={42}
          paddingTop="0"
        />
      )}

      {loading ? (
        <section style={emptyStateStyle}>Loading products...</section>
      ) : error ? (
        <section style={{ ...emptyStateStyle, color: "#C62828" }}>{error}</section>
      ) : items.length === 0 ? (
        <section style={emptyStateStyle}>No grocery products are available right now.</section>
      ) : (
        <>
          <CategoryImageSection title="Grocery Categories" items={categoryCards} titleInCard borderless />
          <MidBannerSlider items={groceryTextBanners} />
          {showProductSections && (
            <>
              <ProductMarqueeSection
                title="Fresh Grocery Picks"
                items={filteredProducts.slice(0, 18)}
                direction="left"
                durationSec={44}
                paddingTop="40px"
              />
              <section style={{ maxWidth: 1280, margin: "0 auto", padding: width <= 768 ? "24px 16px 0" : "24px 40px 0" }}>
                <div style={{
                  display: "flex",
                  flexWrap: width <= 768 ? "nowrap" : "wrap",
                  gap: 10,
                  alignItems: "center",
                  overflowX: width <= 768 ? "auto" : "visible",
                  WebkitOverflowScrolling: "touch",
                  paddingBottom: width <= 768 ? 6 : 0,
                  scrollbarWidth: "thin",
                }}>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        background: selectedCategory === cat.id ? "#4CAF50" : "#FFFFFF",
                        color: selectedCategory === cat.id ? "#FFFFFF" : "#1A2E1A",
                        border: selectedCategory === cat.id ? "1px solid #4CAF50" : "1px solid #D6E8D6",
                        padding: "10px 14px",
                        borderRadius: 8,
                        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>
              </section>
              <ProductGridSection title={`Showing ${filteredProducts.length} Products`} items={filteredProducts} />
            </>
          )}
        </>
      )}
    </main>
  );
}
