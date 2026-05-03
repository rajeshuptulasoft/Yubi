import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  BannerSlider,
  CategoryImageSection,
  MealImageGroupsSection,
  ProductMarqueeSection,
  PopularProductsScrollSection,
  colors,
} from "./HomeSections";
import MidBannerSlider from "../../components/shared/MidBannerSlider";
import { foodAPI, getApiErrorMessage } from "../../lib/api";
import { extractProductList, mapFoodProductFromApi } from "../../lib/foodProductUtils";
import { foodTextBanners } from "../../data/banners";
import homeBanner from "../../assets/homebanner.jpg.jpeg";
import breakfastImg from "../../assets/breakfast.jpg";
import lunchImg from "../../assets/Lunch.jpg";
import dinnerImg from "../../assets/Dinner 2.jpg";

const foodBanners = [
  { id: 1, headline: "Fresh Food Delivered Hot", subheadline: "Kitchen-fresh meals at your door", cta: "Order Food", route: "/menu", image: homeBanner },
  { id: 2, headline: "Chef Crafted Daily", subheadline: "Comfort dishes, snacks and sweets", cta: "See Menu", route: "/menu", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&auto=format&fit=crop" },
  { id: 3, headline: "Lunch Sorted Fast", subheadline: "Quick delivery for busy days", cta: "Order Now", route: "/menu", image: "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1600&auto=format&fit=crop" },
];

const homeShellStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #feeebf 0%, #fff8e7 18%, #f6ffe6 38%, #eaffd6 55%, #f1fff4 72%, #ffffff 100%)",
  fontFamily: "'Montserrat', sans-serif",
};

const emptyHint = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "28px 16px",
  textAlign: "center",
  color: "#5C7A5C",
  fontWeight: 700,
};

export default function HomeFood() {
  const location = useLocation();
  const [food, setFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await foodAPI.getFoodsSpices();
        const list = extractProductList(res)
          .map((raw, index) => mapFoodProductFromApi(raw, index))
          .filter((product) => product.category === "food");
        if (!cancelled) setFood(list);
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e, "Could not load food products."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const n = food.length;

  const bestSellers = useMemo(
    () => (n ? [...food, ...food.slice(0, Math.min(3, n))] : []),
    [food, n],
  );
  const chefSpecials = useMemo(
    () => (n ? [...food.slice().reverse(), ...food.slice(0, Math.min(2, n))] : []),
    [food, n],
  );

  const breakfast = useMemo(
    () =>
      n
        ? [food[1 % n], food[2 % n], food[4 % n], food[1 % n]].filter(Boolean)
        : [],
    [food, n],
  );
  const lunch = useMemo(
    () =>
      n ? [food[0 % n], food[3 % n], food[4 % n], food[0 % n]].filter(Boolean) : [],
    [food, n],
  );
  const dinner = useMemo(
    () =>
      n ? [food[3 % n], food[0 % n], food[2 % n], food[3 % n]].filter(Boolean) : [],
    [food, n],
  );
  const snacks = useMemo(
    () =>
      n ? [food[2 % n], food[0 % n], food[3 % n], food[2 % n]].filter(Boolean) : [],
    [food, n],
  );

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `/home/food#${id}`);
  };

  const foodCategories = [
    { name: "Curries", route: "/home/food#curries", onClick: () => scrollToSection("curries"), image: food[0]?.image || foodBanners[0].image, imagePosition: "center 52%" },
    { name: "Biryani", route: "/home/food#biryani", onClick: () => scrollToSection("biryani"), image: food[1 % Math.max(n, 1)]?.image || foodBanners[2].image, imagePosition: "center 58%" },
    { name: "Snacks", route: "/home/food#snacks", onClick: () => scrollToSection("snacks"), image: food[2 % Math.max(n, 1)]?.image || foodBanners[1].image, imagePosition: "center 48%" },
    { name: "Breakfast", route: "/home/food#breakfast", onClick: () => scrollToSection("breakfast"), image: breakfastImg, imagePosition: "center 50%" },
    { name: "Lunch", route: "/home/food#lunch", onClick: () => scrollToSection("lunch"), image: lunchImg, imagePosition: "center 52%" },
    { name: "Dinner", route: "/home/food#dinner", onClick: () => scrollToSection("dinner"), image: dinnerImg, imagePosition: "center 50%" },
  ];

  const mealGroups = [
    {
      title: "Breakfast",
      subtitle: "Morning plates with crisp, warm flavours",
      to: "/home/food#breakfast",
      onClick: () => scrollToSection("breakfast"),
      images: [breakfastImg, breakfastImg],
    },
    {
      title: "Lunch",
      subtitle: "Filling favourites for busy afternoons",
      to: "/home/food#lunch",
      onClick: () => scrollToSection("lunch"),
      images: [lunchImg, lunchImg],
    },
    {
      title: "Dinner",
      subtitle: "Rich comfort dishes for the table",
      to: "/home/food#dinner",
      onClick: () => scrollToSection("dinner"),
      images: [dinnerImg, dinnerImg],
    },
  ];

  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) window.setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [location.hash]);

  const showProductBlocks = !loading && !error && n > 0;

  return (
    <div style={homeShellStyle}>
      <main style={{ color: colors.text, background: "transparent" }}>
        <BannerSlider items={foodBanners} />
        <CategoryImageSection title="Food Categories" items={foodCategories} titleInCard borderless />

        {loading ? (
          <section style={emptyHint}>Loading food catalog…</section>
        ) : error ? (
          <section style={{ ...emptyHint, color: "#C62828" }}>{error}</section>
        ) : !n ? (
          <section style={emptyHint}>No food items are available right now.</section>
        ) : null}

        {showProductBlocks ? (
          <>
            <PopularProductsScrollSection title="Popular Food" items={food} />
            <MidBannerSlider items={foodTextBanners} />
            <div id="curries">
              <ProductMarqueeSection title="Best Sellers" items={bestSellers} direction="left" durationSec={42} paddingTop="40px" />
            </div>
            <div id="biryani">
              <ProductMarqueeSection title="Chef Specials" items={chefSpecials} direction="right" durationSec={44} paddingTop="28px" />
            </div>
            <MealImageGroupsSection groups={mealGroups} />
            <div id="breakfast">
              <ProductMarqueeSection title="Breakfast" items={breakfast} direction="left" durationSec={38} paddingTop="34px" />
            </div>
            <div id="lunch">
              <ProductMarqueeSection title="Lunch" items={lunch} direction="right" durationSec={40} paddingTop="28px" />
            </div>
            <div id="dinner">
              <ProductMarqueeSection title="Dinner" items={dinner} direction="left" durationSec={42} paddingTop="28px" />
            </div>
            <div id="snacks">
              <ProductMarqueeSection title="Snacks" items={snacks} direction="right" durationSec={39} paddingTop="28px" />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
