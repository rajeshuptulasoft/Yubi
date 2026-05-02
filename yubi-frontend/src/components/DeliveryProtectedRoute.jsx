import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DeliveryProtectedRoute({ children }) {
  const nav = useNavigate();

  useEffect(() => {
    const yubiUser = localStorage.getItem("yubiUser");
    if (!yubiUser) {
      nav("/delivery-partner");
      return;
    }

    try {
      const user = JSON.parse(yubiUser);
      if (user.role !== "delivery") {
        nav("/delivery-partner");
      }
    } catch (e) {
      nav("/delivery-partner");
    }
  }, [nav]);

  const yubiUser = localStorage.getItem("yubiUser");
  try {
    const user = yubiUser ? JSON.parse(yubiUser) : null;
    if (user && user.role === "delivery") {
      return children;
    }
  } catch (e) {
    // Invalid JSON
  }

  return null;
}
