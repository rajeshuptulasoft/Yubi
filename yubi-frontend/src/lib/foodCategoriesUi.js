import { normalizeProductCategory } from "./foodProductUtils";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop",
];

function strHash(s) {
  let h = 0;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pickCategoryImage(name, products = []) {
  const n = String(name || "").trim().toLowerCase();
  const hit = products.find((p) => {
    const c = String(p.category || "").toLowerCase();
    return c === n || c.includes(n) || n.includes(c);
  });
  if (hit?.image) return hit.image;
  return PLACEHOLDER_IMAGES[strHash(name) % PLACEHOLDER_IMAGES.length];
}

/** Home “Shop By Category” — route by aisle name (works with local `/api/` and production API host). */
export function routeForHomeCategory(name) {
  const n = String(name || "").trim().toLowerCase();
  if (!n) return "/home";
  if (n.includes("spice")) return "/home/spices";
  if (n.includes("grocery")) return "/grocery";
  if (n.includes("agro")) return "/agro";
  if (n.includes("bulk") || n.includes("wholesale")) return "/spices";
  if (n === "food" || n.includes("food")) return "/home/food";
  return "/home/food";
}

export function buildHomeShopCategoryItems(names) {
  return names.map((name) => ({
    name,
    image: pickCategoryImage(name, []),
    route: routeForHomeCategory(name),
  }));
}

const FOOD_SECTION_IDS = {
  curries: "curries",
  curry: "curries",
  biryani: "biryani",
  snacks: "snacks",
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
};

export function buildFoodPageCategoryItems(names, { products = [], scrollToSection, mealImages = {} }) {
  return names.map((name) => {
    const key = String(name).trim().toLowerCase();
    const sectionId = FOOD_SECTION_IDS[key];
    const mealImg = mealImages[key];
    const image = mealImg || pickCategoryImage(name, products);
    const route = sectionId ? `/home/food#${sectionId}` : "/home/food";
    return {
      name,
      image,
      route,
      imagePosition: "center 52%",
      onClick: sectionId
        ? () => scrollToSection(sectionId)
        : () => scrollToSection("curries"),
    };
  });
}

export function filterCategoryNamesForFood(names) {
  const out = names.filter((name) => {
    const cat = normalizeProductCategory(name);
    return cat !== "spices" && cat !== "grocery" && cat !== "agro";
  });
  return out.length ? out : names;
}

export function filterCategoryNamesForSpices(names) {
  return names.filter((name) => {
    const n = String(name).toLowerCase();
    return n.includes("spice") || normalizeProductCategory(name) === "spices";
  });
}

export function filterCategoryNamesForAgro(names) {
  return names.filter((name) => {
    const n = String(name).toLowerCase();
    return n.includes("agro") || normalizeProductCategory(name) === "agro";
  });
}

export function buildSpicePageCategoryItems(names, products) {
  return names.map((name) => ({
    name,
    image: pickCategoryImage(name, products),
    route: "/home/spices",
    onClick: () => {},
  }));
}

export function buildAgroPageCategoryItems(names, products) {
  return names.map((name) => ({
    name,
    image: pickCategoryImage(name, products),
    route: "/agro",
  }));
}
