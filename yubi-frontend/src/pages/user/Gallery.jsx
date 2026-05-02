import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWindowSize } from "../../hooks/useWindowSize";
import galary from "../../assets/galary.jpg.jpeg";
import galary1 from "../../assets/galary1.jpg.jpeg";
import galary2 from "../../assets/galary2.jpg.jpeg";
import galary3 from "../../assets/galary3.jpg.jpeg";

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({ customers: 0, rating: 0, stores: 0 });
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const isSmallMobile = width <= 480;

  // Animated counter
  useEffect(() => {
    const intervals = [];
    
    const animateCounter = (target, duration = 2000) => {
      const increment = target / (duration / 50);
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setStats(prev => ({ ...prev, customers: Math.floor(current) }));
      }, 50);
      intervals.push(interval);
    };

    const animateRating = (target, duration = 2000) => {
      const increment = target / (duration / 50);
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setStats(prev => ({ ...prev, rating: Math.floor(current * 10) / 10 }));
      }, 50);
      intervals.push(interval);
    };

    const animateStores = (target, duration = 2000) => {
      const increment = target / (duration / 50);
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setStats(prev => ({ ...prev, stores: Math.floor(current) }));
      }, 50);
      intervals.push(interval);
    };

    animateCounter(25000);
    animateRating(4.8);
    animateStores(50);

    return () => intervals.forEach(i => clearInterval(i));
  }, []);

  // Auto-sliding banners with Unsplash images
  const banners = [
    { title: "Premium Spices Collection", subtitle: "Hand-selected from heritage farms", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=1600&auto=format&fit=crop" },
    { title: "Fresh Farm Foods", subtitle: "Chef-crafted meals delivered daily", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&auto=format&fit=crop" },
    { title: "Organic Grocery Essentials", subtitle: "Everything for your kitchen", image: "https://images.unsplash.com/photo-1488459716781-6818a6aa9a5d?w=1600&auto=format&fit=crop" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const categories = ["All", "Food", "Spices", "Grocery", "Agro"];
  
  // 100+ products with Unsplash images
  const allGalleryItems = [
    // FOOD (30 items)
    { category: "Food", title: "YUBI Food Gallery", desc: "Freshly prepared dishes from our kitchen", image: galary },
    { category: "Food", title: "YUBI Spice Gallery", desc: "Premium spice packs ready for your kitchen", image: galary1 },
    { category: "Food", title: "YUBI Delivery Gallery", desc: "Packed and prepared for quick delivery", image: galary2 },
    { category: "Food", title: "YUBI Product Gallery", desc: "Signature products from our collection", image: galary3 },
    { category: "Food", title: "Butter Chicken", desc: "Tender chicken in creamy butter sauce", image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b8?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Dal Makhani", desc: "Creamy black lentils with kidney beans", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Chole Bhature", desc: "Fluffy bhature with spiced chickpeas", image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Samosa", desc: "Crispy pastry with spiced potato filling", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Tandoori Chicken", desc: "Marinated in yogurt and spices", image: "https://images.unsplash.com/photo-1610057099443-bc5e6cdc5f50?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Biryani Rice", desc: "Fragrant basmati rice cooked with spices", image: "https://images.unsplash.com/photo-1585937421612-70a19fb6da4d?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Naan Bread", desc: "Soft and fluffy Indian bread", image: "https://images.unsplash.com/photo-1528145535800-6caf6857149b?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Roti", desc: "Whole wheat Indian flatbread", image: "https://images.unsplash.com/photo-1572821478553-0d6c47ee4bc3?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Khichdi", desc: "Comforting rice and lentil dish", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Idli", desc: "Steamed rice and lentil cake", image: "https://images.unsplash.com/photo-1585937421612-70a19fb6da4d?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Upma", desc: "Semolina porridge with vegetables", image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Pakora", desc: "Crispy vegetable fritters", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Sambar", desc: "South Indian vegetable stew", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Rasam", desc: "Tangy South Indian soup", image: "https://images.unsplash.com/photo-1610057099443-bc5e6cdc5f50?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Gobi 65", desc: "Crispy cauliflower snack", image: "https://images.unsplash.com/photo-1585937421612-70a19fb6da4d?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Kebab", desc: "Grilled meat kebabs", image: "https://images.unsplash.com/photo-1572821478553-0d6c47ee4bc3?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Korma", desc: "Mild creamy meat curry", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Vindaloo", desc: "Spicy and tangy curry", image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b8?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Tikka Masala", desc: "Marinated meat in cream sauce", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Aloo Gobi", desc: "Potato and cauliflower curry", image: "https://images.unsplash.com/photo-1488459716781-6818a6aa9a5d?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Palak Paneer", desc: "Spinach and cheese curry", image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Baingan Bharta", desc: "Smoked eggplant mash", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Bhindi Masala", desc: "Spiced okra curry", image: "https://images.unsplash.com/photo-1610057099443-bc5e6cdc5f50?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Rajma", desc: "Red kidney bean curry", image: "https://images.unsplash.com/photo-1585937421612-70a19fb6da4d?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Pav Bhaji", desc: "Spiced vegetable curry with bread", image: "https://images.unsplash.com/photo-1572821478553-0d6c47ee4bc3?w=500&auto=format&fit=crop" },
    { category: "Food", title: "Dhokla", desc: "Steamed fermented cake", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop" },

    // SPICES (30 items)
    { category: "Spices", title: "Garam Masala", desc: "Bold house blend for curries", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Kashmir Chilli", desc: "Bright red color with gentle heat", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Turmeric Powder", desc: "Pure organic turmeric from Kerala", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Coriander Powder", desc: "Aromatic coriander for daily cooking", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Cumin Powder", desc: "Earthy cumin for dals and tadka", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Chaat Masala", desc: "Tangy sprinkle for chaat and fruit", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Fenugreek Seeds", desc: "Bitter herb for cooking", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Black Cardamom", desc: "Bold aromatic spice", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Green Cardamom", desc: "Fragrant sweet spice", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Cloves", desc: "Aromatic flower buds", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Cinnamon Sticks", desc: "Sweet aromatic bark", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Nutmeg", desc: "Warm and earthy spice", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Mace", desc: "Outer covering of nutmeg", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Bay Leaves", desc: "Aromatic leaves for cooking", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Fennel Seeds", desc: "Sweet licorice-like seeds", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Mustard Seeds", desc: "Pungent seeds for tadka", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Nigella Seeds", desc: "Tiny black seeds", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Poppy Seeds", desc: "Tiny white seeds", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Sesame Seeds", desc: "Nutty flavored seeds", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Asafetida", desc: "Pungent aromatic resin", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Black Pepper", desc: "Sharp hot spice", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "White Pepper", desc: "Milder pepper", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Red Chilli Powder", desc: "Hot chilli spice", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Curry Leaves", desc: "Fresh aromatic leaves", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Dried Chilli", desc: "Whole dried red chillies", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Tamarind", desc: "Tangy fruit pulp", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Kokum", desc: "Sour fruit for curries", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Amchur", desc: "Dried mango powder", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Pomegranate Seeds", desc: "Tart spice for seasoning", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Spices", title: "Kasuri Methi", desc: "Dried fenugreek leaves", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },

    // GROCERY (25 items)
    { category: "Grocery", title: "Basmati Rice", desc: "Long grain aged basmati rice", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Whole Milk", desc: "Fresh dairy milk delivered chilled", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Fresh Spinach", desc: "Tender leafy greens washed and packed", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Fresh Tomatoes", desc: "Farm fresh red tomatoes picked daily", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Red Onions", desc: "Fresh red onions for everyday cooking", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Coconut Oil", desc: "Cold pressed coconut oil for cooking", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Carrots", desc: "Crunchy orange carrots packed with beta-carotene", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Broccoli", desc: "Fresh green broccoli florets", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Potatoes", desc: "Versatile potatoes for all cooking", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Cabbage", desc: "Fresh green cabbage heads", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Cucumber", desc: "Crisp green cucumbers for salads", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Bell Pepper Red", desc: "Sweet red bell peppers", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Mushroom", desc: "Fresh white button mushrooms", image: "https://images.unsplash.com/photo-1599599810694-c6d2b0b07348?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Green Beans", desc: "Tender green beans for stir fry", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Garlic", desc: "Aromatic garlic bulbs for all dishes", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Ginger", desc: "Organic ginger for cooking and tea", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Paneer", desc: "Fresh cottage cheese paneer", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Ghee", desc: "Pure clarified butter ghee", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Yogurt", desc: "Thick creamy yogurt cups", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Butter", desc: "Creamy salted butter", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Wheat Flour", desc: "Ground wheat flour", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Dal Lentils", desc: "Yellow moong dal lentils", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Sugar", desc: "White granulated sugar", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Salt", desc: "Table salt fine", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop" },
    { category: "Grocery", title: "Honey", desc: "Pure raw honey", image: "https://images.unsplash.com/photo-1596040901950-35dd537410d0?w=500&auto=format&fit=crop" },

    // AGRO (25 items)
    { category: "Agro", title: "Organic Brown Rice", desc: "Farm-direct organic brown rice", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Vermicompost", desc: "Organic compost for healthy soil", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Organic Seeds", desc: "Premium quality organic seeds", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Farm Tools", desc: "Essential tools for farming", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Wheat Grains", desc: "High-quality organic wheat", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Corn Seeds", desc: "Certified organic corn seeds", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "NPK Fertilizer", desc: "Balanced nutrient fertilizer", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Bio-Pesticide", desc: "Natural bio-pesticide", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Neem Pesticide", desc: "Organic neem-based pesticide", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Barley Seeds", desc: "Premium barley seeds", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Pulses Mix", desc: "Organic pulses collection", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Millet Grains", desc: "Ancient grain millet", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Quinoa Seeds", desc: "Super grain quinoa", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Oats", desc: "Rolled oats cereal", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Ragi Flour", desc: "Finger millet flour", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Seaweed Fertilizer", desc: "Liquid seaweed extract", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Soil Testing Kit", desc: "Complete soil testing kit", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Irrigation System", desc: "Complete irrigation setup", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Drip Hose", desc: "Micro drip irrigation hose", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Compost Bin", desc: "Large composting container", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Plant Support Stake", desc: "Bamboo plant support sticks", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Garden Gloves", desc: "Durable garden work gloves", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Pruning Shears", desc: "Sharp pruning scissors", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Cow Dung Compost", desc: "Natural cow dung compost", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop" },
    { category: "Agro", title: "Sulfur Powder", desc: "Soil amendment powder", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop" }
  ];

  const filteredItems = selectedCategory === "All" ? allGalleryItems : allGalleryItems.filter(item => item.category === selectedCategory);

  return (
    <main style={{ background: "#FFFFFF", color: "#1A1A1A" }}>
      {/* BANNER */}
      <section style={{
        position: "relative",
        height: isMobile ? 240 : 400,
        background: `url(${banners[currentSlide].image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}>
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.8)",
            border: "none",
            borderRadius: "50%",
            width: isMobile ? 40 : 50,
            height: isMobile ? 40 : 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10
          }}
        >
          <ChevronLeft size={isMobile ? 20 : 24} color="#4CAF50" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
          style={{
            position: "absolute",
            right: isMobile ? 12 : 20,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.8)",
            border: "none",
            borderRadius: "50%",
            width: isMobile ? 40 : 50,
            height: isMobile ? 40 : 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10
          }}
        >
          <ChevronRight size={isMobile ? 20 : 24} color="#4CAF50" />
        </button>

        {/* Dots */}
        <div style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10,
          zIndex: 10
        }}>
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "none",
                background: currentSlide === idx ? "#4CAF50" : "rgba(255,255,255,0.6)",
                cursor: "pointer"
              }}
            />
          ))}
        </div>
      </section>

      {/* PRODUCTS WITH FILTER */}
      <section style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "28px 14px" : "40px 24px" }}>
        <div style={{ marginBottom: isMobile ? 24 : 40 }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
            fontSize: isMobile ? 28 : 42,
            fontWeight: 700,
            margin: isMobile ? "0 0 10px 0" : "0 0 20px 0",
            color: "#1A2E1A"
          }}>
            Explore Our Products
          </h2>
          <p style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: isMobile ? 14 : 16, color: "#5C7A5C", margin: 0 }}>
            {filteredItems.length}+ items in {selectedCategory === "All" ? "all categories" : selectedCategory}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "200px 1fr", gap: isMobile ? 16 : 24 }}>
          {/* LEFT FILTER BOX */}
          <div style={{
            background: "#F9FBF9",
            borderRadius: isMobile ? 14 : 16,
            padding: isMobile ? 14 : 24,
            height: "fit-content",
            border: "1px solid #E8F5E9",
            position: isMobile ? "static" : "sticky",
            top: 80,
            overflow: "hidden"
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
            <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 8, overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? 4 : 0, scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: selectedCategory === cat ? "#4CAF50" : "white",
                    color: selectedCategory === cat ? "white" : "#1A1A1A",
                    border: selectedCategory === cat ? "none" : "1px solid #D6E8D6",
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    flex: isMobile ? "0 0 auto" : "initial",
                    whiteSpace: "nowrap"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT PRODUCTS GRID */}
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: isSmallMobile ? "1fr" : isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fill, minmax(220px, 1fr))",
              gap: isMobile ? 12 : 16
            }}>
              {filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  className="product-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    minHeight: isMobile ? "auto" : 420,
                    height: "100%",
                    background: "white",
                    border: "1px solid #d6e8d6",
                    borderRadius: isMobile ? 10 : 12,
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(26, 46, 26, 0.08)",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(26, 46, 26, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(26, 46, 26, 0.08)";
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      height: isMobile ? 150 : 220,
                      background: "#f7faf7",
                      borderBottom: "1px solid #d6e8d6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      overflow: "hidden"
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center"
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: isMobile ? 12 : 16 }}>
                    <div
                      style={{
                        display: "inline-block",
                        background: "#E8F5E9",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: isMobile ? 10 : 11,
                        color: "#4CAF50",
                        fontWeight: 700,
                        marginBottom: 8,
                        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                        width: "fit-content"
                      }}
                    >
                      {item.category}
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                        fontSize: isMobile ? 13 : 14,
                        fontWeight: 700,
                        color: "#1A2E1A",
                        margin: "8px 0 8px 0",
                        minHeight: isMobile ? 34 : 36
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        color: "#5C7A5C",
                        fontSize: isMobile ? 11 : 12,
                        margin: 0,
                        lineHeight: 1.4,
                        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
                        flex: 1
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
