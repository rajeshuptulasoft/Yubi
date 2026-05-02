import axiosInstance, { apiGet, apiPost, apiPostFormData, apiPut, apiPutFormData, apiPatch, apiDelete } from './axios';

/** Normalize axios/API rejection payloads for user-facing messages */
export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err.success === false && typeof err.message === 'string' && err.message.trim()) {
    return err.message.trim();
  }
  if (typeof err.message === 'string' && err.message) return err.message;
  if (typeof err.error === 'string') return err.error;
  if (err.error?.message) return err.error.message;
  if (Array.isArray(err.message)) return err.message[0];
  return fallback;
}

/**
 * Login API may return HTTP 200 with { success: false, message: "..." } (no 401).
 */
export function getLoginFailureMessage(payload, fallback = 'Login failed. Please try again.') {
  if (!payload || typeof payload !== 'object') return fallback;
  if (payload.success === false && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }
  return getApiErrorMessage(payload, fallback);
}

// ============ ORDERS API ============
export const ordersAPI = {
  // Get all orders (admin)
  getAllOrders: (params = {}) => apiGet('/orders', { params }),
  
  // Get order by ID
  getOrderById: (orderId) => apiGet(`/orders/${orderId}`),
  
  // Create new order
  createOrder: (orderData) => apiPost('/orders', orderData),
  
  // Update order status
  updateOrderStatus: (orderId, status) => apiPut(`/orders/${orderId}`, { status }),
  
  // Delete order
  deleteOrder: (orderId) => apiDelete(`/orders/${orderId}`),
  
  // Get user's orders
  getUserOrders: (userId) => apiGet(`/orders/user/${userId}`),
};

// ============ FOOD (PUBLIC) API ============
/** `getProducts` is public. `getFoodsSpices` sends Bearer token via axios when `yubiUser` is in localStorage. */
export const foodAPI = {
  /** GET /food/products */
  getProducts: (params = {}) => apiGet("/food/products", { params }),

  /** GET /food/foods-spices — authenticated (Authorization added by axios interceptor). */
  getFoodsSpices: (params = {}) => apiGet("/food/foods-spices", { params }),

  /** GET /food/agro-products — public */
  getAgroProducts: (params = {}) => apiGet("/food/agro-products", { params }),

  /** GET /food/blogs — public */
  getBlogs: (params = {}) => apiGet("/food/blogs", { params }),

  /** POST /food/contact — public JSON { name, email, phone, subject, message } */
  submitContact: (payload) => apiPost("/food/contact", payload),

  /**
   * POST /food/enquiry — public JSON
   * { product_id, name, email, phone, address, quantity, message }
   */
  submitEnquiry: (payload) => apiPost("/food/enquiry", payload),

  /**
   * POST /food/cart — authenticated (Bearer from localStorage yubiUser).
   * Body typically { product_id, quantity, variant? }
   */
  addToCart: (payload) => apiPost("/food/cart", payload),

  /** GET /food/cart — authenticated; returns cart lines and pricing */
  getCart: () => apiGet("/food/cart"),

  /** PUT /food/cart/:cartItemId — update line quantity */
  updateCartItem: (cartItemId, payload) => apiPut(`/food/cart/${cartItemId}`, payload),

  /** DELETE /food/cart/:cart_item_id — removes that cart line (Bearer token) */
  removeCartItem: (cartItemId) => apiDelete(`/food/cart/${cartItemId}`),

  /** GET /food/user-order — authenticated; list of user orders */
  getUserOrders: (params = {}) => apiGet("/food/user-order", { params }),

  /**
   * POST /food/order — authenticated (Bearer). Place order; e.g. COD:
   * { payment_method: 'COD', delivery_address_id?: number }
   */
  placeOrder: (payload) => apiPost("/food/order", payload),

  /** GET /food/order-details/:orderId — authenticated */
  getOrderDetails: (orderId) => apiGet(`/food/order-details/${orderId}`),

  /** GET /food/order-status/:orderId — authenticated; tracking / timeline */
  getOrderStatus: (orderId) => apiGet(`/food/order-status/${orderId}`),

  /**
   * POST /food/cancel-order — authenticated JSON
   * { order_id, cancel_code, reason, review? }
   */
  cancelOrder: (payload) => apiPost("/food/cancel-order", payload),
};

