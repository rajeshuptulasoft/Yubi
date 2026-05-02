import { createContext, useContext, useEffect, useReducer } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { foodAPI, getApiErrorMessage } from "../lib/api";

const CartContext = createContext(null);
const STORAGE_KEY = "saffron_cart_v1";

const init = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { items: [], coupon: null };
  } catch {
    return { items: [], coupon: null };
  }
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { item } = action;
      const increment = item.qty ?? item.quantity ?? 1;
      const existing = state.items.find((i) => i.key === item.key);
      const items = existing
        ? state.items.map((i) => (i.key === item.key ? { ...i, qty: i.qty + increment } : i))
        : [...state.items, { ...item, qty: increment }];
      return { ...state, items };
    }
    case "UPDATE_QTY": {
      const items = state.items
        .map((i) => (i.key === action.key ? { ...i, qty: action.qty } : i))
        .filter((i) => i.qty > 0);
      return { ...state, items };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.key !== action.key) };
    case "CLEAR":
      return { items: [], coupon: null };
    case "COUPON":
      return { ...state, coupon: action.coupon };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const { user, openAuthModal, setShowAuthModal } = useAuth();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addItem = async (item) => {
    if (!user) {
      if (openAuthModal) openAuthModal("login");
      else setShowAuthModal(true);
      return;
    }

    const increment = item.qty ?? item.quantity ?? 1;
    const rawPid = item.productId ?? item.id;
    const parsedId = Number.parseInt(String(rawPid), 10);
    const payload = {
      product_id: Number.isFinite(parsedId) ? parsedId : rawPid,
      quantity: increment,
    };
    if (item.variant || item.grams) {
      payload.variant = String(item.variant || item.grams);
    }

    try {
      const res = await foodAPI.addToCart(payload);
      if (res && typeof res === "object" && res.success === false) {
        toast.error(getApiErrorMessage(res, "Could not add to cart."));
        return;
      }
      dispatch({ type: "ADD", item: { ...item, qty: increment } });
      toast.success(`Added ${item.name}`, { description: item.variant || item.grams || "" });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not add to cart."));
    }
  };
  const updateQty = (key, qty) => dispatch({ type: "UPDATE_QTY", key, qty });
  const removeItem = (key) => dispatch({ type: "REMOVE", key });
  const clearCart = () => dispatch({ type: "CLEAR" });
  const applyCoupon = (code) => {
    const codes = { SAFFRON10: 10, SPICE20: 20, FIRST: 15 };
    if (codes[code]) {
      dispatch({ type: "COUPON", coupon: { code, percent: codes[code] } });
      toast.success(`Coupon ${code} applied — ${codes[code]}% off`);
      return true;
    }
    toast.error("Invalid coupon");
    return false;
  };

  const subtotal = state.items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = state.coupon ? Math.round((subtotal * state.coupon.percent) / 100) : 0;
  const deliveryFee = subtotal > 0 && subtotal - discount < 500 ? 49 : 0;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + deliveryFee + tax;
  const count = state.items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ ...state, addItem, updateQty, removeItem, clearCart, applyCoupon, subtotal, discount, deliveryFee, tax, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
