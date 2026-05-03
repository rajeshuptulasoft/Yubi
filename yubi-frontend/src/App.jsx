import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

const queryClient = new QueryClient();

/** Must match Vite `base` so client routes work when the app is hosted under a subpath */
const routerBasename = (() => {
  const b = import.meta.env.BASE_URL || "/";
  if (b === "/") return undefined;
  return b.replace(/\/$/, "");
})();

function ToastHost() {
  if (typeof document === "undefined") return null;
  return createPortal(
    <Toaster
      richColors
      theme="light"
      position="top-right"
      duration={2500}
      visibleToasts={4}
    />,
    document.body,
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter {...(routerBasename ? { basename: routerBasename } : {})}>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <AppRoutes />
              <ToastHost />
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
