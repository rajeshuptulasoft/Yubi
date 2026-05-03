import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { products } from "../../data";
import { useCart } from "../../context/CartContext";
import { useWindowSize } from "../../hooks/useWindowSize";
import { foodAPI, getApiErrorMessage } from "../../lib/api";
import { extractProductList, mapFoodProductFromApi } from "../../lib/foodProductUtils";

const reviews = [
  { id: 1, name: "Rohit S.", rating: 5, text: "Great quality and very fresh. Exactly as described." },
  { id: 2, name: "Aditi R.", rating: 4, text: "Packaging was neat and delivery was quick." },
  { id: 3, name: "Karan P.", rating: 5, text: "Will definitely order again. Value for money." }
];

const ratingBreakdown = [
  { stars: 5, percent: 78 },
  { stars: 4, percent: 16 },
  { stars: 3, percent: 4 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 1 },
];

export default function ProductDetails() {
  const { id } = useParams();
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const product = useMemo(() => {
    const key = String(id ?? "");
    return apiProducts.find((item) => String(item.id) === key) || products.find((item) => String(item.id) === key);
  }, [apiProducts, id]);
  const isMobile = width <= 900;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [productsRes, foodsSpicesRes, agroRes] = await Promise.allSettled([
          foodAPI.getProducts(),
          foodAPI.getFoodsSpices(),
          foodAPI.getAgroProducts(),
        ]);

        const liveProducts = [];
        if (productsRes.status === "fulfilled") {
          liveProducts.push(...extractProductList(productsRes.value).map(mapFoodProductFromApi));
        }
        if (foodsSpicesRes.status === "fulfilled") {
          liveProducts.push(...extractProductList(foodsSpicesRes.value).map(mapFoodProductFromApi));
        }
        if (agroRes.status === "fulfilled") {
          liveProducts.push(
            ...extractProductList(agroRes.value).map((raw, index) => ({
              ...mapFoodProductFromApi(raw, index),
              category: "agro",
            })),
          );
        }

        const byId = new Map();
        liveProducts.forEach((item) => {
          if (item?.id != null && !byId.has(String(item.id))) byId.set(String(item.id), item);
        });
        if (!cancelled) setApiProducts([...byId.values()]);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Could not load product details."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && !product) {
    return <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 16px", color: "#607060" }}>Loading product details...</main>;
  }

  if (!product) {
    return (
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 16px", color: "#1A1A1A" }}>
        {error ? <p style={{ color: "#C62828", fontWeight: 700 }}>{error}</p> : "Product not found."}
      </main>
    );
  }

  const isSpice = product.category === "spices";
  const basePrice = isSpice && qty >= 5 ? (product.bulkPrice || product.price) : product.price;
  const oldPrice = Math.round(product.price * 1.25);
  const total = basePrice * qty;

  return <main style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "24px 16px" : "42px 40px", color: "#1A1A1A" }}>
    <button onClick={() => navigate(-1)} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FFFFFF", border: "1px solid #D6E8D6", borderRadius: 999, padding: "8px 14px", marginBottom: 20, cursor: "pointer", fontWeight: 700, color: "#1A2E1A", fontSize: 13, transition: "all 0.2s ease" }}><ArrowLeft size={16} /> Back</button>
    
    <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.1fr", gap: 40, alignItems: "start", marginBottom: 40 }}>
      {/* IMAGE SECTION */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8F0E8", boxShadow: "0 16px 40px rgba(26,46,26,0.08)", padding: 24, position: isMobile ? "relative" : "sticky", top: 100 }}>
        <img src={product.image} alt={product.name} style={{ width: "100%", maxHeight: 520, objectFit: "contain", display: "block" }} />
        <div style={{ marginTop: 20, padding: 18, borderRadius: 16, background: "linear-gradient(135deg,#F1F8F1,#FFFFFF)", border: "1px solid #D6E8D6" }}>
          <h3 style={{ margin: "0 0 8px", color: "#1A2E1A", fontSize: 18 }}>Freshness you can see</h3>
          <p style={{ margin: 0, color: "#5C7A5C", lineHeight: 1.65, fontSize: 13 }}>
            Every YUBI product is selected for consistent aroma, texture, and daily kitchen reliability. We pack carefully so the product reaches you clean, fresh, and ready to use.
          </p>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8F0E8", boxShadow: "0 16px 40px rgba(26,46,26,0.08)", padding: isMobile ? 20 : 32 }}>
        {/* Badge */}
        {product.badge && (
          <div style={{ display: "inline-block", background: "#FFF3E0", padding: "6px 14px", borderRadius: 999, fontSize: 11, color: "#E85D04", fontWeight: 800, marginBottom: 16 }}>
            {product.badge}
          </div>
        )}

        <h1 style={{ marginTop: 0, marginBottom: 14, color: "#1A2E1A", fontSize: isMobile ? 32 : 42, fontWeight: 700, lineHeight: 1.2 }}>{product.name}</h1>
        
        {/* Rating */}
        <p style={{ margin: "0 0 20px", display: "flex", alignItems: "center", gap: 8, color: "#FF6F00", fontWeight: 700, fontSize: 14 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {[...Array(Math.round(product.rating || 4.7))].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
          </div>
          {product.rating || 4.7} ({product.reviews || 100}+ ratings)
        </p>

        {/* Price Section */}
        <div style={{ background: "#F1F8F1", border: "1px solid #C8E6C9", borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 16, color: "#5C7A5C", textDecoration: "line-through" }}>₹{oldPrice}</span>
            <span style={{ fontSize: 32, fontWeight: 900, color: "#1A2E1A" }}>₹{basePrice}</span>
            <span style={{ fontSize: 13, color: "#2E7D32", fontWeight: 700, background: "#E8F5E9", padding: "4px 10px", borderRadius: 8 }}>Save {Math.round(((oldPrice - basePrice) / oldPrice) * 100)}%</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#2E7D32", fontWeight: 600 }}>Limited stock available</p>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#1A2E1A" }}>About this product</h3>
          <p style={{ margin: 0, color: "#374151", lineHeight: 1.7, fontSize: 13 }}>
            {product.description}
          </p>
        </div>

        {/* Vendor & Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24, fontSize: 13 }}>
          <div>
            <p style={{ margin: "0 0 4px", color: "#5C7A5C", fontWeight: 600 }}>Vendor</p>
            <p style={{ margin: 0, color: "#1A1A1A", fontWeight: 700 }}>YUBI Foods</p>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", color: "#5C7A5C", fontWeight: 600 }}>Unit</p>
            <p style={{ margin: 0, color: "#1A1A1A", fontWeight: 700 }}>{product.unit}</p>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", color: "#5C7A5C", fontWeight: 600 }}>Availability</p>
            <p style={{ margin: 0, color: product.inStock ? "#2E7D32" : "#D32F2F", fontWeight: 700 }}>
              {product.inStock ? "✓ In Stock" : "Out of Stock"}
            </p>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", color: "#5C7A5C", fontWeight: 600 }}>SKU</p>
            <p style={{ margin: 0, color: "#1A1A1A", fontWeight: 700 }}>#PRD-{product.id}</p>
          </div>
        </div>

        {/* Bulk Pricing */}
        {isSpice && (
          <div style={{ margin: "24px 0", background: "#E8F5E9", border: "1px solid #C8E6C9", borderRadius: 14, padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 13, color: "#1A2E1A" }}>Bulk Pricing Available</div>
            <div style={{ color: "#374151", fontSize: 12, lineHeight: 1.6 }}>
              • 1-4 qty: ₹{product.price} each<br/>
              • 5+ qty: ₹{product.bulkPrice || product.price} each (Save {Math.round(((product.price - (product.bulkPrice || product.price)) / product.price) * 100)}%)
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1A2E1A", marginBottom: 12 }}>Quantity</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setQty((value) => Math.max(1, value - 1))} style={{ ...qtyBtn, width: 40, height: 40 }}><Minus size={18} /></button>
            <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 60, textAlign: "center", border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 0", fontSize: 16, fontWeight: 700 }} />
            <button onClick={() => setQty((value) => value + 1)} style={{ ...qtyBtn, width: 40, height: 40 }}><Plus size={18} /></button>
            <span style={{ marginLeft: 12, color: "#6B7280", fontSize: 13, fontWeight: 600 }}>{isSpice ? "pack(s)" : "portion(s)"}</span>
          </div>
        </div>

        {/* Total Price */}
        <div style={{ background: "#F9FBF9", borderRadius: 14, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#5C7A5C", marginBottom: 6 }}>Total Price</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#1A2E1A" }}>₹{total}</div>
        </div>

        {/* Add to Cart Button */}
        <button
          className="standard-add-btn"
          onClick={() => addItem({ key: `${product.id}-${Date.now()}`, productId: product.id, name: product.name, price: basePrice, image: product.image, qty })} 
          style={{ ...cta, width: "100%", padding: 16, fontSize: 15 }}
        >
          <ShoppingCart size={18} /> Add to Cart
        </button>

        {/* Additional Info */}
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #E5E7EB" }}>
          <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
            ✓ Fresh delivery guaranteed<br/>
            ✓ Easy returns within 7 days<br/>
            ✓ 100% authentic products
          </p>
        </div>
      </div>
    </section>

    {/* REVIEWS SECTION */}
    <section style={{ marginTop: 60, background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8F0E8", padding: isMobile ? 20 : 32 }}>
      <h2 style={{ marginTop: 0, marginBottom: 24, color: "#1A2E1A", fontSize: 26, fontWeight: 700 }}>Customer Reviews</h2>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "280px 1fr", gap: 24, alignItems: "center", marginBottom: 26 }}>
        <div style={{ background: "#F1F8F1", border: "1px solid #C8E6C9", borderRadius: 18, padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: 52, lineHeight: 1, fontWeight: 900, color: "#1A2E1A" }}>{product.rating || 4.7}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 3, color: "#FF6F00", margin: "10px 0" }}>{[...Array(5)].map((_, index) => <Star key={index} size={17} fill="currentColor" />)}</div>
          <div style={{ color: "#5C7A5C", fontWeight: 800, fontSize: 13 }}>{product.reviews || 100}+ verified ratings</div>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {ratingBreakdown.map((row) => (
            <div key={row.stars} style={{ display: "grid", gridTemplateColumns: "54px 1fr 42px", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#1A2E1A", fontWeight: 900, fontSize: 13 }}>{row.stars} Star</span>
              <div style={{ height: 10, borderRadius: 999, background: "#E8F5E9", overflow: "hidden" }}>
                <div style={{ width: `${row.percent}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#4CAF50,#A8E063)", animation: "ratingFill 0.8s ease both" }} />
              </div>
              <span style={{ color: "#5C7A5C", fontWeight: 800, fontSize: 12 }}>{row.percent}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
        {reviews.map((review) => (
          <div key={review.id} style={{ border: "1px solid #E5E7EB", borderRadius: 14, padding: 16, background: "#FCFFFC" }}>
            <strong style={{ color: "#1A1A1A", fontSize: 13 }}>{review.name}</strong>
            <p style={{ margin: "8px 0", color: "#FF6F00", fontWeight: 700, fontSize: 12 }}>
              {`${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`}
            </p>
            <p style={{ margin: 0, color: "#374151", lineHeight: 1.6, fontSize: 13 }}>{review.text}</p>
          </div>
        ))}
      </div>
    </section>
  </main>;
}

const qtyBtn = { width: 34, height: 34, borderRadius: 8, border: "1px solid #D1D5DB", background: "#FFFFFF", cursor: "pointer", display: "grid", placeItems: "center" };
const cta = { background: "#4CAF50", color: "#FFFFFF", border: "none", borderRadius: 10, padding: "12px 18px", fontWeight: 800, cursor: "pointer" };
