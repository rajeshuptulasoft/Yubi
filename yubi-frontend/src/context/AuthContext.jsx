import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authAPI, foodAPI, getApiErrorMessage, getLoginFailureMessage } from "@/lib/api";

const AuthContext = createContext(null);

/** Extract address rows from common API envelope shapes */
function parseDeliveryAddressesList(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "object") return [];
  if (raw.success === false) return [];
  if (Array.isArray(raw.data)) return raw.data;
  if (raw.data && Array.isArray(raw.data.addresses)) return raw.data.addresses;
  if (Array.isArray(raw.addresses)) return raw.addresses;
  return [];
}

/** Map API row to UI shape used by Profile / Cart */
function normalizeDeliveryAddress(row) {
  if (!row || typeof row !== "object") return null;
  const id = row.id ?? row.address_id ?? row.delivery_address_id;
  if (id === undefined || id === null) return null;

  const isDefault =
    row.is_default === 1 ||
    row.is_default === true ||
    row.isDefault === true ||
    row.is_default === "1" ||
    Number(row.is_default) === 1;

  const houseName = String(row.address_line_1 ?? row.houseName ?? row.house_no ?? "").trim();
  const street = String(row.address_line_2 ?? row.street ?? "").trim();

  return {
    id: String(id),
    houseName,
    street,
    locality: row.locality != null ? String(row.locality) : "",
    landmark: String(row.landmark ?? "").trim(),
    pincode: String(row.pincode ?? "").trim(),
    city: String(row.city ?? "").trim(),
    state: String(row.state ?? "").trim(),
    isDefault: Boolean(isDefault),
    address_line_1: row.address_line_1,
    address_line_2: row.address_line_2,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("yubiUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const refreshDeliveryAddresses = useCallback(async () => {
    if (!user?.token) {
      setAddresses([]);
      return;
    }
    setAddressesLoading(true);
    try {
      const raw = await authAPI.getDeliveryAddresses();
      const list = parseDeliveryAddressesList(raw);
      const next = list.map(normalizeDeliveryAddress).filter(Boolean);
      setAddresses(next);
    } catch {
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (!user?.token) {
      setAddresses([]);
      setAddressesLoading(false);
      return;
    }
    void refreshDeliveryAddresses();
  }, [user?.token, refreshDeliveryAddresses]);

  const login = useCallback((userData) => {
    localStorage.setItem("yubiUser", JSON.stringify(userData));
    setUser(userData);
    setShowAuthModal(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      const raw = localStorage.getItem("yubiUser");
      const u = raw ? JSON.parse(raw) : null;
      if (u?.token && u?.role !== "admin" && u?.role !== "delivery") {
        await foodAPI.logout();
      }
    } catch {
      /* still clear client session */
    } finally {
      localStorage.removeItem("yubiUser");
      setUser(null);
      setAddresses([]);
    }
  }, []);

  function addAddress(newAddress) {
    setAddresses((addresses) => {
      const shouldBeDefault = newAddress.isDefault || addresses.length === 0;
      const updated = shouldBeDefault
        ? [...addresses.map((a) => ({ ...a, isDefault: false })), { ...newAddress, isDefault: true }]
        : [...addresses, { ...newAddress, isDefault: false }];
      return updated;
    });
  }

  const setDefaultAddress = useCallback(
    async (addressId) => {
      const id = addressId != null ? String(addressId) : "";
      if (!id || !user?.token) {
        return {
          success: false,
          message: "Please sign in to set a default address.",
        };
      }
      try {
        const data = await authAPI.setDeliveryAddressDefault(id);
        if (data?.success === false) {
          return {
            success: false,
            message: getLoginFailureMessage(data, "Could not set default address."),
            data,
          };
        }
        await refreshDeliveryAddresses();
        return { success: true, data };
      } catch (e) {
        return {
          success: false,
          message: getApiErrorMessage(e, "Could not set default address."),
        };
      }
    },
    [user?.token, refreshDeliveryAddresses],
  );

  const removeAddress = useCallback(
    async (addressId) => {
      const id = addressId != null ? String(addressId) : "";
      if (!id || !user?.token) {
        return {
          success: false,
          message: "Please sign in to delete an address.",
        };
      }
      try {
        const data = await authAPI.deleteDeliveryAddress(id);
        if (data && typeof data === "object" && data.success === false) {
          return {
            success: false,
            message: getLoginFailureMessage(data, "Could not delete address."),
            data,
          };
        }
        await refreshDeliveryAddresses();
        return { success: true, data };
      } catch (e) {
        return {
          success: false,
          message: getApiErrorMessage(e, "Could not delete address."),
        };
      }
    },
    [user?.token, refreshDeliveryAddresses],
  );

  function openAuthModal(mode = "login") {
    setAuthMode(mode);
    setShowAuthModal(true);
  }

  const value = {
    user,
    login,
    logout,
    addresses,
    addressesLoading,
    refreshDeliveryAddresses,
    addAddress,
    setDefaultAddress,
    removeAddress,
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode,
    openAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
