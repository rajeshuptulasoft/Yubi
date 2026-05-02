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
      <BrowserRouter>
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