// ============ PRODUCTS API ============
export const productsAPI = {
  // Get all products
  getAllProducts: (params = {}) => apiGet('/products', { params }),
  
  // Get product by ID
  getProductById: (productId) => apiGet(`/products/${productId}`),
  
  // Create product (admin)
  createProduct: (productData) => apiPost('/products', productData),
  
  // Update product (admin)
  updateProduct: (productId, productData) => apiPut(`/products/${productId}`, productData),
  
  // Delete product (admin)
  deleteProduct: (productId) => apiDelete(`/products/${productId}`),
  
  // Get products by category
  getProductsByCategory: (category, params = {}) => apiGet(`/products/category/${category}`, { params }),
};

// ============ USERS API ============
export const usersAPI = {
  // Get all users (admin)
  getAllUsers: (params = {}) => apiGet('/users', { params }),
  
  // Get user profile
  getUserProfile: (userId) => apiGet(`/users/${userId}`),
  
  // Update user profile
  updateUserProfile: (userId, userData) => apiPut(`/users/${userId}`, userData),
  
  // Delete user (admin)
  deleteUser: (userId) => apiDelete(`/users/${userId}`),
};

// ============ DELIVERY PARTNERS API ============
export const deliveryAPI = {
  // Get all delivery partners (admin)
  getAllPartners: (params = {}) => apiGet('/delivery-partners', { params }),

  // Create delivery partner (admin)
  createPartner: (partnerData) => apiPost('/delivery-partners', partnerData),
  
  // Get partner by ID
  getPartnerById: (partnerId) => apiGet(`/delivery-partners/${partnerId}`),
  
  // Update partner status
  updatePartnerStatus: (partnerId, status) => apiPut(`/delivery-partners/${partnerId}`, { status }),
  
  // Get partner's deliveries
  getPartnerDeliveries: (partnerId) => apiGet(`/delivery-partners/${partnerId}/deliveries`),
  
  // Assign delivery to partner
  assignDelivery: (partnerId, orderId) => apiPost(`/delivery-partners/${partnerId}/assign`, { orderId }),
};

// ============ AUTHENTICATION API ============
export const authAPI = {
  // User login
  userLogin: (email, password) => apiPost('/food/login', { email, password }),
  
  // Login
  login: (email, password) => apiPost('/auth/login', { email, password }),
  
  /** POST /admin/login — body: { phone_or_email, password } */
  adminLogin: (phoneOrEmail, password) =>
    apiPost('/admin/login', { phone_or_email: phoneOrEmail, password }),
  
  /** POST /delivery/login — body: { phone, password } (mobile + password) */
  deliveryLogin: (phone, password) => apiPost("/delivery/login", { phone, password }),
  
  /** POST /food/register — body: name, email, password, confirm_password, phone */
  register: (userData) => apiPost('/food/register', userData),

  /** GET /food/profile — Authorization: Bearer token (from axios interceptor) */
  getProfile: () => apiGet('/food/profile'),

  /** PUT /food/profile — multipart/form-data: name, email, phone, profile_picture (file) */
  updateProfile: (formData) => apiPutFormData('/food/profile', formData),

  /** GET /food/delivery-addresses — Bearer token (axios interceptor) */
  getDeliveryAddresses: () => apiGet('/food/delivery-addresses'),

  /** POST /food/delivery-addresses — Content-Type: application/json (axios default), Bearer token */
  addAddress: (payload) => apiPost('/food/delivery-addresses', payload),

  /** PUT /food/delivery-addresses/:id — JSON body (axios default), Bearer token */
  updateDeliveryAddress: (addressId, payload) =>
    apiPut(`/food/delivery-addresses/${addressId}`, payload),

  /** DELETE /food/delivery-addresses/:id — Bearer token */
  deleteDeliveryAddress: (addressId) => apiDelete(`/food/delivery-addresses/${addressId}`),

  /** PATCH /food/delivery-addresses/:id/default — JSON body (axios default), Bearer token */
  setDeliveryAddressDefault: (addressId) =>
    apiPatch(`/food/delivery-addresses/${addressId}/default`, {}),
  
  // Logout
  logout: () => apiPost('/auth/logout', {}),
  
  // Refresh token
  refreshToken: () => apiPost('/auth/refresh', {}),
};

