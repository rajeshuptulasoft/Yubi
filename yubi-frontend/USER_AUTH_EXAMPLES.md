/**
 * YUBI User Authentication Integration Examples
 * 
 * This file demonstrates how to use the new axios-based authentication
 * system in real checkout/order scenarios
 */

// ============ EXAMPLE 1: Protected Order Creation ============
import { ordersAPI } from '@/lib/api';
import { useUserAuth } from '@/hooks/useUserAuth';
import { useState } from 'react';
import { toast } from 'sonner';

export function CheckoutComponent() {
  const { user, isLoggedIn, login } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const handleCreateOrder = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast.error('Please login to place an order');
      return;
    }

    setLoading(true);
    try {
      // Prepare order data
      const orderData = {
        customerId: user.id,
        customerEmail: user.email,
        customerPhone: user.phone,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryAddress: user.deliveryAddress || 'Enter address',
        paymentMethod: 'COD', // or 'ONLINE'
        totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };

      // Create order via API
      // Token is automatically included in request headers
      const response = await ordersAPI.createOrder(orderData);

      toast.success(`Order placed successfully! Order ID: ${response.id}`);
      
      // Redirect to order tracking
      window.location.href = `/track/${response.id}`;
    } catch (error) {
      console.error('Failed to create order:', error);
      // If 401 error, user will be automatically redirected to login
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>Logged in as: {user.name}</p>
          <button onClick={handleCreateOrder} disabled={loading}>
            {loading ? 'Creating Order...' : 'Place Order'}
          </button>
        </div>
      ) : (
        <button onClick={() => login('user@example.com', 'password')}>
          Login to Continue
        </button>
      )}
    </div>
  );
}

// ============ EXAMPLE 2: Fetch User Orders ============
import { useEffect } from 'react';

export function UserOrdersComponent() {
  const { user, isLoggedIn, getToken } = useUserAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchUserOrders();
    }
  }, [isLoggedIn, user?.id]);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      // Token is automatically added to request
      const response = await ordersAPI.getUserOrders(user.id);
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <p>Please login to view your orders</p>;
  }

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <ul>
          {orders.map(order => (
            <li key={order.id}>
              Order #{order.id} - ₹{order.total} - {order.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============ EXAMPLE 3: Protected Route Wrapper ============
import { Navigate } from 'react-router-dom';

export function ProtectedUserRoute({ children }) {
  const { isLoggedIn, loading } = useUserAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

// Usage:
// <ProtectedUserRoute>
//   <Checkout />
// </ProtectedUserRoute>

// ============ EXAMPLE 4: Update User Profile ============
export function UserProfileComponent() {
  const { user, updateUser, getToken } = useUserAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    deliveryAddress: user?.deliveryAddress || '',
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Call API to update profile
      const response = await usersAPI.updateUserProfile(user.id, formData);
      
      // Update local user data
      updateUser(response);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Update Profile</h2>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
      />
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="Phone"
      />
      <input
        type="text"
        value={formData.deliveryAddress}
        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
        placeholder="Delivery Address"
      />
      <button onClick={handleUpdateProfile} disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </div>
  );
}

// ============ EXAMPLE 5: Verify User Before Payment ============
export async function verifyUserBeforePayment(user) {
  // Verify user data before initiating payment
  if (!user || !user.id || !user.email) {
    throw new Error('Invalid user data');
  }

  // Optional: Call API to verify user is still valid
  try {
    const userData = await usersAPI.getUserProfile(user.id);
    return userData;
  } catch (error) {
    throw new Error('Failed to verify user');
  }
}

// ============ EXAMPLE 6: Logout and Cleanup ============
export function NavbarComponent() {
  const { user, isLoggedIn, logout } = useUserAuth();

  const handleLogout = async () => {
    await logout();
    // useUserAuth hook will redirect to /auth automatically
  };

  return (
    <nav>
      {isLoggedIn ? (
        <div>
          <span>{user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <a href="/auth">Login</a>
      )}
    </nav>
  );
}

// ============ EXAMPLE 7: Custom Hook for Order Management ============
export function useUserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useUserAuth();

  const fetchOrders = async () => {
    if (!isLoggedIn || !user?.id) return;

    setLoading(true);
    try {
      const response = await ordersAPI.getUserOrders(user.id);
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isLoggedIn, user?.id]);

  return {
    orders,
    loading,
    refetch: fetchOrders,
  };
}

// Usage in component:
// const { orders, loading, refetch } = useUserOrders();

// ============ SUMMARY ============
/*
KEY POINTS FOR INTEGRATION:

1. ALWAYS CHECK LOGIN STATUS:
   const { isLoggedIn, user } = useUserAuth();
   if (!isLoggedIn) { navigate to login }

2. TOKEN IS AUTOMATIC:
   All API calls include token automatically
   No need to manually add headers

3. REDIRECT ON UNAUTHORIZED:
   If server returns 401, user is auto-redirected to /auth

4. STORE USER DATA LOCALLY:
   User data available via useUserAuth() hook
   No need to fetch user info every time

5. ERROR HANDLING:
   Always wrap API calls in try-catch
   Show toast messages for errors
   Handle 401/403/404/500 errors

6. LOGOUT:
   Call logout() to clear token and redirect
   localStorage is automatically cleared

7. PROTECTED COMPONENTS:
   Wrap components with ProtectedUserRoute
   Only render if isLoggedIn is true

8. TESTING:
   Use the /auth page to login
   Token will be stored in localStorage
   Make API calls to verify token is included
*/
