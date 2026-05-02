// Mock product catalog — food items + spices (single + bulk pricing)
export const FOOD_CATEGORIES = ["All", "Curries", "Biryani", "Breads", "Snacks", "Desserts"];
export const SPICE_CATEGORIES = ["All", "Whole", "Powders", "Blends", "Premium"];

export const FOODS = [
  { id: "f1", name: "Butter Chicken", category: "Curries", price: 320, rating: 4.8, veg: false, desc: "Tandoori chicken simmered in rich tomato cashew gravy with kasuri methi.", emoji: "🍛" },
  { id: "f2", name: "Paneer Tikka Masala", category: "Curries", price: 280, rating: 4.7, veg: true, desc: "Charred cottage cheese in a velvety spiced tomato sauce.", emoji: "🧀" },
  { id: "f3", name: "Hyderabadi Dum Biryani", category: "Biryani", price: 380, rating: 4.9, veg: false, desc: "Slow-cooked basmati with saffron, mint, and tender meat.", emoji: "🍚" },
  { id: "f4", name: "Veg Biryani", category: "Biryani", price: 260, rating: 4.6, veg: true, desc: "Aromatic long-grain rice layered with spiced vegetables.", emoji: "🌾" },
  { id: "f5", name: "Garlic Naan", category: "Breads", price: 80, rating: 4.7, veg: true, desc: "Tandoor-baked, brushed with garlic butter & coriander.", emoji: "🫓" },
  { id: "f6", name: "Tandoori Roti", category: "Breads", price: 40, rating: 4.5, veg: true, desc: "Whole wheat flatbread, smoky from the clay oven.", emoji: "🥖" },
  { id: "f7", name: "Samosa Chaat", category: "Snacks", price: 120, rating: 4.6, veg: true, desc: "Crushed samosas, chickpeas, chutneys, yogurt, sev.", emoji: "🥟" },
  { id: "f8", name: "Pani Puri (12 pc)", category: "Snacks", price: 90, rating: 4.8, veg: true, desc: "Crispy shells, spiced water, tangy explosions.", emoji: "🥣" },
  { id: "f9", name: "Gulab Jamun (4 pc)", category: "Desserts", price: 110, rating: 4.7, veg: true, desc: "Warm khoya dumplings in cardamom-rose syrup.", emoji: "🍯" },
  { id: "f10", name: "Rasmalai (3 pc)", category: "Desserts", price: 140, rating: 4.8, veg: true, desc: "Saffron milk, soft cheese discs, pistachios.", emoji: "🥛" },
];

const tiers = (base) => [
  { weight: "100g", price: base, discount: 0 },
  { weight: "500g", price: Math.round(base * 4.5), discount: 10 },
  { weight: "1kg", price: Math.round(base * 8.5), discount: 15 },
  { weight: "5kg", price: Math.round(base * 38), discount: 24 },
  { weight: "10kg", price: Math.round(base * 70), discount: 30 },
];

export const SPICES = [
  { id: "s1", name: "Kashmiri Saffron", category: "Premium", basePrice: 1200, rating: 4.9, desc: "Hand-picked Mongra threads from the valleys of Pampore.", tiers: [
    { weight: "1g", price: 1200, discount: 0 }, { weight: "5g", price: 5400, discount: 10 }, { weight: "10g", price: 9600, discount: 20 } ], emoji: "🌸" },
  { id: "s2", name: "Turmeric Powder (Lakadong)", category: "Powders", basePrice: 180, rating: 4.8, desc: "8% curcumin, single-origin Meghalaya, sun-dried.", tiers: tiers(180), emoji: "🟡" },
  { id: "s3", name: "Kashmiri Red Chili", category: "Powders", basePrice: 240, rating: 4.7, desc: "Deep crimson color, mild heat — for color & aroma.", tiers: tiers(240), emoji: "🌶️" },
  { id: "s4", name: "Garam Masala Royale", category: "Blends", basePrice: 320, rating: 4.9, desc: "Heirloom blend of 14 spices, stone-ground.", tiers: tiers(320), emoji: "✨" },
  { id: "s5", name: "Green Cardamom", category: "Whole", basePrice: 380, rating: 4.8, desc: "Plump Idukki pods, intense aroma.", tiers: tiers(380), emoji: "🫛" },
  { id: "s6", name: "Black Peppercorns (Tellicherry)", category: "Whole", basePrice: 220, rating: 4.7, desc: "Bold, citrusy heat from Malabar hills.", tiers: tiers(220), emoji: "⚫" },
  { id: "s7", name: "Cinnamon Sticks (Ceylon)", category: "Whole", basePrice: 280, rating: 4.6, desc: "True cinnamon — sweet, delicate, paper-thin quills.", tiers: tiers(280), emoji: "🪵" },
  { id: "s8", name: "Biryani Masala", category: "Blends", basePrice: 260, rating: 4.8, desc: "Hyderabadi-style blend, restaurant secret.", tiers: tiers(260), emoji: "🍚" },
];

export const PRODUCT_BY_ID = {};
[...FOODS, ...SPICES].forEach((p) => (PRODUCT_BY_ID[p.id] = p));

export const ORDER_STATUSES = [
  { key: "placed", label: "Order Placed", icon: "✅" },
  { key: "preparing", label: "Being Prepared", icon: "🍳" },
  { key: "picked_up", label: "Picked Up", icon: "🛵" },
  { key: "on_the_way", label: "On the Way", icon: "🚀" },
  { key: "reached", label: "Reached You", icon: "📍" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];
