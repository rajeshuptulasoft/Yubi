import haldiPowderImg from "../assets/Haldi powder.png";
import garamMasalaImg from "../assets/Garam Masala.png";
import kashmirChilliImg from "../assets/Kashmir chilli.png";
import chilliMasalaImg from "../assets/CHILLI MASALA.png";
import chaatMasalaImg from "../assets/Chaat masala.png";
import chickenMasalaImg from "../assets/Chicken masala.png";
import corianderPowderImg from "../assets/CORIENDER POWDER.png";
import cuminPowderImg from "../assets/cumin powder.png";
import curryMasalaImg from "../assets/curry masala.png";
import dalchiniPowderImg from "../assets/Dalchini powder.png";
import fishMasalaImg from "../assets/Fish masala.png";
import jalJeeraImg from "../assets/JAL JEERA.png";
import meatMasalaImg from "../assets/meat masala.png";
import sahiBiryaniImg from "../assets/sahi biryani masala.png";
import sahiPaneerImg from "../assets/sahi paneer.png";
import spicesPouchMonkImg from "../assets/Spices pouch monk.png";
import chanaMasalaImg from "../assets/chana masala.png";

export const products = [
  { id: "1", name: "Paneer Butter Masala", category: "food", price: 180, unit: "1 portion", description: "Rich and creamy paneer in butter tomato gravy.", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=900&auto=format&fit=crop", rating: 4.8, reviews: 210, inStock: true, badge: "Bestseller", isVeg: true },
  { id: "2", name: "Haldi powder", category: "spices", price: 120, bulkPrice: 95, unit: "250g", description: "Pure organic turmeric sourced from Kerala farms.", image: haldiPowderImg, rating: 4.9, reviews: 340, inStock: true, badge: "Organic", isOrganic: true },
  { id: "3", name: "Fresh Tomatoes", category: "grocery", price: 40, unit: "1kg", description: "Farm fresh red tomatoes picked daily.", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&auto=format&fit=crop", rating: 4.5, reviews: 89, inStock: true, badge: "Fresh" },
  { id: "4", name: "Chicken Biryani", category: "food", price: 240, unit: "1 portion", description: "Aromatic basmati rice cooked with tender chicken and spices.", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=900&auto=format&fit=crop", rating: 4.8, reviews: 188, inStock: true, badge: "Hot" },
  { id: "5", name: "Masala Dosa", category: "food", price: 110, unit: "1 plate", description: "Crisp dosa with spiced potato filling and chutneys.", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=900&auto=format&fit=crop", rating: 4.6, reviews: 141, inStock: true, isVeg: true },
  { id: "6", name: "Garam Masala", category: "spices", price: 160, bulkPrice: 130, unit: "200g", description: "Bold house blend for curries, rice and grills.", image: garamMasalaImg, rating: 4.7, reviews: 155, inStock: true, badge: "Bestseller" },
  { id: "7", name: "Kashmir chilli", category: "spices", price: 135, bulkPrice: 110, unit: "200g", description: "Bright red color with gentle heat.", image: kashmirChilliImg, rating: 4.7, reviews: 126, inStock: true },
  { id: "8", name: "Basmati Rice", category: "grocery", price: 220, unit: "2kg", description: "Long grain aged basmati rice for daily meals.", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&auto=format&fit=crop", rating: 4.6, reviews: 119, inStock: true },
  { id: "9", name: "Whole Milk", category: "grocery", price: 58, unit: "1L", description: "Fresh dairy milk delivered chilled.", image: "https://images.unsplash.com/photo-1550583724-b2692b63b9f5?w=900&auto=format&fit=crop", rating: 4.5, reviews: 98, inStock: true },
  { id: "10", name: "Green Spinach", category: "grocery", price: 35, unit: "250g", description: "Tender leafy greens washed and packed.", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=900&auto=format&fit=crop", rating: 4.4, reviews: 75, inStock: true },
  { id: "11", name: "Mango", category: "grocery", price: 150, unit: "1kg", description: "Sweet seasonal mangoes from trusted farms.", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=900&auto=format&fit=crop", rating: 4.8, reviews: 180, inStock: true },
  { id: "12", name: "Turmeric Root", category: "grocery", price: 70, unit: "500g", description: "Fresh turmeric roots for cooking and wellness.", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=900&auto=format&fit=crop", rating: 4.6, reviews: 86, inStock: true },
  { id: "13", name: "Coconut Oil", category: "grocery", price: 260, unit: "500ml", description: "Cold pressed coconut oil for cooking.", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=900&auto=format&fit=crop", rating: 4.7, reviews: 94, inStock: true },
  { id: "14", name: "Wheat Flour", category: "grocery", price: 62, unit: "1kg", description: "Stone-ground whole wheat atta.", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&auto=format&fit=crop", rating: 4.5, reviews: 112, inStock: true },
  { id: "15", name: "Mustard Oil", category: "grocery", price: 190, unit: "1L", description: "Strong and aromatic cold pressed mustard oil.", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=900&auto=format&fit=crop", rating: 4.6, reviews: 105, inStock: true },
  { id: "16", name: "Onions", category: "grocery", price: 38, unit: "1kg", description: "Fresh red onions for everyday cooking.", image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=900&auto=format&fit=crop", rating: 4.4, reviews: 130, inStock: true },
  { id: "17", name: "Ginger", category: "grocery", price: 90, unit: "500g", description: "Fresh ginger with sharp aroma.", image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=900&auto=format&fit=crop", rating: 4.5, reviews: 78, inStock: true },
  { id: "18", name: "Garlic", category: "grocery", price: 85, unit: "500g", description: "Full-flavored garlic bulbs.", image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=900&auto=format&fit=crop", rating: 4.5, reviews: 84, inStock: true },
  { id: "19", name: "Organic Brown Rice", category: "agro", price: 180, unit: "5kg", description: "Farm-direct organic brown rice.", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&auto=format&fit=crop", rating: 4.6, reviews: 91, inStock: true },
  { id: "20", name: "Vermicompost Fertilizer", category: "agro", price: 450, unit: "10kg", description: "Organic compost for healthy soil.", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&auto=format&fit=crop", rating: 4.8, reviews: 44, inStock: true },
  { id: "21", name: "CHILLI MASALA", category: "spices", price: 145, bulkPrice: 118, unit: "200g", description: "Hot blend for bold flavour.", image: chilliMasalaImg, rating: 4.7, reviews: 120, inStock: true },
  { id: "22", name: "Chaat masala", category: "spices", price: 95, bulkPrice: 78, unit: "200g", description: "Tangy sprinkle for chaat and fruit.", image: chaatMasalaImg, rating: 4.6, reviews: 98, inStock: true },
  { id: "23", name: "Chicken masala", category: "spices", price: 155, bulkPrice: 128, unit: "200g", description: "Perfect for chicken curries and grills.", image: chickenMasalaImg, rating: 4.8, reviews: 142, inStock: true },
  { id: "24", name: "CORIENDER POWDER", category: "spices", price: 110, bulkPrice: 90, unit: "200g", description: "Aromatic coriander for everyday cooking.", image: corianderPowderImg, rating: 4.6, reviews: 88, inStock: true },
  { id: "25", name: "cumin powder", category: "spices", price: 125, bulkPrice: 102, unit: "200g", description: "Earthy cumin for dals and tadka.", image: cuminPowderImg, rating: 4.7, reviews: 105, inStock: true },
  { id: "26", name: "curry masala", category: "spices", price: 150, bulkPrice: 122, unit: "200g", description: "All-purpose curry blend.", image: curryMasalaImg, rating: 4.7, reviews: 130, inStock: true },
  { id: "27", name: "Dalchini powder", category: "spices", price: 140, bulkPrice: 115, unit: "100g", description: "Warm cinnamon for sweets and chai.", image: dalchiniPowderImg, rating: 4.8, reviews: 95, inStock: true },
  { id: "28", name: "Fish masala", category: "spices", price: 158, bulkPrice: 130, unit: "200g", description: "Coastal-style spice for fish dishes.", image: fishMasalaImg, rating: 4.7, reviews: 111, inStock: true },
  { id: "29", name: "JAL JEERA", category: "spices", price: 88, bulkPrice: 72, unit: "200g", description: "Cooling mix for jal jeera drink.", image: jalJeeraImg, rating: 4.5, reviews: 76, inStock: true },
  { id: "30", name: "meat masala", category: "spices", price: 162, bulkPrice: 132, unit: "200g", description: "Rich blend for mutton and beef.", image: meatMasalaImg, rating: 4.7, reviews: 118, inStock: true },
  { id: "31", name: "sahi biryani masala", category: "spices", price: 175, bulkPrice: 142, unit: "200g", description: "Layered aroma for biryani.", image: sahiBiryaniImg, rating: 4.9, reviews: 200, inStock: true },
  { id: "32", name: "sahi paneer", category: "spices", price: 152, bulkPrice: 125, unit: "200g", description: "Restaurant-style paneer gravy spice.", image: sahiPaneerImg, rating: 4.8, reviews: 165, inStock: true },
  { id: "33", name: "Spices pouch monk", category: "spices", price: 198, bulkPrice: 165, unit: "combo", description: "Curated pouch selection.", image: spicesPouchMonkImg, rating: 4.6, reviews: 54, inStock: true },
  { id: "34", name: "chana masala", category: "spices", price: 148, bulkPrice: 120, unit: "200g", description: "Classic chole masala.", image: chanaMasalaImg, rating: 4.7, reviews: 128, inStock: true },
];
