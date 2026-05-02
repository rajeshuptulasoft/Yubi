# ✅ User Authentication with Axios - Complete Setup

## 📋 What Was Implemented

### **1. Environment Configuration**
**File**: `.env`
```
VITE_BASE_URL=https://www.yubi.co.in/api/
```

### **2. Axios Configuration** 
**File**: `src/lib/axios.js`

Features:
- ✅ Base URL set from environment variable
- ✅ Request interceptor: Auto-injects token from localStorage
- ✅ Response interceptor: Handles errors globally
- ✅ 401 Unauthorized: Auto-redirects to appropriate login page
- ✅ 10-second timeout for requests
- ✅ JSON Content-Type header auto-set

### **3. API Service Layer**
**File**: `src/lib/api.js`

Includes:
- ✅ `authAPI.userLogin(email, password)` - **User login via `/food/login`**
- ✅ All CRUD operations grouped by feature (Orders, Products, Users, Delivery, etc.)
- ✅ Helper functions: `apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()`

### **4. User Authentication Hook**
**File**: `src/hooks/useUserAuth.js`

Provides:
- ✅ `login()` - Login user with email/password
- ✅ `logout()` - Logout and clear token
- ✅ `user` - Current user object
- ✅ `isLoggedIn` - Boolean flag
- ✅ `getToken()` - Get auth token
- ✅ `getUserId()` - Get user ID
- ✅ `isAdmin()` - Check if admin
- ✅ `isDeliveryPartner()` - Check if delivery partner

### **5. Updated Auth Page**
**File**: `src/pages/Auth.jsx`

Changes:
- ✅ Uses `authAPI.userLogin()` for sign-in
- ✅ Posts email and password to `/food/login` endpoint
- ✅ Stores returned token in localStorage
- ✅ Redirects to `/home` after successful login
- ✅ Shows error toast for failed login

### **6. Documentation Files**
- ✅ `AUTH_IMPLEMENTATION.md` - Detailed setup guide
- ✅ `USER_AUTH_EXAMPLES.md` - Integration examples
- ✅ `API_USAGE.md` - API service documentation

---

## 🔄 Complete User Login Flow

```
1. User visits /auth page
   ↓
2. Enters email and password
   ↓
3. Clicks "Sign In" button
   ↓
4. Auth.jsx calls: authAPI.userLogin(email, password)
   ↓
5. Axios POST request to: https://www.yubi.co.in/api/food/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ↓
6. Server responds with token:
   {
     "id": "user_123",
     "email": "user@example.com",
     "name": "John Doe",
     "phone": "+91 9876543210",
     "token": "eyJhbGc...",
     "role": "customer"
   }
   ↓
7. Token stored in localStorage as yubiUser:
   localStorage.yubiUser = {
     id, email, name, phone, token, role
   }
   ↓
8. User redirected to /home
   ↓
9. All subsequent API calls include token automatically:
   Authorization: Bearer eyJhbGc...
```

---

## 🚀 Using Authentication in Components

### **Simple Login Hook**
```javascript
import { useUserAuth } from '@/hooks/useUserAuth';

function MyComponent() {
  const { user, isLoggedIn, login, logout } = useUserAuth();
  
  if (isLoggedIn) {
    return <p>Welcome, {user.name}!</p>;
  }
}
```

### **Making Protected API Calls**
```javascript
import { ordersAPI } from '@/lib/api';
import { useUserAuth } from '@/hooks/useUserAuth';

function CheckoutComponent() {
  const { user, isLoggedIn } = useUserAuth();
  
  const handleCheckout = async () => {
    if (!isLoggedIn) return;
    
    // Token is automatically included
    const order = await ordersAPI.createOrder({
      customerId: user.id,
      items: [...],
      total: 920
    });
  };
}
```

### **Protected Route**
```javascript
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '@/hooks/useUserAuth';

function ProtectedUserRoute({ children }) {
  const { isLoggedIn } = useUserAuth();
  return isLoggedIn ? children : <Navigate to="/auth" />;
}

// Usage:
// <ProtectedUserRoute>
//   <Checkout />
// </ProtectedUserRoute>
```

