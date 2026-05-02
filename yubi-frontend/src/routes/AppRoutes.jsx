import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import UserFloatingTools from "../components/UserFloatingTools";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import DeliveryProtectedRoute from "../components/DeliveryProtectedRoute";
import SplashScreen from "../pages/Splash";
import HomeCombined from "../pages/user/HomeCombined";
import HomeFood from "../pages/user/HomeFood";
import HomeSpices from "../pages/user/HomeSpices";
import Menu from "../pages/user/Menu";
import Spices from "../pages/user/SpiceStore";
import Grocery from "../pages/user/Grocery";
import AgroProducts from "../pages/user/Agro";
import Cart from "../pages/user/Cart";
import Checkout from "../pages/user/Checkout";
import OrderTracking from "../pages/user/OrderTracking";
import OrderHistory from "../pages/user/OrderHistory";
import Blog from "../pages/user/Blog";
import BlogDetail from "../pages/user/BlogDetail";
import Contact from "../pages/user/Contact";
import About from "../pages/user/About";
import Profile from "../pages/user/Profile";
import ProductDetails from "../pages/user/ProductDetails";
import Gallery from "../pages/user/Gallery";
import NotFound from "../pages/NotFound";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminOrdersFood from "../pages/admin/AdminOrdersFood";
import AdminOrdersSpices from "../pages/admin/AdminOrdersSpices";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminOrderDetailsFood from "../pages/admin/AdminOrderDetailsFood";
import AdminOrderDetailsSpices from "../pages/admin/AdminOrderDetailsSpices";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminBlog from "../pages/admin/AdminBlog";
import AdminPartners from "../pages/admin/AdminPartners";
import AdminEnquiriesMessages from "../pages/admin/AdminEnquiriesMessages";
import DeliveryLogin from "../pages/delivery/DeliveryLogin";
import DeliveryLayout from "../pages/delivery/DeliveryLayout";
import DeliveryDashboard from "../pages/delivery/DeliveryDashboard";
import ActiveDelivery from "../pages/delivery/ActiveDelivery";
import DeliveryHistory from "../pages/delivery/DeliveryHistory";
import DeliveryProfile from "../pages/delivery/DeliveryProfile";

function UserLayout() {
  return <><Navbar /><Outlet /><Footer /><UserFloatingTools /><ScrollToTop /></>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route element={<UserLayout />}>
        <Route path="/home" element={<HomeCombined />} />
        <Route path="/home/food" element={<HomeFood />} />
        <Route path="/home/spices" element={<HomeSpices />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/spices" element={<Spices />} />
        <Route path="/grocery" element={<Grocery />} />
        <Route path="/agro" element={<AgroProducts />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track/:orderId" element={<OrderTracking />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:blogId" element={<BlogDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Route>

      <Route path="/admin" element={<AdminLogin />} />
      <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/orders/food" element={<AdminOrdersFood />} />
        <Route path="/admin/orders/spices" element={<AdminOrdersSpices />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/order-details/food" element={<AdminOrderDetailsFood />} />
        <Route path="/admin/order-details/spices" element={<AdminOrderDetailsSpices />} />
        <Route path="/admin/products" element={<Navigate to="/admin/products/food" replace />} />
        <Route path="/admin/products/:productKind" element={<AdminProducts />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/partners" element={<AdminPartners />} />
        <Route path="/admin/enquiries" element={<AdminEnquiriesMessages />} />
        <Route path="/admin/analytics" element={<Navigate to="/admin/enquiries" replace />} />
      </Route>
      <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/delivery-partner" element={<DeliveryLogin />} />
      <Route element={<DeliveryProtectedRoute><DeliveryLayout /></DeliveryProtectedRoute>}>
        <Route path="/delivery-partner/dashboard" element={<DeliveryDashboard />} />
        <Route path="/delivery-partner/active" element={<ActiveDelivery />} />
        <Route path="/delivery-partner/history" element={<DeliveryHistory />} />
        <Route path="/delivery-partner/profile" element={<DeliveryProfile />} />
      </Route>
      <Route path="/delivery-partner/*" element={<Navigate to="/delivery-partner/dashboard" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
