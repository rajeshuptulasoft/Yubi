import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { foodAPI, getApiErrorMessage } from "@/lib/api";
import {
  buildFoodOrderItemsFromCartLines,
  normalizeAddressIdForApi,
  parseFoodCartResponse,
} from "@/lib/cartUtils";
import { formatDeliveryAddress } from "@/components/delivery/DeliveryAddresses";

const fontHeading = "'Plus Jakarta Sans', 'DM Sans', Montserrat, sans-serif";
const MIN_SPICE_ORDER_QTY = 70;

function isSpiceLine(line) {
  const category = String(line?.category ?? "").trim().toLowerCase();
  return category === "spices" || category === "spice" || category.includes("spice");
}

function getSpiceQuantityError(lines) {
  const invalid = lines.find((line) => isSpiceLine(line) && Number(line.qty) < MIN_SPICE_ORDER_QTY);
  if (!invalid) return "";
  return `${invalid.name || "Spice item"} quantity must be at least ${MIN_SPICE_ORDER_QTY} to place the order.`;
}

export default function Checkout() {
  const { user, openAuthModal, addresses, addressesLoading } = useAuth();
  const { clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [cartLines, setCartLines] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    tax: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCodStep, setShowCodStep] = useState(false);
  const [codSelected, setCodSelected] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const fromNav = location.state?.selectedAddressId;
    return fromNav != null && fromNav !== "" ? String(fromNav) : "";
  });

  const loadCart = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await foodAPI.getCart();
      const parsed = parseFoodCartResponse(raw);
      if (parsed.errorMessage) {
        setError(parsed.errorMessage);
        setCartLines([]);
        setTotals({ subtotal: 0, discount: 0, deliveryFee: 0, tax: 0, total: 0 });
      } else {
        setCartLines(parsed.lines);
        setTotals({
          subtotal: parsed.subtotal,
          discount: parsed.discount,
          deliveryFee: parsed.deliveryFee,
          tax: parsed.tax,
          total: parsed.total,
        });
      }
    } catch (e) {
      setError(getApiErrorMessage(e, "Could not load cart."));
      setCartLines([]);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (!user) return undefined;
    void loadCart();
    return undefined;
  }, [user, loadCart]);

  /** Keep select + summary in sync: cart/profile default or first address; fix ID type mismatches. */
  useEffect(() => {
    if (addressesLoading || !addresses.length) return;

    const idStr = (id) => String(id);
    const validIds = new Set(addresses.map((a) => idStr(a.id)));

    const current =
      selectedAddressId !== null && selectedAddressId !== undefined && String(selectedAddressId).trim() !== ""
        ? idStr(selectedAddressId)
        : "";
    if (current && validIds.has(current)) return;

    const fromNav = location.state?.selectedAddressId;
    if (fromNav != null && fromNav !== "" && validIds.has(idStr(fromNav))) {
      setSelectedAddressId(idStr(fromNav));
      return;
    }

    const def = addresses.find((a) => a.isDefault) || addresses[0];
    if (def?.id != null) setSelectedAddressId(idStr(def.id));
  }, [addresses, addressesLoading, selectedAddressId, location.state?.selectedAddressId]);

  /** Resolved id for the delivery select, summary, and POST — matches auto-picked default when state was empty or mismatched. */
  const deliverySelectValue = useMemo(() => {
    if (!addresses.length) return "";
    const s = String(selectedAddressId ?? "").trim();
    if (s && addresses.some((a) => String(a.id) === s)) return s;
    const def = addresses.find((a) => a.isDefault) || addresses[0];
    return def ? String(def.id) : "";
  }, [addresses, selectedAddressId]);

  const selectedAddress = useMemo(() => {
    if (!addresses.length) return undefined;
    const key = deliverySelectValue;
    const match = key ? addresses.find((a) => String(a.id) === key) : undefined;
    return match || addresses.find((a) => a.isDefault) || addresses[0];
  }, [addresses, deliverySelectValue]);

  const deliveryLabel =
    totals.deliveryFee === 0 ? "FREE" : `Rs ${Math.round(totals.deliveryFee)}`;

  const placeOrder = async () => {
    if (!user?.token) {
      openAuthModal("login");
      return;
    }
    if (!cartLines.length) {
      toast.error("Your cart is empty.");
      return;
    }
    const spiceQuantityError = getSpiceQuantityError(cartLines);
    if (spiceQuantityError) {
      toast.error(spiceQuantityError);
      return;
    }
    if (!codSelected) {
      toast.error("Please choose Cash on Delivery (COD).");
      return;
    }
    setPlacing(true);
    try {
      const items = buildFoodOrderItemsFromCartLines(cartLines).filter(
        (row) => row.product_id != null || row.cart_item_id != null,
      );
      if (!items.length) {
        toast.error("Your cart is missing product details. Return to the cart, refresh, and try again.");
        setPlacing(false);
        return;
      }
      const addressId = normalizeAddressIdForApi(deliverySelectValue || selectedAddress?.id);
      if (addressId === undefined) {
        toast.error("Please select a delivery address.");
        setPlacing(false);
        return;
      }

      const payload = {
        payment_method: "COD",
        items,
        address_id: addressId,
        delivery_address_id: addressId,
      };

      const res = await foodAPI.placeOrder(payload);
      if (res && typeof res === "object" && res.success === false) {
        toast.error(getApiErrorMessage(res, "Could not place order."));
        return;
      }
      const linesSnapshot = cartLines.map((l) => l.cartItemId).filter(Boolean);
      for (const cartItemId of linesSnapshot) {
        try {
          await foodAPI.removeCartItem(cartItemId);
        } catch {
          /* server cart may already be cleared */
        }
      }
      toast.success("Order placed successfully!");
      clearCart();
      const orderId =
        res?.data?.order_id ??
        res?.data?.orderId ??
        res?.order_id ??
        res?.data?.id ??
        null;
      if (orderId != null) {
        navigate(`/orders`, { replace: true, state: { placedOrderId: orderId } });
      } else {
        navigate("/orders", { replace: true });
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not place order."));
    } finally {
      setPlacing(false);
    }
  };

  if (!user) {
    return (
      <main style={shell}>
        <h1 style={title}>Checkout</h1>
        <p style={{ color: "#607060" }}>Sign in to review your order and place it.</p>
        <button type="button" onClick={() => openAuthModal("login")} style={primaryBtn}>
          Login
        </button>
      </main>
    );
  }

  if (loading && cartLines.length === 0 && !error) {
    return (
      <main style={shell}>
        <h1 style={title}>Checkout</h1>
        <p style={{ color: "#607060" }}>Loading your order…</p>
      </main>
    );
  }

  if (error && cartLines.length === 0) {
    return (
      <main style={shell}>
        <h1 style={title}>Checkout</h1>
        <p style={{ color: "#B91C1C", fontWeight: 700 }}>{error}</p>
        <button type="button" onClick={() => loadCart()} style={primaryBtn}>
          Retry
        </button>
        <Link to="/cart" style={{ ...linkBtn, marginLeft: 12 }}>
          Back to cart
        </Link>
      </main>
    );
  }

  if (!loading && cartLines.length === 0) {
    return (
      <main style={shell}>
        <h1 style={title}>Checkout</h1>
        <p style={{ color: "#607060", marginBottom: 16 }}>Your cart is empty — add items before checkout.</p>
        <Link to="/menu" style={{ ...primaryBtn, textDecoration: "none", display: "inline-flex" }}>
          Browse menu
        </Link>
      </main>
    );
  }

  return (
    <main style={shell}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/cart" style={{ color: "#2E7D32", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
          ← Back to cart
        </Link>
      </div>
      <h1 style={title}>Checkout</h1>
      <p style={{ color: "#607060", marginBottom: 28 }}>Review every item, totals, and delivery details before placing your order.</p>

      <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28, alignItems: "start" }}>
        <section>
          <h2 style={sectionTitle}>Your items</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {cartLines.map((item) => {
              const lineTotal = Math.round(item.price * item.qty);
              return (
                <li key={item.key} style={lineCard}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      style={{ width: 96, height: 96, borderRadius: 16, objectFit: "cover", background: "#F1F8F1", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: 96, height: 96, borderRadius: 16, background: "#F1F8F1", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#1A2E1A", fontSize: 17, fontWeight: 800 }}>{item.name}</div>
                    {item.variant ? (
                      <div style={{ color: "#4CAF50", fontSize: 13, marginTop: 4 }}>{item.variant}</div>
                    ) : null}
                    {item.productId != null && item.productId !== "" ? (
                      <div style={{ color: "#888888", fontSize: 12, marginTop: 4 }}>Product ID: {item.productId}</div>
                    ) : null}
                    <div style={{ color: "#607060", fontSize: 13, marginTop: 8 }}>
                      Unit price <strong style={{ color: "#1A1A1A" }}>Rs {Math.round(item.price)}</strong>
                      {" · "}
                      Qty <strong style={{ color: "#1A1A1A" }}>{item.qty}</strong>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: "#1A2E1A", fontSize: 16, flexShrink: 0 }}>Rs {lineTotal}</div>
                </li>
              );
            })}
          </ul>
        </section>

        <div>
          <section style={sideCard}>
            <h2 style={{ ...sectionTitle, marginTop: 0 }}>Deliver to</h2>
            {addressesLoading ? (
              <p style={{ color: "#607060" }}>Loading addresses…</p>
            ) : addresses.length ? (
              <>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#607060", marginBottom: 8 }}>
                  Delivery address
                </label>
                <select
                  value={deliverySelectValue}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  style={selectStyle}
                >
                  {addresses.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {formatDeliveryAddress(a)}
                      {a.isDefault ? " (Default)" : ""}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <p style={{ color: "#B91C1C", fontSize: 14 }}>
                Add a delivery address from your{" "}
                <Link to="/profile" style={{ color: "#2E7D32", fontWeight: 800 }}>
                  profile
                </Link>{" "}
                or cart before placing an order.
              </p>
            )}
          </section>

          <section style={sideCard}>
            <h2 style={{ ...sectionTitle, marginTop: 0 }}>Order summary</h2>
            <SummaryRow label="Subtotal" value={`Rs ${Math.round(totals.subtotal)}`} />
            <SummaryRow label="Discount" value={`-Rs ${Math.round(totals.discount)}`} valueColor="#2E7D32" />
            <SummaryRow label="Delivery" value={deliveryLabel} />
            <SummaryRow label="Tax (5%)" value={`Rs ${Math.round(totals.tax)}`} />
            <div style={{ height: 1, background: "#E8F5E9", margin: "14px 0" }} />
            <SummaryRow label="Total" value={`Rs ${Math.round(totals.total)}`} emphasize />

            {!showCodStep ? (
              <button
                type="button"
                onClick={() => {
                  const spiceQuantityError = getSpiceQuantityError(cartLines);
                  if (spiceQuantityError) {
                    toast.error(spiceQuantityError);
                    return;
                  }
                  setShowCodStep(true);
                }}
                style={{ ...primaryBtn, width: "100%", marginTop: 20, justifyContent: "center" }}
              >
                Place order
              </button>
            ) : (
              <div style={{ marginTop: 20, padding: 16, background: "#F8FCF8", borderRadius: 14, border: "1px solid #D6E8D6" }}>
                <p style={{ margin: "0 0 12px", fontWeight: 800, color: "#1A2E1A", fontSize: 14 }}>Payment method</p>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    padding: "12px 14px",
                    background: "#FFFFFF",
                    borderRadius: 12,
                    border: "2px solid #4CAF50",
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={codSelected}
                    onChange={() => setCodSelected(true)}
                    style={{ width: 18, height: 18, accentColor: "#4CAF50" }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, color: "#1A2E1A" }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: 12, color: "#607060", marginTop: 2 }}>Pay with cash when your order arrives.</div>
                  </div>
                </label>
                <button
                  type="button"
                  disabled={placing || !addresses.length}
                  onClick={() => void placeOrder()}
                  style={{
                    ...primaryBtn,
                    width: "100%",
                    marginTop: 16,
                    opacity: placing || !addresses.length ? 0.6 : 1,
                    cursor: placing || !addresses.length ? "not-allowed" : "pointer",
                  }}
                >
                  {placing ? "Placing order…" : "Confirm & place order"}
                </button>
                {!addresses.length ? (
                  <p style={{ fontSize: 12, color: "#B91C1C", marginTop: 10, marginBottom: 0 }}>
                    Add a delivery address to continue.
                  </p>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </div>
      <style>{`
        @media (max-width: 960px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

function SummaryRow({ label, value, valueColor, emphasize }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0" }}>
      <span
        style={{
          color: emphasize ? "#1A2E1A" : "#666666",
          fontSize: emphasize ? 16 : 14,
          fontWeight: emphasize ? 800 : 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: valueColor || (emphasize ? "#4CAF50" : "#1A1A1A"),
          fontWeight: 800,
          fontSize: emphasize ? 20 : 14,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {value}
      </span>
    </div>
  );
}

const shell = { maxWidth: 1100, margin: "0 auto", padding: "40px 24px 60px", color: "#1A1A1A" };
const title = {
  color: "#1A2E1A",
  fontFamily: fontHeading,
  fontSize: "clamp(28px, 4vw, 38px)",
  marginBottom: 8,
};
const sectionTitle = { color: "#1A2E1A", fontSize: 18, fontWeight: 800, margin: "0 0 16px" };
const lineCard = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  background: "#FFFFFF",
  border: "1px solid #E8F5E9",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 4px 20px rgba(76,175,80,0.08)",
};
const sideCard = {
  background: "#FFFFFF",
  borderRadius: 20,
  padding: 22,
  boxShadow: "0 4px 20px rgba(76,175,80,0.1)",
  border: "1px solid #E8F5E9",
  marginBottom: 16,
};
const primaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  background: "linear-gradient(135deg, #4CAF50, #388E3C)",
  color: "#FFFFFF",
  border: "none",
  padding: "14px 22px",
  borderRadius: 12,
  fontWeight: 800,
  cursor: "pointer",
  fontSize: 15,
  boxShadow: "0 4px 16px rgba(76,175,80,0.35)",
};
const linkBtn = {
  color: "#2E7D32",
  fontWeight: 700,
  fontSize: 14,
};
const selectStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #D6E8D6",
  fontSize: 13,
  color: "#1A1A1A",
  background: "#FFFFFF",
};
