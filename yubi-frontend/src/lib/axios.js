import axios from 'axios';

/** Production API when env is not set at build time */
export const PRODUCTION_API_BASE_URL = 'https://www.yubi.co.in/api/';

function normalizeApiBaseUrl(url) {
  if (url == null || typeof url !== 'string') return '/api/';
  const t = url.trim();
  if (!t) return '/api/';
  return t.endsWith('/') ? t : `${t}/`;
}

/** Client route path for full-page redirects (matches `BrowserRouter` basename from Vite `base`). */
function appNavigatePath(route) {
  const base = import.meta.env.BASE_URL || '/';
  const r = String(route || '').replace(/^\//, '');
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${r}`;
}

/**
 * Dev: use same-origin `/api/` + Vite proxy → http://localhost:4000 (avoids CORS).
 * `.env` often sets VITE_BASE_URL to production; using it from localhost causes CORS.
 *
 * Override dev URL: `VITE_DEV_API_URL=http://localhost:4000/api/` (direct, needs backend CORS).
 */
const LOCAL_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_LOCAL_BASE_URL || import.meta.env.VITE_DEV_API_URL || '/api/'
  : '';

export const API_BASE_URL = normalizeApiBaseUrl(
  LOCAL_BASE_URL || import.meta.env.VITE_BASE_URL || PRODUCTION_API_BASE_URL,
);

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
              window.location.href = appNavigatePath('/admin');
            } else if (user.role === 'delivery') {
              window.location.href = appNavigatePath('/delivery-partner');
            } else {
              window.location.href = appNavigatePath('/auth');
            }
          } catch (e) {
            window.location.href = appNavigatePath('/auth');
          }
        } else {
          window.location.href = appNavigatePath('/auth');
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
