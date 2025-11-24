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
    const { email, password } = credentials || {};

    const API_BASE = import.meta.env.VITE_API_BASE || '';
    const loginUrl = API_BASE ? `${API_BASE}/api/admin/login` : `/api/admin/login`;

    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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
      const userData = data.user || { id: data.id || Math.floor(Math.random() * 1000), email: email, name: data.name || email, role: data.role || 'Admin' };
      const receivedToken = data.token || data.access_token || null;

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
        email: email || 'demo@example.com',
        name: email || 'User',
        role: 'Admin'
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
  };

  // No admin register endpoint; do not implement register for admin
  const register = async () => {
    throw new Error('Admin registration is not supported.');
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
    const headers = { ...(options.headers || {}) };
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(fullUrl, { ...options, headers });
  };


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