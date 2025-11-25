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

      // Persist immediate values
      setUser(userData);
      if (receivedToken) setToken(receivedToken);

      localStorage.setItem('user', JSON.stringify(userData));
      if (receivedToken) localStorage.setItem('token', receivedToken);

      // If we have a token, attempt to fetch authoritative profile info
      // Try common profile endpoints so we can discover role/department
      if (receivedToken) {
        try {
          const API_BASE = import.meta.env.VITE_API_BASE || '';
          const tryUrls = ['/api/users/me', '/api/admin/me', '/api/profile', '/api/me'];
          let profile = null;
          for (const p of tryUrls) {
            const url = API_BASE ? `${API_BASE}${p}` : p;
            try {
              const profRes = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${receivedToken}`
                }
              });
              if (!profRes.ok) continue;
              const profJson = await profRes.json();
              // Backends may return { user: {...} } or direct user object
              profile = profJson.user || profJson;
              if (profile) break;
            } catch (e) {
              // ignore and try next
            }
          }

          if (profile) {
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
            return { user: profile, token: receivedToken };
          }
        } catch (e) {
          // ignore profile fetch errors and fall back to token-provided userData
        }
      }

      return { user: userData, token: receivedToken };
    } catch (err) {
      // Propagate errors to the caller so the UI can show backend messages
      // (Do not fall back to a mock user on invalid credentials.)
      console.warn('Login error:', err?.message || err);
      throw err;
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