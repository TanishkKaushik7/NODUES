import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  // ✅ ADDED: Force browser to never cache GET requests
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Content-Type': 'application/json', // <--- This is fine for JSON, but we must unset it for files
  },
});

// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // 1. Get potential tokens
    const studentToken = localStorage.getItem('studentToken');
    const adminToken = localStorage.getItem('token') || localStorage.getItem('access_token');

    // 2. Define Public Endpoints (No Token Needed)
    // These specific routes should NEVER receive an Authorization header
    // or the backend might reject them with 403.
    const publicEndpoints = [
      '/api/auth/login', 
      '/api/students/login', 
      '/api/admin/login',
      '/api/students/register', 
      '/api/captcha/generate'
    ];

    // Check if the current request URL contains any of the public strings
    const isPublic = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    // 3. Attach Token ONLY if NOT a public endpoint
    if (!isPublic) {
      if (studentToken) {
        config.headers.Authorization = `Bearer ${studentToken}`;
      } else if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }

    // ✅ FIX FOR FILE UPLOADS (The 422 Fix)
    // If the data is FormData (file upload), we MUST remove the 'Content-Type' header
    // so the browser can automatically set 'multipart/form-data' with the correct boundary.
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    // Handle Session Expiry (401)
    if (status === 401) {
      const errorMsg = String(detail || "").toLowerCase();
      // Only trigger global logout if it's a genuine expiry, not a bad login attempt
      const isExpired = errorMsg.includes("expired") || errorMsg.includes("login again") || errorMsg.includes("invalid token");

      if (isExpired) {
        // Dispatch event so the UI can show a "Session Expired" modal
        window.dispatchEvent(new Event('session-expired'));
        
        // Clear all possible tokens
        localStorage.removeItem('studentToken');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('studentUser');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;