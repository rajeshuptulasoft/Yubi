import { deliveryPartners } from "../data";

const PARTNERS_KEY = "yubiDeliveryPartners";
const USER_KEY = "yubiUser";

export function getDeliveryPartners() {
  try {
    return JSON.parse(localStorage.getItem(PARTNERS_KEY) || "null") || deliveryPartners;
  } catch {
    return deliveryPartners;
  }
}

export function saveDeliveryPartners(partners) {
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
  window.dispatchEvent(new Event("yubiDeliveryPartnersUpdated"));
}

export function getCurrentDeliveryUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

/** Positive numeric id for `/delivery-partner/*` query params (from login session). */
export function getDeliveryPartnerIdFromSession() {
  const user = getCurrentDeliveryUser();
  if (!user || user.role !== "delivery") return null;
  const raw = user.partnerId ?? user.delivery_partner_id ?? user.id;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getCurrentDeliveryPartner() {
  const user = getCurrentDeliveryUser();
  const partners = getDeliveryPartners();
  const phoneDigits = String(user?.phone ?? "").replace(/\D/g, "");
  const bySeed =
    partners.find(
      (partner) =>
        partner.id === user?.partnerId ||
        partner.email === user?.email ||
        (phoneDigits &&
          String(partner.phone ?? "").replace(/\D/g, "") === phoneDigits),
    ) ?? null;
  if (bySeed) return bySeed;
  const dpId = user?.partnerId ?? user?.delivery_partner_id;
  if (
    user?.role === "delivery" &&
    (user?.token || dpId != null || user?.user_id != null)
  ) {
    return {
      id: dpId ?? user?.user_id ?? user.partnerId ?? "delivery-api",
      name: user.name || "Delivery partner",
      email: user.email ?? "",
      phone: user.phone ?? "",
      status: "Available",
      currentOrderId: null,
      totalDeliveries: 0,
      rating: 0,
      earnings: 0,
    };
  }
  return partners[0];
}

export function updateCurrentDeliveryPartnerStatus(isOnline) {
  const current = getCurrentDeliveryPartner();
  const nextStatus = isOnline ? (current.currentOrderId ? "On Delivery" : "Available") : "Offline";
  const partners = getDeliveryPartners().map((partner) => (
    partner.id === current.id ? { ...partner, status: nextStatus } : partner
  ));
  saveDeliveryPartners(partners);
  return partners.find((partner) => partner.id === current.id);
}

export function isPartnerOnline(partner) {
  return partner?.status !== "Offline";
}
