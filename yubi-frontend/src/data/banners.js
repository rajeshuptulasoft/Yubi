import homeBanner from "../assets/homebanner.jpg.jpeg";
import homeBanner2 from "../assets/homebanner2.jpg.jpeg";
import homeBanner3 from "../assets/homebanner3.jpg.jpeg";
import groceryBanner1 from "../assets/Grocery banner.jpg";
import groceryBanner2 from "../assets/Grocery Banner 2.jpg";
import groceryBanner3 from "../assets/Grocery banner 3.jpg";
import foodBanner3 from "../assets/food banner 3.jpg";
import foodBanner4 from "../assets/food banner4.jpg";

export const banners = [
  {
    id: 1,
    headline: "Fresh Food Delivered Hot",
    subheadline: "Order from our kitchen, delivered in 30 minutes",
    cta: "Order Food Now",
    route: "/home/food",
    image: homeBanner,
  },
  {
    id: 2,
    headline: "Authentic Spices from the Farm",
    subheadline: "Pure, organic, straight from Kerala and Rajasthan farms",
    cta: "Shop Spices",
    route: "/home/spices",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&auto=format&fit=crop",
  },
  {
    id: 3,
    headline: "Order Food + Spices Together",
    subheadline: "Build a richer kitchen in one easy checkout",
    cta: "Explore Combo",
    route: "/home",
    image: homeBanner3,
  },
  {
    id: 4,
    headline: "Fresh Groceries at Your Door",
    subheadline: "Vegetables, fruits and dairy at your doorstep",
    cta: "Shop Grocery",
    route: "/grocery",
    image: homeBanner2,
  },
];

export const midBanners = [
  {
    id: "mid-1",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=80",
    headline: "Taste the Freshness",
    subheadline: "Hot meals, cold drinks, delivered in minutes",
    cta: "Order Food Now",
    route: "/menu",
    overlayColor: "rgba(20, 60, 20, 0.45)",
  },
  {
    id: "mid-2",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1400&q=80",
    headline: "Pure Spices, Pure Life",
    subheadline: "Organic spices sourced directly from Indian farms",
    cta: "Shop Spices",
    route: "/spices",
    overlayColor: "rgba(100, 40, 0, 0.40)",
  },
  {
    id: "mid-3",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80",
    headline: "Fresh Groceries Daily",
    subheadline: "Vegetables, fruits and dairy — picked fresh every morning",
    cta: "Shop Grocery",
    route: "/grocery",
    overlayColor: "rgba(0, 60, 20, 0.42)",
  },
  {
    id: "mid-4",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=80",
    headline: "Direct from the Farm",
    subheadline: "Premium agro products for home and bulk orders",
    cta: "Explore Agro",
    route: "/agro",
    overlayColor: "rgba(30, 70, 10, 0.42)",
  },
];

/** Home combined: single mid-banner slide — “Taste the Freshness” + Middle Banner component */
export const tasteTheFreshnessMidBanner = [{ ...midBanners[0], id: "ttf-home-1" }];

/** Mid-page banner slides shown only on the combined home after Spices Delivered */
export const midSpiceBanners = [
  {
    id: "ms-1",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1400&q=80",
    headline: "Pure Spices, Pure Life",
    subheadline: "Organic spices sourced directly from Indian farms",
    cta: "Shop Spices",
    route: "/spices",
    overlayColor: "rgba(100, 40, 0, 0.42)",
  },
  {
    id: "ms-2",
    image: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=1400&q=80",
    headline: "Whole & Ground",
    subheadline: "Masalas, powders and whole spices — one trusted partner",
    cta: "Browse Spices",
    route: "/spices",
    overlayColor: "rgba(60, 30, 0, 0.40)",
  },
  {
    id: "ms-3",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1400&q=80",
    headline: "Bulk Spice Orders",
    subheadline: "Restaurant-ready quality and pricing for every kitchen",
    cta: "Bulk Order",
    route: "/spices",
    overlayColor: "rgba(40, 60, 20, 0.44)",
  },
  {
    id: "ms-4",
    image: "https://images.unsplash.com/photo-1512903478035-43529cfdbc6b?w=1400&q=80",
    headline: "Aroma That Travels",
    subheadline: "Freshly packed blends delivered across your city",
    cta: "Order Now",
    route: "/spices",
    overlayColor: "rgba(90, 35, 0, 0.38)",
  },
];

