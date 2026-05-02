import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const nav = useNavigate();

  useEffect(() => {
    const yubiUser = localStorage.getItem("yubiUser");
    if (!yubiUser) {
      nav("/admin");
      return;
    }

    try {
      const user = JSON.parse(yubiUser);
      if (user.role !== "admin" || !user.token) {
        nav("/admin");
      }
    } catch (e) {
      nav("/admin");
    }
  }, [nav]);

  const yubiUser = localStorage.getItem("yubiUser");
  try {
    const user = yubiUser ? JSON.parse(yubiUser) : null;
    if (user && user.role === "admin" && user.token) {
      return children;
    }
  } catch (e) {
    // Invalid JSON
  }

  return null;
}
