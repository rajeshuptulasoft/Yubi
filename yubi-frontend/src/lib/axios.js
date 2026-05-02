import axios from 'axios';

/** Production API when env is not set at build time */
const PRODUCTION_FALLBACK = 'https://www.yubi.co.in/api/';

/**
 * Dev: use same-origin `/api/` + Vite proxy → http://localhost:4000 (avoids CORS).
 * `.env` often sets VITE_BASE_URL to production; using it from localhost causes CORS.
 *
 * Override dev URL: `VITE_DEV_API_URL=http://localhost:4000/api/` (direct, needs backend CORS).
 */
const BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_BASE_URL || PRODUCTION_FALLBACK
  : import.meta.env.VITE_DEV_API_URL || '/api/';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const yubiUser = localStorage.getItem('yubiUser');
    if (yubiUser) {
      try {
        const user = JSON.parse(yubiUser);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common error scenarios
    // Only treat 401 as "session expired" when the request carried a token.
    // Wrong password on POST /food/login returns 401 too — do not redirect/clear for that.
    if (error.response?.status === 401) {
      const authHeader =
        error.config?.headers?.Authorization ??
        error.config?.headers?.authorization;
      if (authHeader) {
        const yubiUser = localStorage.getItem('yubiUser');
        localStorage.removeItem('yubiUser');

        if (yubiUser) {
          try {
            const user = JSON.parse(yubiUser);
            if (user.role === 'admin') {
              window.location.href = '/admin';
            } else if (user.role === 'delivery') {
              window.location.href = '/delivery-partner';
            } else {
              window.location.href = '/auth';
            }
          } catch (e) {
            window.location.href = '/auth';
          }
        } else {
          window.location.href = '/auth';
        }
      }
    }
    
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }
    
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data);
    }
    
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosInstance;

// Utility function for GET requests
export const apiGet = (endpoint, config = {}) => {
  return axiosInstance.get(endpoint, config);
};

// Utility function for POST requests
export const apiPost = (endpoint, data = {}, config = {}) => {
  return axiosInstance.post(endpoint, data, config);
};

// Utility function for PUT requests
export const apiPut = (endpoint, data = {}, config = {}) => {
  return axiosInstance.put(endpoint, data, config);
};

/** POST with multipart/form-data. Lets the runtime set the boundary. */
export const apiPostFormData = (endpoint, formData, config = {}) => {
  return axiosInstance.post(endpoint, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': false,
    },
  });
};

/** PUT with multipart/form-data (e.g. profile image). Lets the runtime set the boundary. */
export const apiPutFormData = (endpoint, formData, config = {}) => {
  return axiosInstance.put(endpoint, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': false,
    },
  });
};

// Utility function for PATCH requests
export const apiPatch = (endpoint, data = {}, config = {}) => {
  return axiosInstance.patch(endpoint, data, config);
};

// Utility function for DELETE requests
export const apiDelete = (endpoint, config = {}) => {
  return axiosInstance.delete(endpoint, config);
};
