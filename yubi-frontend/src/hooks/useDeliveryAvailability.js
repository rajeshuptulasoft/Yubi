import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { deliveryPartnerAPI, getApiErrorMessage } from "../lib/api";
import {
  getCurrentDeliveryPartner,
  getDeliveryPartnerIdFromSession,
  updateCurrentDeliveryPartnerStatus,
} from "../utils/deliveryState";

/**
 * Shared online/offline toggle for delivery layout + profile; calls
 * POST /delivery-partner/update-availability with { delivery_partner_id, available: 0|1 }.
 */
export function useDeliveryAvailability() {
  const [partner, setPartner] = useState(() => getCurrentDeliveryPartner());
  const [busy, setBusy] = useState(false);
  const online = partner?.status !== "Offline";

  const syncPartner = useCallback(() => {
    setPartner(getCurrentDeliveryPartner());
  }, []);

  useEffect(() => {
    window.addEventListener("yubiDeliveryPartnersUpdated", syncPartner);
    window.addEventListener("storage", syncPartner);
    window.addEventListener("focus", syncPartner);
    return () => {
      window.removeEventListener("yubiDeliveryPartnersUpdated", syncPartner);
      window.removeEventListener("storage", syncPartner);
      window.removeEventListener("focus", syncPartner);
    };
  }, [syncPartner]);

  const toggle = useCallback(async () => {
    const dpId = getDeliveryPartnerIdFromSession();
    const nextOnline = !online;
    if (!dpId) {
      toast.error("Missing delivery partner id. Please log in again.");
      return;
    }
    setBusy(true);
    try {
      const res = await deliveryPartnerAPI.updateAvailability({
        delivery_partner_id: dpId,
        available: nextOnline ? 1 : 0,
      });
      if (res?.status === "error" || res?.success === false) {
        toast.error(res?.message || "Could not update availability.");
        return;
      }
      setPartner(updateCurrentDeliveryPartnerStatus(nextOnline));
      toast.success(
        nextOnline ? "You are online and visible to admin." : "You are offline for admin.",
      );
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not update availability."));
    } finally {
      setBusy(false);
    }
  }, [online]);

  return { partner, online, toggle, busy, syncPartner };
}