---

## 📊 Token Storage Structure

**localStorage Key**: `yubiUser`

**Value**:
```json
{
  "id": "user_123",
  "email": "user@example.com", 
  "name": "John Doe",
  "phone": "+91 9876543210",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "customer"
}
```

---

## 🔐 Security Features

✅ **Automatic Token Injection**
- Token from localStorage added to every request
- Authorization header: `Bearer <token>`

✅ **Auto-Logout on 401**
- Invalid/expired tokens trigger auto-logout
- User redirected to login page
- Token cleared from localStorage

✅ **Role-Based Redirect**
- Admin (401) → `/admin` login
- Delivery → `/delivery-partner` login
- User → `/auth` login

✅ **Error Handling**
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

---

## 📝 API Endpoint

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| POST | `/food/login` | User login | `{ "email": "", "password": "" }` |

**Full URL**: `https://www.yubi.co.in/api/food/login`

---

## ✅ Verification Checklist

- [x] axios installed (`npm install axios --save`)
- [x] Environment variable `VITE_BASE_URL` set
- [x] Axios configuration with interceptors created
- [x] API service layer with `authAPI.userLogin()` created
- [x] Custom `useUserAuth()` hook created
- [x] Auth page updated to use axios
- [x] Token stored in localStorage
- [x] Token auto-injected in requests
- [x] Error handling implemented
- [x] Documentation created

---

## 🔍 Testing the Implementation

**Step 1**: Go to `http://localhost:5173/auth`

**Step 2**: Enter test credentials:
```
Email: user@example.com
Password: password123
```

**Step 3**: Click "Sign In"

**Step 4**: Check browser console and localStorage:
```javascript
// In browser console:
console.log(localStorage.getItem('yubiUser'))
// Should show token and user data
```

**Step 5**: Make an API call to verify token is included:
```javascript
import { productsAPI } from '@/lib/api';
const products = await productsAPI.getAllProducts();
// Network tab should show Authorization header with token
```

---

## 🎯 Next Steps

1. **Test with actual backend** - Verify the `/food/login` endpoint works
2. **Handle token expiration** - Implement refresh token logic if needed
3. **Add role-based routes** - Protect admin/delivery routes
4. **Implement 2FA** - Add two-factor authentication if needed
5. **Add password reset** - Create forgot password flow

---

## 📚 Files Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `.env` | ✅ Modified | Added `VITE_BASE_URL` |
| `src/lib/axios.js` | ✅ Created | Axios configuration & interceptors |
| `src/lib/api.js` | ✅ Modified | Added `authAPI.userLogin()` |
| `src/pages/Auth.jsx` | ✅ Modified | Updated to use axios for login |
| `src/hooks/useUserAuth.js` | ✅ Created | Custom auth hook |
| `AUTH_IMPLEMENTATION.md` | ✅ Created | Implementation guide |
| `USER_AUTH_EXAMPLES.md` | ✅ Created | Usage examples |
| `API_USAGE.md` | ✅ Created | API documentation |

---

## 🆘 Troubleshooting

### **"Module not found: axios"**
- Run: `npm install axios --save`

### **"Token not included in request"**
- Check localStorage has `yubiUser` with `token` field
- Verify axios configuration in `src/lib/axios.js`

### **"401 Unauthorized on API calls"**
- Check token is valid on server
- Verify token format is correct
- Check server is returning token on login

### **"Redirect loop on login page"**
- Check if token is expired
- Verify `/auth` route is not protected

---

## 📞 Support

For issues or questions:
1. Check `AUTH_IMPLEMENTATION.md` for detailed guide
2. Review `USER_AUTH_EXAMPLES.md` for code examples
3. Check browser Network tab to verify requests
4. Check browser Console for error messages
5. Verify `.env` file has correct `VITE_BASE_URL`

---

**Setup Complete! 🎉**

The user authentication system is now ready to use with axios and the `/food/login` endpoint.
