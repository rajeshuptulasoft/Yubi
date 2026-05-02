import { useEffect, useMemo, useState } from "react";
import { BannerSlider, CategoryImageSection, ProductMarqueeSection, PopularProductsScrollSection, colors } from "./HomeSections";
import MidBannerSlider from "../../components/shared/MidBannerSlider";
import { products as staticProducts } from "../../data";
import { midSpiceBanners } from "../../data/banners";
import { foodAPI } from "../../lib/api";
import { extractProductList, mapFoodProductFromApi } from "../../lib/foodProductUtils";

function getStoredUserToken() {
  try {
    const raw = localStorage.getItem("yubiUser");
    if (!raw) return null;
    return JSON.parse(raw)?.token || null;
  } catch {
    return null;
  }
}
import homeBanner2 from "../../assets/homebanner2.jpg.jpeg";
import yubiTruck from "../../assets/Yubi Truck 4 png.png";

const spiceBanners = [
  { id: 1, headline: "Authentic Spices from the Farm", subheadline: "Fresh, fragrant and carefully sourced", cta: "Shop Spices", route: "/spices", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop" },
  { id: 2, headline: "Bulk Spice Orders", subheadline: "Restaurant-ready quality and pricing", cta: "Bulk Order", route: "/spices", image: homeBanner2 },
  { id: 3, headline: "Pure Organic Blends", subheadline: "No shortcuts, just real aroma", cta: "Explore", route: "/spices", image: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=1600&auto=format&fit=crop" },
];

const homeShellStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #feeebf 0%, #fff8e7 18%, #f6ffe6 38%, #eaffd6 55%, #f1fff4 72%, #ffffff 100%)",
  fontFamily: "'Montserrat', sans-serif",
};

export default function HomeSpices() {
  const [apiSpices, setApiSpices] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!getStoredUserToken()) return undefined;
    (async () => {
      try {
        const res = await foodAPI.getFoodsSpices();
        const list = extractProductList(res).map((raw, i) => ({
          ...mapFoodProductFromApi(raw, i),
          category: "spices",
        }));
        if (!cancelled) setApiSpices(list);
      } catch {
        if (!cancelled) setApiSpices(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const spicesFallback = useMemo(
    () => staticProducts.filter((p) => p.category === "spices"),
    [],
  );
  const spices = apiSpices !== null ? apiSpices : spicesFallback;

  const spiceCategoryItems = spices.map((product) => ({
    name: product.name,
    image: product.image,
    route: "#",
    onClick: () => {},
  }));
  const groupedSpices = [
    { title: "Daily Use Spices", items: spices.slice(0, 4) },
    { title: "Premium Picks", items: spices.slice(1, 5) },
    { title: "Bulk Favorites", items: spices.slice(0, 3) },
  ];
  return (
    <div style={homeShellStyle}>
      <main style={{ color: colors.text, background: "transparent" }}>
        <BannerSlider items={spiceBanners} />
        <CategoryImageSection
          title="Spice Categories"
          items={spiceCategoryItems}
          titleInCard
          borderless
          titleRight={<div className="spice-category-truck-track"><img src={yubiTruck} alt="YUBI delivery truck" className="spice-category-truck" /></div>}
        />
        <PopularProductsScrollSection title="Popular Spices" items={spices} />
        <MidBannerSlider items={midSpiceBanners} />
        {groupedSpices.map((group, index) => (
          <ProductMarqueeSection
            key={group.title}
            title={group.title}
            items={group.items.length ? group.items : spices}
            direction={index % 2 === 0 ? "left" : "right"}
            durationSec={46 + index * 4}
            paddingTop={index === 0 ? "40px" : "28px"}
          />
        ))}
      </main>
    </div>
  );
}
