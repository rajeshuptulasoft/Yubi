import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { MapPin, Minus, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { foodAPI, getApiErrorMessage } from "@/lib/api";
import { parseFoodCartResponse } from "@/lib/cartUtils";
import {
  DeliveryAddressCard,
  DeliveryAddressModal,
  formatDeliveryAddress,
} from "@/components/delivery/DeliveryAddresses";

export default function Cart() {
  const location = useLocation();
  const {
    user,
    addresses,
    addressesLoading,
    refreshDeliveryAddresses,
    setDefaultAddress,
    removeAddress,
    openAuthModal,
  } = useAuth();

  const [cartLines, setCartLines] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    tax: 0,
    total: 0,
  });
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [lineBusy, setLineBusy] = useState(null);

  const loadCart = useCallback(async () => {
    if (!user?.token) return;
    setCartLoading(true);
    setCartError(null);
    try {
      const raw = await foodAPI.getCart();
      const parsed = parseFoodCartResponse(raw);
      if (parsed.errorMessage) {
        setCartError(parsed.errorMessage);
        setCartLines([]);
        setTotals({
          subtotal: 0,
          discount: 0,
          deliveryFee: 0,
          tax: 0,
          total: 0,
        });
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
      setCartError(getApiErrorMessage(e, "Could not load cart."));
      setCartLines([]);
    } finally {
      setCartLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (!user) return undefined;
    void loadCart();
    return undefined;
  }, [user, loadCart, location.pathname]);

  useEffect(() => {
    if (!user) return;
    const def = addresses.find((a) => a.isDefault) || addresses[0];
    setSelectedAddressId((prev) => prev || def?.id || "");
  }, [user, addresses]);

  const changeQty = async (line, nextQty) => {
    if (lineBusy) return;
    if (nextQty < 1) {
      await removeLine(line);
      return;
    }
    setLineBusy(line.cartItemId);
    try {
      const res = await foodAPI.updateCartItem(line.cartItemId, { quantity: nextQty });
      if (res && typeof res === "object" && res.success === false) {
        toast.error(getApiErrorMessage(res, "Could not update quantity."));
        return;
      }
      await loadCart();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not update quantity."));
    } finally {
      setLineBusy(null);
    }
  };

  const removeLine = async (line) => {
    if (lineBusy) return;
    setLineBusy(line.cartItemId);
    try {
      const res = await foodAPI.removeCartItem(line.cartItemId);
      if (res && typeof res === "object" && res.success === false) {
        toast.error(getApiErrorMessage(res, "Could not remove item."));
        return;
      }
      toast.success("Item removed");
      await loadCart();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not remove item."));
    } finally {
      setLineBusy(null);
    }
  };

  const defaultAddress =
    addresses.find((a) => String(a.id) === String(selectedAddressId)) ||
    addresses.find((a) => a.isDefault) ||
    addresses[0];

  if (!user) {
    return (
      <div style={lockedStyle}>
        <div style={{ fontSize: 80 }}>Cart</div>
        <h1 style={{ color: "#1A2E1A", fontSize: 28, fontWeight: 800, margin: 0 }}>Your cart is waiting!</h1>
        <p style={{ color: "#666666", fontSize: 16, textAlign: "center", maxWidth: 380 }}>
          Please login or register to view your cart and place orders.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" onClick={() => openAuthModal("login")} style={{ ...outlineButton, width: 180 }}>
            Login
          </button>
          <button type="button" onClick={() => openAuthModal("register")} style={{ ...primaryButton, width: 180 }}>
            Register
          </button>
        </div>
      </div>
    );
  }

  if (cartLoading && cartLines.length === 0 && !cartError) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", textAlign: "center", color: "#607060" }}>
        Loading your cart…
      </div>
    );
  }

  if (cartError && cartLines.length === 0) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <p style={{ color: "#B91C1C", fontWeight: 700 }}>{cartError}</p>
        <button type="button" onClick={() => loadCart()} style={{ ...primaryButton, marginTop: 16 }}>
          Retry
        </button>
      </div>
    );
  }

  if (!cartLoading && cartLines.length === 0) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px", textAlign: "center", color: "#1A1A1A" }}>
        <div style={{ fontSize: 70, marginBottom: 20 }}>Cart</div>
        <h1 style={{ color: "#1A2E1A", fontSize: 34 }}>Your cart is empty</h1>
        <p style={{ color: "#666666", marginBottom: 28 }}>Discover dishes and spices, add to cart, and enjoy.</p>
        <Link to="/menu" style={{ ...primaryButton, textDecoration: "none", display: "inline-flex" }}>
          Browse Menu
        </Link>
      </div>
    );
  }

  const deliveryLabel =
    totals.deliveryFee === 0 ? "FREE" : `Rs ${Math.round(totals.deliveryFee)}`;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 24px 60px", color: "#1A1A1A" }}>
      <h1 style={{ color: "#1A2E1A", fontSize: "clamp(32px,5vw,44px)", marginBottom: 24 }}>Your Cart</h1>
      <div className="cart-address-grid" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {cartLines.map((item) => (
            <div key={item.key} style={cartItemStyle}>
              {item.image ? (
                <img src={item.image} alt={item.name} style={{ width: 76, height: 76, borderRadius: 14, objectFit: "cover", background: "#F1F8F1" }} />
              ) : (
                <div style={{ width: 76, height: 76, borderRadius: 14, background: "#F1F8F1", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#1A2E1A", fontSize: 17, fontWeight: 800 }}>{item.name}</div>
                {item.variant ? <div style={{ color: "#4CAF50", fontSize: 12, marginTop: 2 }}>{item.variant}</div> : null}
                <div style={{ color: "#4CAF50", fontWeight: 800, marginTop: 6 }}>Rs {item.price}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F1F8F1", padding: 4, borderRadius: 10, border: "1px solid #E8F5E9" }}>
                <button
                  type="button"
                  disabled={lineBusy === item.cartItemId}
                  onClick={() => changeQty(item, item.qty - 1)}
                  style={qtyButton}
                >
                  <Minus size={14} />
                </button>
                <span style={{ minWidth: 24, textAlign: "center", fontWeight: 800 }}>{item.qty}</span>
                <button
                  type="button"
                  disabled={lineBusy === item.cartItemId}
                  onClick={() => changeQty(item, item.qty + 1)}
                  style={qtyButton}
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                type="button"
                disabled={lineBusy === item.cartItemId}
                onClick={() => removeLine(item)}
                style={{ width: 40, height: 40, borderRadius: 10, background: "#FFFFFF", border: "1px solid #FECACA", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div>
          <section style={addressSectionCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <h2 style={{ color: "#1A2E1A", fontSize: 18, fontWeight: 800, margin: 0 }}>Deliver To</h2>
              <button type="button" onClick={() => { setEditingAddress(null); setShowAddressModal(true); }} style={addAddressCompactStyle}>
                + Add Address
              </button>
            </div>
            {addressesLoading ? (
              <p style={{ color: "#607060", fontWeight: 700 }}>Loading addresses…</p>
            ) : addresses.length ? (
              <div style={{ display: "grid", gap: 12 }}>
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    role="presentation"
                    onClick={(e) => {
                      if (e.target.closest("button")) return;
                      setSelectedAddressId(address.id);
                    }}
                    style={{
                      borderRadius: 14,
                      outline: selectedAddressId === address.id ? "2px solid #4CAF50" : "2px solid transparent",
                      cursor: "pointer",
                    }}
                  >
                    <DeliveryAddressCard
                      address={address}
                      onDefault={async () => {
                        const res = await setDefaultAddress(address.id);
                        if (res.success) {
                          toast.success(
                            typeof res.data?.message === "string" && res.data.message.trim()
                              ? res.data.message.trim()
                              : "Successfully set as default.",
                          );
                          setSelectedAddressId(address.id);
                        } else {
                          toast.error(res.message || "Could not set default address.");
                        }
                      }}
                      onEdit={() => {
                        setEditingAddress(address);
                        setShowAddressModal(true);
                      }}
                      onDelete={async () => {
                        if (!confirm("Delete this address?")) return;
                        const res = await removeAddress(address.id);
                        if (res.success) {
                          toast.success(
                            typeof res.data?.message === "string" && res.data.message.trim()
                              ? res.data.message.trim()
                              : "Address deleted successfully.",
                          );
                        } else {
                          toast.error(res.message || "Could not delete address.");
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={emptyAddressStyle}>
                <MapPin size={38} color="#4CAF50" />
                <strong>No saved addresses</strong>
                <span>Add your first delivery address.</span>
              </div>
            )}
          </section>

          <div style={sideCardStyle}>
            <h2 style={{ color: "#1A2E1A", fontSize: 18, margin: "0 0 16px" }}>Order Summary</h2>
            <div style={summaryAddressBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <strong style={{ color: "#1A2E1A", fontSize: 14 }}>Delivery Address</strong>
                {defaultAddress?.isDefault ? <span style={defaultBadge}>Default</span> : null}
              </div>
              {defaultAddress ? (
                <p style={{ color: "#1A1A1A", fontSize: 13, lineHeight: 1.5, margin: 0 }}>{formatDeliveryAddress(defaultAddress)}</p>
              ) : (
                <p style={{ color: "#888888", fontSize: 13, margin: 0 }}>Select or add an address above.</p>
              )}
            </div>
            <Row label="Subtotal" value={`Rs ${Math.round(totals.subtotal)}`} />
            <Row label="Discount" value={`-Rs ${Math.round(totals.discount)}`} color="#2E7D32" />
            <Row label="Delivery" value={deliveryLabel} />
            <Row label="Tax (5%)" value={`Rs ${Math.round(totals.tax)}`} />
            <div style={{ height: 1, background: "#E8F5E9", margin: "14px 0" }} />
            <Row label="Total" value={`Rs ${Math.round(totals.total)}`} big />
            <Link
              to="/checkout"
              state={{ selectedAddressId: defaultAddress?.id || selectedAddressId }}
              style={{ ...primaryButton, textDecoration: "none", width: "100%", marginTop: 18, display: "flex", justifyContent: "center" }}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
      {showAddressModal && (
        <DeliveryAddressModal
          key={editingAddress?.id ?? "new"}
          editingAddress={editingAddress}
          hasAddresses={addresses.length > 0}
          onAddressSaved={refreshDeliveryAddresses}
          onClose={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
        />
      )}
      <style>{`@media(max-width:900px){.cart-address-grid{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}

function Row({ label, value, color, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0" }}>
      <span style={{ color: big ? "#1A2E1A" : "#666666", fontSize: big ? 16 : 14, fontWeight: big ? 800 : 500 }}>{label}</span>
      <span style={{ color: color || (big ? "#4CAF50" : "#1A1A1A"), fontWeight: 800, fontSize: big ? 22 : 14, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );
}

const lockedStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
  gap: "20px",
  padding: "40px",
  color: "#1A1A1A",
};
const sideCardStyle = {
  background: "#FFFFFF",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 4px 20px rgba(76,175,80,0.1)",
  border: "1px solid #E8F5E9",
  marginBottom: "16px",
};
const cartItemStyle = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  background: "#FFFFFF",
  border: "1px solid #E8F5E9",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 4px 20px rgba(76,175,80,0.08)",
};
const primaryButton = {
  background: "linear-gradient(135deg, #4CAF50, #388E3C)",
  color: "#FFFFFF",
  border: "none",
  padding: "12px 28px",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(76,175,80,0.35)",
  alignItems: "center",
  justifyContent: "center",
};
const outlineButton = {
  background: "#FFFFFF",
  color: "#4CAF50",
  border: "2px solid #4CAF50",
  padding: "11px 28px",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
};
const qtyButton = {
  width: 28,
  height: 28,
  border: "none",
  background: "transparent",
  color: "#1A1A1A",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const summaryAddressBox = {
  background: "#F8FCF8",
  border: "1px solid #D6E8D6",
  borderRadius: 14,
  padding: "13px 14px",
  marginBottom: 16,
};
const defaultBadge = {
  background: "#E8F5E9",
  color: "#2E7D32",
  padding: "3px 10px",
  borderRadius: "10px",
  fontSize: "11px",
  fontWeight: "700",
};
const addressSectionCardStyle = {
  background: "#FFFFFF",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 4px 20px rgba(76,175,80,0.1)",
  border: "1px solid #E8F5E9",
  marginBottom: "16px",
};
const addAddressCompactStyle = {
  background: "#1A2E1A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};
const emptyAddressStyle = {
  border: "2px dashed #A5D6A7",
  borderRadius: 16,
  padding: 28,
  display: "grid",
  placeItems: "center",
  gap: 8,
  color: "#607060",
  textAlign: "center",
};