// ============ ADMIN API ============
export const adminAPI = {
  /** GET /admin/admin-dashboard — Bearer admin token (axios interceptor) */
  getDashboard: () => apiGet('/admin/admin-dashboard'),

  /** GET /admin/admin-orders — list orders (filter food vs spices in UI) */
  getAdminOrders: () => apiGet('/admin/admin-orders'),

  /** PATCH /admin/admin-orders/:order_id/assign — e.g. { delivery_partner_id } */
  assignAdminOrderPartner: (orderId, payload) =>
    apiPatch(`/admin/admin-orders/${orderId}/assign`, payload),

  /** PATCH /admin/admin-orders/:order_id/status — e.g. { status } */
  patchAdminOrderStatus: (orderId, payload) =>
    apiPatch(`/admin/admin-orders/${orderId}/status`, payload),

  /** GET /admin/admin-products — list products */
  getAdminProducts: () => apiGet('/admin/admin-products'),

  /** POST /admin/add-products — multipart/form-data */
  addProduct: (formData) => apiPostFormData('/admin/add-products', formData),

  /** DELETE /admin/delete-products/:product_id */
  deleteProduct: (productId) => apiDelete(`/admin/delete-products/${productId}`),

  /** PUT /admin/update-products/:product_id — multipart/form-data */
  updateProduct: (productId, formData) =>
    apiPutFormData(`/admin/update-products/${productId}`, formData),

  /** GET /admin/delivery-partners — Bearer admin token */
  getAdminDeliveryPartners: () => apiGet("/admin/delivery-partners"),

  /** POST /admin/create-delivery-partner — JSON { name, phone, email, password } */
  createDeliveryPartner: (payload) => apiPost("/admin/create-delivery-partner", payload),

  /** GET /admin/admin-enquiries — Bearer admin token; product enquiries */
  getAdminEnquiries: () => apiGet("/admin/admin-enquiries"),

  /** GET /admin/contact-messages — Bearer admin token; contact form messages */
  getContactMessages: () => apiGet("/admin/contact-messages"),
};

// ============ CATEGORIES API ============
export const categoriesAPI = {
  // Get all categories
  getAllCategories: () => apiGet('/categories'),
  
  // Get category by ID
  getCategoryById: (categoryId) => apiGet(`/categories/${categoryId}`),
  
  // Create category (admin)
  createCategory: (categoryData) => apiPost('/categories', categoryData),
  
  // Update category (admin)
  updateCategory: (categoryId, categoryData) => apiPut(`/categories/${categoryId}`, categoryData),
  
  // Delete category (admin)
  deleteCategory: (categoryId) => apiDelete(`/categories/${categoryId}`),
};

// ============ PAYMENT API ============
export const paymentAPI = {
  // Initialize payment
  initializePayment: (amount, method) => apiPost('/payments/init', { amount, method }),
  
  // Verify payment
  verifyPayment: (transactionId, signature) => apiPost('/payments/verify', { transactionId, signature }),
  
  // Get payment history
  getPaymentHistory: (userId) => apiGet(`/payments/history/${userId}`),
};

// ============ BLOGS API ============
export const blogsAPI = {
  // Get all blogs
  getAllBlogs: (params = {}) => apiGet('/blogs', { params }),
  
  // Get blog by ID
  getBlogById: (blogId) => apiGet(`/blogs/${blogId}`),
  
  // Create blog (admin)
  createBlog: (blogData) => apiPost('/blogs', blogData),
  
  // Update blog (admin)
  updateBlog: (blogId, blogData) => apiPut(`/blogs/${blogId}`, blogData),
  
  // Delete blog (admin)
  deleteBlog: (blogId) => apiDelete(`/blogs/${blogId}`),
};

// ============ CONTACT API ============
export const contactAPI = {
  // Submit contact form
  submitContactForm: (contactData) => apiPost('/contact', contactData),
};
