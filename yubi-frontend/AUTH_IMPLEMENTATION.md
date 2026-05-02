## User Authentication with Axios - Implementation Guide

### ✅ **Setup Complete**

The user authentication system has been updated to use **axios** with the `/food/login` API endpoint.

---

## **How It Works**

### **1. User Login Flow**

When a user logs in via `/auth`:

```javascript
// POST request to: https://www.yubi.co.in/api/food/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (from server):**
```javascript
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+91 9876543210",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "customer"
}
```

### **2. Token Storage**

After successful login, the token and user data are stored in `localStorage`:

```javascript
localStorage.yubiUser = {
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+91 9876543210",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "customer"
}
```

### **3. Token Auto-Injection**

Every API request automatically includes the token in headers:

```javascript
// Request headers automatically set to:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## **Usage in Components**

### **Option 1: Using Custom Hook (Recommended)**

```javascript
import { useUserAuth } from '@/hooks/useUserAuth';

export function MyComponent() {
  const { user, isLoggedIn, login, logout } = useUserAuth();

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password123');
    if (result.success) {
      console.log('User logged in:', result.user);
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### **Option 2: Using API Service Directly**

```javascript
import { authAPI } from '@/lib/api';
import { useState } from 'react';

export function LoginComponent() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.userLogin(email, password);
      
      // Store token in localStorage
      localStorage.setItem('yubiUser', JSON.stringify({
        ...response,
        token: response.token,
      }));
      
      console.log('Login successful:', response);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={() => handleLogin('user@example.com', 'password123')}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

---

## **Making API Calls with Token**

Once the user is logged in, all API calls automatically include the token:

```javascript
import { productsAPI, ordersAPI } from '@/lib/api';

// Token is automatically included in all requests
const products = await productsAPI.getAllProducts();
const orders = await ordersAPI.getUserOrders('user_123');
// Both requests will have:
// Authorization: Bearer <token>
```

---

## **Updated File Locations**

| File | Purpose |
|------|---------|
| `src/lib/axios.js` | Axios configuration with interceptors |
| `src/lib/api.js` | API service functions (includes `authAPI.userLogin`) |
| `src/hooks/useUserAuth.js` | Custom hook for user authentication |
| `src/pages/Auth.jsx` | Updated login page using axios |
| `.env` | Contains `VITE_BASE_URL=https://www.yubi.co.in/api/` |

---

## **Key Features**

✅ **Automatic Token Injection** - Token is sent with every request  
✅ **Error Handling** - 401 responses trigger auto-logout  
✅ **Token Persistence** - Token stored in localStorage  
✅ **User Data Accessible** - User info available via `useUserAuth` hook  
✅ **Logout Functionality** - Clears token and redirects to login  

---

## **Environment Configuration**

Your `.env` file should contain:

```env
VITE_APP_NAME=YUBI
VITE_BASE_URL=https://www.yubi.co.in/api/
```

The base URL is automatically used for all API calls.

---

## **API Endpoints Called**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/food/login` | POST | User login (email + password) |
| `/auth/logout` | POST | User logout |
| `/auth/refresh` | POST | Refresh auth token |

---

## **Token Refresh (Optional)**

If your server returns a token expiration time, you can implement automatic token refresh:

```javascript
import { authAPI } from '@/lib/api';

export async function refreshToken() {
  try {
    const response = await authAPI.refreshToken();
    const userData = JSON.parse(localStorage.getItem('yubiUser'));
    userData.token = response.token;
    localStorage.setItem('yubiUser', JSON.stringify(userData));
    return response.token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    localStorage.removeItem('yubiUser');
  }
}
```

---

## **Common Operations**

### **Get Current User**
```javascript
const { user } = useUserAuth();
console.log(user.id, user.email, user.name);
```

### **Get Auth Token**
```javascript
const { getToken } = useUserAuth();
const token = getToken();
```

### **Check User Role**
```javascript
const { isAdmin, isDeliveryPartner } = useUserAuth();
if (isAdmin()) {
  // Show admin panel
}
```

### **Logout**
```javascript
const { logout } = useUserAuth();
await logout(); // Clears token and redirects
```

---

## **Error Handling**

Errors from API are automatically formatted:

```javascript
import { authAPI } from '@/lib/api';

try {
  await authAPI.userLogin('email@test.com', 'wrongpass');
} catch (error) {
  // error will be the formatted response data
  console.log(error.message); // e.g., "Invalid credentials"
}
```

---

## **Security Notes**

1. ✅ Token stored in localStorage (accessible from JavaScript)
2. ✅ Token sent in Authorization header for every request
3. ✅ 401 responses automatically clear token and redirect to login
4. ✅ Token should be HttpOnly cookie for maximum security (future improvement)

---

## **Testing the Login**

1. Go to `/auth` page
2. Enter email and password
3. Click "Sign In"
4. On success:
   - Token is stored in localStorage as `yubiUser`
   - User is redirected to `/home`
   - All subsequent API calls include the token

---

## **Next Steps**

1. **Test the login** with your actual backend
2. **Verify token format** from your server
3. **Handle token expiration** if applicable
4. **Implement role-based access** using `isAdmin()`, `isDeliveryPartner()`
5. **Add Protected Routes** to restrict access based on user role
