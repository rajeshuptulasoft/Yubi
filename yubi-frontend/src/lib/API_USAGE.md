/**
 * YUBI API Integration - Usage Examples
 * 
 * This file shows how to use the axios configuration and API service functions
 * throughout your React components.
 */

// ============ EXAMPLE 1: Using API in a Component ============
import { useState, useEffect } from 'react';
import { productsAPI } from '@/lib/api';
import { toast } from 'sonner';

export function ProductListExample() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsAPI.getAllProducts({
        category: 'food',
        limit: 10,
        page: 1,
      });
      setProducts(data.items || []);
      toast.success('Products loaded successfully');
    } catch (err) {
      setError(err.message || 'Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}

// ============ EXAMPLE 2: Create/Update with API ============
import { ordersAPI } from '@/lib/api';

export async function createOrderExample() {
  try {
    const orderData = {
      customerId: 'cust_123',
      items: [
        { productId: 'prod_1', quantity: 2, price: 320 },
        { productId: 'prod_2', quantity: 1, price: 280 },
      ],
      deliveryAddress: 'D2/7, Rasulgarh Industrial Estate',
      paymentMethod: 'COD',
      totalAmount: 920,
    };

    const response = await ordersAPI.createOrder(orderData);
    console.log('Order created:', response);
    toast.success(`Order created: #${response.id}`);
    return response;
  } catch (error) {
    console.error('Failed to create order:', error);
    toast.error('Failed to create order');
    throw error;
  }
}

// ============ EXAMPLE 3: Delete with API ============
export async function deleteProductExample(productId) {
  try {
    await productsAPI.deleteProduct(productId);
    toast.success('Product deleted successfully');
  } catch (error) {
    console.error('Failed to delete product:', error);
    toast.error('Failed to delete product');
  }
}

// ============ EXAMPLE 4: Using Direct Axios Instance ============
import axiosInstance from '@/lib/axios';

export async function customAPICallExample() {
  try {
    // For custom endpoints not covered by API service
    const response = await axiosInstance.get('/custom/endpoint', {
      params: { filter: 'active' },
    });
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============ EXAMPLE 5: Authentication Flow ============
import { authAPI } from '@/lib/api';

export async function loginExample(email, password) {
  try {
    const response = await authAPI.login(email, password);
    
    // Store token in localStorage if returned
    if (response.token) {
      const userData = {
        email: response.email,
        token: response.token,
        role: response.role,
      };
      localStorage.setItem('yubiUser', JSON.stringify(userData));
    }

    toast.success('Logged in successfully');
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    toast.error('Invalid credentials');
    throw error;
  }
}

// ============ EXAMPLE 6: File Upload with Axios ============
import axiosInstance from '@/lib/axios';

export async function uploadImageExample(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'product');

    const response = await axiosInstance.post(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('Upload successful:', response);
    toast.success('Image uploaded successfully');
    return response;
  } catch (error) {
    console.error('Upload failed:', error);
    toast.error('Failed to upload image');
    throw error;
  }
}

// ============ EXAMPLE 7: Using in React Hook ============
import { useEffect, useState } from 'react';
import { ordersAPI } from '@/lib/api';

export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserOrders = async () => {
      setLoading(true);
      try {
        const data = await ordersAPI.getUserOrders(userId);
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserOrders();
    }
  }, [userId]);

  return { orders, loading };
}

// ============ EXAMPLE 8: Handling Errors with Toast Notifications ============
export async function updateDeliveryStatusExample(partnerId, status) {
  try {
    const response = await deliveryAPI.updatePartnerStatus(partnerId, status);
    toast.success('Delivery status updated');
    return response;
  } catch (error) {
    // Error is already intercepted and formatted by axios
    if (error.message === 'Unauthorized') {
      toast.error('Session expired. Please login again.');
    } else if (error.message === 'Not found') {
      toast.error('Delivery partner not found');
    } else {
      toast.error(error.message || 'Failed to update status');
    }
    throw error;
  }
}

// ============ EXPORT GUIDE ============

/*
IMPORT PATTERNS:

1. Import entire API module:
   import { productsAPI, ordersAPI, authAPI } from '@/lib/api';

2. Import individual functions:
   import { apiGet, apiPost } from '@/lib/axios';

3. Import axios instance directly:
   import axiosInstance from '@/lib/axios';

USAGE PATTERNS:

1. In useEffect:
   useEffect(() => {
     productsAPI.getAllProducts().then(data => setProducts(data));
   }, []);

2. In event handlers:
   const handleClick = async () => {
     await ordersAPI.createOrder(orderData);
   };

3. In async functions:
   const fetchData = async () => {
     const data = await productsAPI.getProductById(id);
     return data;
   };

BASE URL: https://www.yubi.co.in/api/

ENDPOINTS STRUCTURE:
- Full URL: https://www.yubi.co.in/api/products
- Usage: productsAPI.getAllProducts() (no need to include /products)

ENVIRONMENT VARIABLES:
- VITE_BASE_URL=https://www.yubi.co.in/api/
- Available in components as: import.meta.env.VITE_BASE_URL
*/