export const foodTextBanners = [
  {
    id: "food-text-1",
    image: foodBanner3,
    headline: "Fresh Plates, Fast Routes",
    subheadline: "Comfort meals packed bright, warm and ready for the table.",
    cta: "Order Now",
    route: "/menu",
    overlayColor: "rgba(75, 36, 5, 0.46)",
  },
  {
    id: "food-text-2",
    image: foodBanner4,
    headline: "Fresh Plates, Fast Routes",
    subheadline: "Comfort meals packed bright, warm and ready for the table.",
    cta: "Order Now",
    route: "/menu",
    overlayColor: "rgba(75, 36, 5, 0.46)",
  },
];

export const groceryTextBanners = [
  {
    id: "grocery-text-1",
    image: groceryBanner1,
    headline: "Picked Fresh Today",
    subheadline: "Vegetables, fruits, dairy and grains for every home kitchen.",
    cta: "Shop Grocery",
    route: "/grocery",
    overlayColor: "rgba(0, 60, 20, 0.42)",
  },
  {
    id: "grocery-text-2",
    image: groceryBanner2,
    headline: "Daily Staples, Cleaner Baskets",
    subheadline: "Fresh essentials arranged for quicker weekly ordering.",
    cta: "Browse Grocery",
    route: "/grocery",
    overlayColor: "rgba(20, 65, 25, 0.44)",
  },
  {
    id: "grocery-text-3",
    image: groceryBanner3,
    headline: "Fresh Picks, Everyday Value",
    subheadline: "Grocery essentials ready for fast home delivery.",
    cta: "Shop Grocery",
    route: "/grocery",
    overlayColor: "rgba(30, 70, 28, 0.44)",
  },
];

export const agroTextBanners = [
  {
    id: "agro-text-1",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80",
    headline: "Grow Better From Soil Up",
    subheadline: "Farm inputs, compost and tools selected for steady harvests.",
    cta: "Explore Agro",
    route: "/agro",
    overlayColor: "rgba(35, 70, 15, 0.46)",
  },
  {
    id: "agro-text-2",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80",
    headline: "Field Ready Essentials",
    subheadline: "Reliable products for home growers and working farms.",
    cta: "Shop Agro",
    route: "/agro",
    overlayColor: "rgba(45, 66, 20, 0.44)",
  },
];

/** Top hero on /grocery — matches home grocery mid slides */
export const groceryHeroBanners = [
  {
    id: "grocery-hero-1",
    headline: "Fresh Groceries at Your Door",
    subheadline: "Vegetables, fruits and dairy at your doorstep",
    cta: "Shop Grocery",
    route: "/grocery",
    image: groceryBanner1,
  },
  {
    id: "grocery-hero-2",
    headline: "Fresh Groceries Daily",
    subheadline: "Vegetables, fruits and dairy — picked fresh every morning",
    cta: "Shop Grocery",
    route: "/grocery",
    image: groceryBanner2,
  },
  {
    id: "grocery-hero-3",
    headline: "Fresh Picks, Everyday Value",
    subheadline: "Grocery essentials ready for fast home delivery",
    cta: "Shop Grocery",
    route: "/grocery",
    image: groceryBanner3,
  },
];

/**
 * Home (combined): grocery mid slider after “Inspiration for your first order” (two slides only).
 */
export const homeGroceryBanners = [
  {
    id: "home-gro-1",
    image: groceryBanner1,
    headline: "Fresh Groceries at Your Door",
    subheadline: "Vegetables, fruits and dairy at your doorstep",
    cta: "Shop Grocery",
    route: "/grocery",
    overlayColor: "rgba(0, 60, 20, 0.42)",
  },
  {
    id: "home-gro-2",
    image: groceryBanner2,
    headline: "Fresh Groceries Daily",
    subheadline: "Vegetables, fruits and dairy — picked fresh every morning",
    cta: "Shop Grocery",
    route: "/grocery",
    overlayColor: "rgba(0, 60, 20, 0.42)",
  },
];

/** @deprecated Use `homeGroceryBanners` — kept for `data/index` re-exports */
export const midGroceryBanners = homeGroceryBanners;
