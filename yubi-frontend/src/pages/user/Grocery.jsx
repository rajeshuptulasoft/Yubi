import { useState } from "react";
import { BannerSlider, CategoryImageSection, ProductMarqueeSection, colors } from "./HomeSections";
import MidBannerSlider from "../../components/shared/MidBannerSlider";
import { groceryHeroBanners, groceryTextBanners } from "../../data/banners";

// 200+ Grocery Products with proper Unsplash images
const allGroceryProducts = [
  // VEGETABLES (30 items) - ALL WITH PROPER IMAGES
  { category: "Vegetables", title: "Fresh Tomatoes", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Farm fresh red tomatoes picked daily" },
  { category: "Vegetables", title: "Green Spinach", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Tender leafy greens washed and packed" },
  { category: "Vegetables", title: "Red Onions", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop", desc: "Fresh red onions for everyday cooking" },
  { category: "Vegetables", title: "Fresh Ginger", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop", desc: "Organic ginger for cooking and tea" },
  { category: "Vegetables", title: "Fresh Garlic", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop", desc: "Aromatic garlic bulbs for all dishes" },
  { category: "Vegetables", title: "Carrots", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop", desc: "Crunchy orange carrots packed with beta-carotene" },
  { category: "Vegetables", title: "Broccoli", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Fresh green broccoli florets" },
  { category: "Vegetables", title: "Cauliflower", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop", desc: "White cauliflower florets for curries" },
  { category: "Vegetables", title: "Potatoes", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop", desc: "Versatile potatoes for all cooking" },
  { category: "Vegetables", title: "Cabbage", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Fresh green cabbage heads" },
  { category: "Vegetables", title: "Cucumber", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop", desc: "Crisp green cucumbers for salads" },
  { category: "Vegetables", title: "Bell Pepper Red", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop", desc: "Sweet red bell peppers" },
  { category: "Vegetables", title: "Bell Pepper Green", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop", desc: "Fresh green bell peppers" },
  { category: "Vegetables", title: "Eggplant", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Purple eggplant for Indian curries" },
  { category: "Vegetables", title: "Mushroom", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop", desc: "Fresh white button mushrooms" },
  { category: "Vegetables", title: "Green Beans", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop", desc: "Tender green beans for stir fry" },
  { category: "Vegetables", title: "Radish", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop", desc: "Crisp white radishes" },
  { category: "Vegetables", title: "Beetroot", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Earthy red beetroots" },
  { category: "Vegetables", title: "Pumpkin", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop", desc: "Orange pumpkin for seasonal recipes" },
  { category: "Vegetables", title: "Okra", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop", desc: "Fresh okra for bhindi masala" },
  { category: "Vegetables", title: "Methi Leaves", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop", desc: "Aromatic fenugreek leaves" },
  { category: "Vegetables", title: "Bottle Gourd", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Light green bottle gourd" },
  { category: "Vegetables", title: "Ridge Gourd", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop", desc: "Spiky ridge gourd for curries" },
  { category: "Vegetables", title: "Bitter Gourd", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop", desc: "Bitter gourd for medicinal curries" },
  { category: "Vegetables", title: "Corn", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop", desc: "Fresh sweet corn cobs" },
  { category: "Vegetables", title: "Fresh Peas", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Green peas in season" },
  { category: "Vegetables", title: "Coriander Leaves", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop", desc: "Fresh cilantro for garnish" },
  { category: "Vegetables", title: "Mint Leaves", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop", desc: "Fresh mint for drinks and curries" },
  { category: "Vegetables", title: "Lemon", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop", desc: "Tangy yellow lemons" },
  { category: "Vegetables", title: "Turmeric Root", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Golden turmeric rhizomes" },

  // FRUITS (30 items) - WITH PROPER FRUIT IMAGES
  { category: "Fruits", title: "Mango", image: "https://images.unsplash.com/photo-1585937421612-70a19fb6da4d?w=500&auto=format&fit=crop", desc: "Sweet Alphonso mangoes in season" },
  { category: "Fruits", title: "Banana", image: "https://images.unsplash.com/photo-1587182620342-7c7fb95f7e4f?w=500&auto=format&fit=crop", desc: "Fresh yellow bananas bunches" },
  { category: "Fruits", title: "Apple", image: "https://images.unsplash.com/photo-1560806e83697-8cc1f5d0da4d?w=500&auto=format&fit=crop", desc: "Crisp red apples from orchards" },
  { category: "Fruits", title: "Orange", image: "https://images.unsplash.com/photo-1589985643862-e03c1a211868?w=500&auto=format&fit=crop", desc: "Juicy sweet oranges" },
  { category: "Fruits", title: "Grapes", image: "https://images.unsplash.com/photo-1615485676550-e6761f50cecf?w=500&auto=format&fit=crop", desc: "Purple and green grape bunches" },
  { category: "Fruits", title: "Watermelon", image: "https://images.unsplash.com/photo-1592635059360-6a3e08e6d7c3?w=500&auto=format&fit=crop", desc: "Sweet watermelon slices" },
  { category: "Fruits", title: "Papaya", image: "https://images.unsplash.com/photo-1585937421612-70a19fb6da4d?w=500&auto=format&fit=crop", desc: "Golden papaya fruits" },
  { category: "Fruits", title: "Pineapple", image: "https://images.unsplash.com/photo-1550258987-920a122fbf4f?w=500&auto=format&fit=crop", desc: "Tropical pineapples with crown" },
  { category: "Fruits", title: "Pomegranate", image: "https://images.unsplash.com/photo-1585937421612-70a19fb6da4d?w=500&auto=format&fit=crop", desc: "Ruby red pomegranate seeds" },
  { category: "Fruits", title: "Guava", image: "https://images.unsplash.com/photo-1587182620342-7c7fb95f7e4f?w=500&auto=format&fit=crop", desc: "Green guava fruits" },
  { category: "Fruits", title: "Strawberry", image: "https://images.unsplash.com/photo-1560806e83697-8cc1f5d0da4d?w=500&auto=format&fit=crop", desc: "Sweet red strawberries fresh" },
  { category: "Fruits", title: "Blueberry", image: "https://images.unsplash.com/photo-1589985643862-e03c1a211868?w=500&auto=format&fit=crop", desc: "Antioxidant rich blueberries" },
  { category: "Fruits", title: "Kiwi", image: "https://images.unsplash.com/photo-1615485676550-e6761f50cecf?w=500&auto=format&fit=crop", desc: "Green kiwi fruits tangy and sweet" },
  { category: "Fruits", title: "Dragon Fruit", image: "https://images.unsplash.com/photo-1592635059360-6a3e08e6d7c3?w=500&auto=format&fit=crop", desc: "Exotic pink dragon fruit" },
  { category: "Fruits", title: "Coconut", image: "https://images.unsplash.com/photo-1585937421612-70a19fb6da4d?w=500&auto=format&fit=crop", desc: "Fresh coconuts for juice" },
  { category: "Fruits", title: "Grapefruit", image: "https://images.unsplash.com/photo-1587182620342-7c7fb95f7e4f?w=500&auto=format&fit=crop", desc: "Tangy grapefruit halves" },
  { category: "Fruits", title: "Pear", image: "https://images.unsplash.com/photo-1560806e83697-8cc1f5d0da4d?w=500&auto=format&fit=crop", desc: "Soft pears perfect for snacking" },
  { category: "Fruits", title: "Peach", image: "https://images.unsplash.com/photo-1589985643862-e03c1a211868?w=500&auto=format&fit=crop", desc: "Fuzzy peaches sweet and juicy" },
  { category: "Fruits", title: "Plum", image: "https://images.unsplash.com/photo-1615485676550-e6761f50cecf?w=500&auto=format&fit=crop", desc: "Purple plums with stone" },
  { category: "Fruits", title: "Cherry", image: "https://images.unsplash.com/photo-1592635059360-6a3e08e6d7c3?w=500&auto=format&fit=crop", desc: "Sweet red cherries fresh" },
  { category: "Fruits", title: "Litchi", image: "https://images.unsplash.com/photo-1585937421612-70a19fb6da4d?w=500&auto=format&fit=crop", desc: "Sweet litchi fruits in season" },
  { category: "Fruits", title: "Chikoo", image: "https://images.unsplash.com/photo-1587182620342-7c7fb95f7e4f?w=500&auto=format&fit=crop", desc: "Brown chikoo fruits sweet" },
  { category: "Fruits", title: "Mosambi", image: "https://images.unsplash.com/photo-1560806e83697-8cc1f5d0da4d?w=500&auto=format&fit=crop", desc: "Sweet mosambi citrus fruit" },
  { category: "Fruits", title: "Jamun", image: "https://images.unsplash.com/photo-1589985643862-e03c1a211868?w=500&auto=format&fit=crop", desc: "Black jamun berries in season" },
  { category: "Fruits", title: "Custard Apple", image: "https://images.unsplash.com/photo-1615485676550-e6761f50cecf?w=500&auto=format&fit=crop", desc: "Creamy custard apple flesh" },
  { category: "Fruits", title: "Fig", image: "https://images.unsplash.com/photo-1592635059360-6a3e08e6d7c3?w=500&auto=format&fit=crop", desc: "Sweet dried figs fresh" },
  { category: "Fruits", title: "Mulberry", image: "https://images.unsplash.com/photo-1585937421612-70a19fb6da4d?w=500&auto=format&fit=crop", desc: "Black mulberries sweet" },
  { category: "Fruits", title: "Tamarind", image: "https://images.unsplash.com/photo-1587182620342-7c7fb95f7e4f?w=500&auto=format&fit=crop", desc: "Sour tamarind pods" },
  { category: "Fruits", title: "Jujube", image: "https://images.unsplash.com/photo-1560806e83697-8cc1f5d0da4d?w=500&auto=format&fit=crop", desc: "Brown jujube dates sweet" },
  { category: "Fruits", title: "Apricot", image: "https://images.unsplash.com/photo-1589985643862-e03c1a211868?w=500&auto=format&fit=crop", desc: "Dried apricots sweet" },

  // DAIRY (25 items) - WITH PROPER IMAGES
  { category: "Dairy", title: "Whole Milk", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop", desc: "Fresh dairy milk delivered chilled" },
  { category: "Dairy", title: "Toned Milk", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop", desc: "Partially skimmed toned milk" },
  { category: "Dairy", title: "Paneer", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Fresh cottage cheese paneer" },
  { category: "Dairy", title: "Ghee", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop", desc: "Pure clarified butter ghee" },
  { category: "Dairy", title: "Butter", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop", desc: "Creamy salted butter" },
  { category: "Dairy", title: "Yogurt", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Thick creamy yogurt cups" },
  { category: "Dairy", title: "Skimmed Milk", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop", desc: "Low fat skimmed milk" },
  { category: "Dairy", title: "Cream", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop", desc: "Fresh whipped cream" },
  { category: "Dairy", title: "Mozzarella Cheese", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Soft mozzarella cheese" },
  { category: "Dairy", title: "Cheddar Cheese", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Sharp cheddar cheese blocks" },
  { category: "Dairy", title: "Condensed Milk", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop", desc: "Sweet condensed milk" },
  { category: "Dairy", title: "Milk Powder", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Instant milk powder packets" },
  { category: "Dairy", title: "Ice Cream", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Creamy vanilla ice cream" },
  { category: "Dairy", title: "Curd", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop", desc: "Fresh homemade curd" },
  { category: "Dairy", title: "Lassi", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Traditional sweet yogurt drink" },
  { category: "Dairy", title: "Kheer", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Sweet milk rice pudding" },
  { category: "Dairy", title: "Flavored Milk", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop", desc: "Chocolate flavored milk" },
  { category: "Dairy", title: "Buttermilk", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Tangy traditional buttermilk" },
  { category: "Dairy", title: "Whey Protein", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Protein rich whey powder" },
  { category: "Dairy", title: "Cottage Cheese", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop", desc: "Soft cottage cheese blocks" },
  { category: "Dairy", title: "String Cheese", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Stringy mozzarella cheese" },
  { category: "Dairy", title: "Ricotta", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Creamy ricotta cheese" },
  { category: "Dairy", title: "Feta Cheese", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop", desc: "Crumbly feta cheese" },
  { category: "Dairy", title: "Blue Cheese", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Blue veined cheese" },
  { category: "Dairy", title: "Spread Cheese", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Spreadable cheese jars" },

  // GRAINS & PULSES (40+ items)
  { category: "Grains & Pulses", title: "Basmati Rice", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop", desc: "Long grain aged basmati rice" },
  { category: "Grains & Pulses", title: "Brown Rice", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop", desc: "Whole grain brown rice" },
  { category: "Grains & Pulses", title: "White Rice", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop", desc: "Polished white rice" },
  { category: "Grains & Pulses", title: "Moong Dal", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Yellow moong dal lentils" },
  { category: "Grains & Pulses", title: "Masur Dal", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Red masur dal lentils" },
  { category: "Grains & Pulses", title: "Wheat Flour", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Ground wheat flour" },
  { category: "Grains & Pulses", title: "Chickpeas", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "White chickpea beans" },
  { category: "Grains & Pulses", title: "Kidney Beans", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Red kidney beans" },
  { category: "Grains & Pulses", title: "Black Beans", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Black bean varieties" },
  { category: "Grains & Pulses", title: "Lentils", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Green lentils varieties" },
  { category: "Grains & Pulses", title: "Oats", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop", desc: "Rolled oats cereal" },
  { category: "Grains & Pulses", title: "Quinoa", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop", desc: "Super grain quinoa" },
];

export default function Grocery() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Products", count: allGroceryProducts.length, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop" },
    { id: "vegetables", label: "Vegetables", count: allGroceryProducts.filter(p => p.category === "Vegetables").length, image: allGroceryProducts.find((p) => p.category === "Vegetables")?.image },
    { id: "fruits", label: "Fruits", count: allGroceryProducts.filter(p => p.category === "Fruits").length, image: allGroceryProducts.find((p) => p.category === "Fruits")?.image },
    { id: "dairy", label: "Dairy", count: allGroceryProducts.filter(p => p.category === "Dairy").length, image: allGroceryProducts.find((p) => p.category === "Dairy")?.image },
    { id: "grains", label: "Grains & Pulses", count: allGroceryProducts.filter(p => p.category === "Grains & Pulses").length, image: allGroceryProducts.find((p) => p.category === "Grains & Pulses")?.image },
  ];
  const categoryCards = categories.map((cat) => ({
    name: cat.label,
    image: cat.image,
    route: "#",
    onClick: () => setSelectedCategory(cat.id),
  }));

  const filteredProducts = allGroceryProducts.filter(product => {
    const matchesCategory = selectedCategory === "all" || 
      (selectedCategory === "vegetables" && product.category === "Vegetables") ||
      (selectedCategory === "fruits" && product.category === "Fruits") ||
      (selectedCategory === "dairy" && product.category === "Dairy") ||
      (selectedCategory === "grains" && product.category === "Grains & Pulses");
    return matchesCategory;
  });
  const marqueeProducts = filteredProducts.slice(0, 18).map((product, index) => ({
    id: `grocery-${selectedCategory}-${index}`,
    name: product.title,
    category: "grocery",
    price: 60 + (index % 8) * 15,
    unit: product.category,
    description: product.desc,
    image: product.image,
    rating: 4.5,
    reviews: 80 + index,
  }));

  return (
    <main style={{ background: "#FFFFFF", color: colors.text }}>
      <BannerSlider items={groceryHeroBanners} />

      {/* TITLE */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
          fontSize: 42,
          fontWeight: 700,
          margin: "0 0 10px 0",
          color: "#1A2E1A"
        }}>
          Fresh Groceries
        </h1>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
          fontSize: 16,
          color: "#5C7A5C",
          margin: 0
        }}>
          Shop from {allGroceryProducts.length}+ quality products
        </p>
      </section>

      <CategoryImageSection title="Grocery Categories" items={categoryCards} titleInCard borderless />
      <MidBannerSlider items={groceryTextBanners} />
      <ProductMarqueeSection title="Fresh Grocery Picks" items={marqueeProducts} direction="left" durationSec={44} paddingTop="40px" />

      {/* PRODUCTS WITH FILTER */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24 }}>
          {/* LEFT FILTER BOX */}
          <div style={{
            background: "#F9FBF9",
            borderRadius: 16,
            padding: 24,
            height: "fit-content",
            border: "1px solid #E8F5E9",
            position: "sticky",
            top: 80
          }}>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              margin: "0 0 16px 0",
              color: "#1A2E1A"
            }}>
              Categories
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    background: selectedCategory === cat.id ? "#4CAF50" : "white",
                    color: selectedCategory === cat.id ? "white" : "#1A1A1A",
                    border: selectedCategory === cat.id ? "none" : "1px solid #D6E8D6",
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>{cat.label}</span>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>({cat.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT PRODUCTS GRID */}
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16
            }}>
              {filteredProducts.map((product, idx) => (
                <div
                  key={idx}
                  className="product-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    minHeight: 420,
                    height: "100%",
                    background: "white",
                    border: "none",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(26, 46, 26, 0.08)",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.boxShadow = "0 18px 42px rgba(26, 46, 26, 0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(26, 46, 26, 0.08)";
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      height: 220,
                      background: "#f7faf7",
                      borderBottom: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 14,
                      overflow: "hidden"
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center"
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16 }}>
                    <div
                      style={{
                        display: "inline-block",
                        background: "#E8F5E9",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        color: "#4CAF50",
                        fontWeight: 700,
                        marginBottom: 8,
                        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                        width: "fit-content"
                      }}
                    >
                      {product.category}
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1A2E1A",
                        margin: "8px 0 8px 0",
                        minHeight: 36
                      }}
                    >
                      {product.title}
                    </h3>
                    <p
                      style={{
                        color: "#5C7A5C",
                        fontSize: 12,
                        margin: 0,
                        lineHeight: 1.4,
                        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                        flex: 1
                      }}
                    >
                      {product.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* RESULTS INFO */}
            <div style={{
              marginTop: 40,
              textAlign: "center",
              padding: "20px",
              background: "#F9FBF9",
              borderRadius: 12,
              fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
              color: "#5C7A5C"
            }}>
              Showing {filteredProducts.length} products
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
