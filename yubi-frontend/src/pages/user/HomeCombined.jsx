import { useEffect, useMemo, useState } from "react";
import {
  BannerSlider,
  CategoryImageSection,
  MealImageGroupsSection,
  PopularProductsScrollSection,
  ProductMarqueeSection,
  SpotlightImageStrip,
  colors,
} from "./HomeSections";
import MidBannerSlider from "../../components/shared/MidBannerSlider";
import { products as staticProducts, banners } from "../../data";
import { homeGroceryBanners, midSpiceBanners, tasteTheFreshnessMidBanner } from "../../data/banners";
import { foodAPI } from "../../lib/api";
import { buildHomeShopCategoryItems } from "../../lib/foodCategoriesUi";
import { extractProductList, mapFoodProductFromApi } from "../../lib/foodProductUtils";
import { useFoodCategories } from "../../hooks/useFoodCategories";
import breakfastImg from "../../assets/breakfast.jpg";
import lunchImg from "../../assets/Lunch.jpg";
import dinnerImg from "../../assets/Dinner 2.jpg";

const homeCategories = [
  { name: "Food", route: "/home/food", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop" },
  { name: "Spices", route: "/home/spices", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop" },
  { name: "Grocery", route: "/grocery", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop" },
  { name: "Agro Products", route: "/agro", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop" },
  { name: "Bulk Orders", route: "/spices", image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop" },
];

const homeShellStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #feeebf 0%, #fff8e7 18%, #f6ffe6 38%, #eaffd6 55%, #f1fff4 72%, #ffffff 100%)",
  fontFamily: "'Montserrat', sans-serif",
};

export default function HomeCombined() {
  const { names: categoryNames } = useFoodCategories();

  /** GET /food/products — public; mapped rows replace static catalog for all product-driven sections when non-empty. */
  const [apiProducts, setApiProducts] = useState(null);
  /**
   * GET /food/foods-spices — spice + grocery products; only `spices` rows power spice carousels.
   */
  const [foodsSpicesRows, setFoodsSpicesRows] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        /** Food rows from GET /food/products?category=Foods; grocery from GET /food/foods-spices (category Grocery). */
        const [rFoods, rFs] = await Promise.all([
          foodAPI.getProducts({ category: "Foods" }),
          foodAPI.getFoodsSpices(),
        ]);
        let i = 0;
        const byId = new Map();
        for (const raw of extractProductList(rFoods)) {
          const p = mapFoodProductFromApi(raw, i++);
          if (p.category === "food") byId.set(p.id, p);
        }
        for (const raw of extractProductList(rFs)) {
          const p = mapFoodProductFromApi(raw, i++);
          if (p.category === "grocery" && !byId.has(p.id)) byId.set(p.id, p);
        }
        const list = Array.from(byId.values());
        if (!cancelled) setApiProducts(list.length ? list : null);
      } catch {
        if (!cancelled) setApiProducts(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await foodAPI.getFoodsSpices();
        const list = extractProductList(res).map((raw, i) => mapFoodProductFromApi(raw, i));
        if (!cancelled) setFoodsSpicesRows(list);
      } catch {
        if (!cancelled) setFoodsSpicesRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const catalog = apiProducts ?? staticProducts;

  /** Popular Products: food + grocery only */
  const popularItems = useMemo(
    () => catalog.filter((p) => p.category === "food" || p.category === "grocery"),
    [catalog],
  );

  /** Food Delivered + food inspiration: food category only */
  const foods = useMemo(
    () => catalog.filter((product) => product.category === "food"),
    [catalog],
  );

  /** Spices when API has no spice rows or before load: from /food/products + static catalog */
  const spicesFallback = useMemo(
    () => catalog.filter((product) => product.category === "spices"),
    [catalog],
  );

  const spicesFromFoodsSpicesApi = useMemo(() => {
    if (!foodsSpicesRows || !foodsSpicesRows.length) return [];
    const onlySpices = foodsSpicesRows.filter((p) => p.category === "spices");
    if (onlySpices.length) return onlySpices;
    /** Same catalog as `/home/spices` when API labels masalas as Grocery, etc. */
    return foodsSpicesRows;
  }, [foodsSpicesRows]);

  /** Prefer spice rows from GET /food/foods-spices so Enquiry + cart match `/home/spices` */
  const spices = spicesFromFoodsSpicesApi.length ? spicesFromFoodsSpicesApi : spicesFallback;

  const shopByCategoryItems = useMemo(
    () => (categoryNames && categoryNames.length ? buildHomeShopCategoryItems(categoryNames) : homeCategories),
    [categoryNames],
  );

  const foodSpotlightImages = foods.map((p) => ({
    src: p.image,
    alt: p.name,
    to: `/product/${p.id}`,
  }));
  const spiceSpotlightImages = spices.map((p) => ({
    src: p.image,
    alt: p.name,
    to: `/product/${p.id}`,
  }));
  const mealGroups = [
    {
      title: "Breakfast",
      subtitle: "Light starts and crisp morning plates",
      to: "/home/food#breakfast",
      images: [breakfastImg, breakfastImg],
    },
    {
      title: "Lunch",
      subtitle: "Comfort meals for the middle of the day",
      to: "/home/food#lunch",
      images: [lunchImg, lunchImg],
    },
    {
      title: "Dinner",
      subtitle: "Rich bowls, platters and family favourites",
      to: "/home/food#dinner",
      images: [dinnerImg, dinnerImg],
    },
  ];

  return (
    <div style={homeShellStyle}>
      <main style={{ color: colors.text, background: "transparent" }}>
        <BannerSlider items={banners} />
        <CategoryImageSection title="Shop By Category" items={shopByCategoryItems} />
        <PopularProductsScrollSection title="Popular Products" items={popularItems} durationSec={52} />
        <section aria-label="Taste the Freshness" style={{ paddingTop: 8 }}>
          <MidBannerSlider items={tasteTheFreshnessMidBanner} />
        </section>
        <ProductMarqueeSection
          title="Food Delivered by our YUBI Foods"
          items={foods}
          direction="right"
          durationSec={28}
          paddingTop="36px"
        />
        <SpotlightImageStrip
          title="Fresh picks"
          images={foodSpotlightImages}
        />
        <MealImageGroupsSection title="Fresh picks & platters" groups={mealGroups} />
        <ProductMarqueeSection
          title="Spices Delivered by the YUBI Spices"
          items={spices}
          direction="left"
          durationSec={68}
          paddingTop="36px"
        />
        <MidBannerSlider key="home-spice-banners" items={midSpiceBanners} />
        <ProductMarqueeSection
          title="Inspiration for your first order"
          subtitle={null}
          items={foods}
          direction="left"
          durationSec={55}
          paddingTop="32px"
        />
        <MidBannerSlider key="home-grocery-banners" items={homeGroceryBanners} />
        <SpotlightImageStrip
          title="Spice shelf highlights"
          images={spiceSpotlightImages}
        />
        <ProductMarqueeSection
          title="Inspiration for your first order of Spices"
          subtitle={null}
          items={spices}
          direction="left"
          durationSec={55}
          paddingTop="32px"
        />
      </main>
    </div>
  );
}
