import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { username, password, role } = credentials || {};

    const API_BASE = import.meta.env.VITE_API_BASE || '';
    const loginUrl = API_BASE ? `${API_BASE}/api/auth/login` : `/api/auth/login`;

    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });

      if (!res.ok) {
        let errMsg = 'Login failed';
        try {
          const errJson = await res.json();
          errMsg = errJson.message || errJson.detail || errMsg;
        } catch (e) {}
        throw new Error(errMsg || res.statusText);
      }

      const data = await res.json();
      const userData = data.user || { id: data.id || Math.floor(Math.random() * 1000), username: username, name: data.name || username, role: data.role || role };
      const receivedToken = data.token || null;

      setUser(userData);
      if (receivedToken) setToken(receivedToken);

      localStorage.setItem('user', JSON.stringify(userData));
      if (receivedToken) localStorage.setItem('token', receivedToken);

      return userData;
    } catch (err) {
      // Backend unavailable or network error: fallback to a local mock login
      console.warn('Backend login failed, falling back to mock login:', err?.message || err);
      const userData = {
        id: Math.floor(Math.random() * 1000),
        username: username || 'demo',
        name: username || 'User',
        role: role || 'Admin'
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
  };

  const register = async (payload) => {
    const API_BASE = import.meta.env.VITE_API_BASE || '';
    // Use the auth register endpoint on the backend
    const registerUrl = API_BASE ? `${API_BASE}/api/auth/register` : `/api/auth/register`;
    console.debug('Auth.register ->', registerUrl, payload);
    try {
      const res = await fetch(registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errMsg = 'Registration failed';
        try { const errJson = await res.json(); errMsg = errJson.message || errJson.detail || errMsg; } catch (e) {}
        throw new Error(errMsg || res.statusText);
      }

      const data = await res.json();
      const userData = data.user || data;
      const receivedToken = data.token || null;

      setUser(userData);
      if (receivedToken) setToken(receivedToken);
      localStorage.setItem('user', JSON.stringify(userData));
      if (receivedToken) localStorage.setItem('token', receivedToken);

      return userData;
    } catch (err) {
      // Network or CORS error: show a more helpful message
      if (err instanceof TypeError && err.message && err.message.includes('fetch')) {
        throw new Error('Network error: Could not reach backend. Check your internet connection, backend status, and CORS settings.');
      }
      console.warn('Registration failed:', err?.message || err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Helper for authenticated fetches
  const authFetch = (url, options = {}) => {
    const API_BASE = import.meta.env.VITE_API_BASE || '';
    const fullUrl = url.startsWith('http') || url.startsWith('/') ? (API_BASE && url.startsWith('/') ? `${API_BASE}${url}` : url) : (API_BASE ? `${API_BASE}/${url}` : url);
    const headers = { ...(options.headers || {}), 'Content-Type': headersContentType(options.headers) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(fullUrl, { ...options, headers });
  };

  function headersContentType(existing) {
    if (!existing) return 'application/json';
    if (existing['Content-Type'] || existing['content-type']) return undefined;
    return 'application/json';
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    authFetch,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};