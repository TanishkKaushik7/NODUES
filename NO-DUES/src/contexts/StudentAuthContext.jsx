import { createContext, useState, useContext, useEffect } from 'react';

const StudentAuthContext = createContext();

export const useStudentAuth = () => useContext(StudentAuthContext);

export const StudentAuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('studentUser');
    const storedToken = localStorage.getItem('studentToken');
    if (stored) setStudent(JSON.parse(stored));
    if (storedToken) setToken(storedToken);
    setLoading(false);
  }, []);

  const login = async ({ identifier, password }) => {
    // normalize base to avoid accidental double slashes when env includes a trailing '/'
    const rawBase = import.meta.env.VITE_API_BASE || '';
    const API_BASE = rawBase.replace(/\/+$/g, '');
    const url = API_BASE ? `${API_BASE}/api/students/login` : `/api/students/login`;
    try {
      // log request details (no password) to help debug Method Not Allowed / endpoint issues
      console.debug('Student login request ->', { url, method: 'POST', body: { identifier } });
      let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      // if server rejects POST with 405, try trailing-slash fallback once (some servers require it)
      if (response.status === 405) {
        console.debug('Student login received 405, retrying with trailing slash');
        const altUrl = url.endsWith('/') ? url : `${url}/`;
        try {
          const res2 = await fetch(altUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
          });
          if (res2.ok) {
            const data2 = await res2.json();
            const userData2 = data2.user || data2;
            const receivedToken2 = data2.token || null;
            setStudent(userData2);
            if (receivedToken2) setToken(receivedToken2);
            localStorage.setItem('studentUser', JSON.stringify(userData2));
            if (receivedToken2) localStorage.setItem('studentToken', receivedToken2);
            return userData2;
          }
          // if alt also fails, proceed to parse below and throw
          response = res2; // fall through to error handling
        } catch (e) {
          console.debug('Trailing-slash retry failed:', e);
          // continue to parse original response below
        }
      }
      if (!response.ok) {
        let body = null;
        try {
          // try parsing json, fallback to text
          body = await response.json();
        } catch (e) {
          try { body = await response.text(); } catch (e2) { body = null; }
        }
        console.debug('Student login failed response:', response.status, body);
        // prefer string messages, fall back to stringified body
        const candidate = body && (body.message || body.detail || body.error) ? (body.message || body.detail || body.error) : null;
        const msg = candidate && typeof candidate === 'string' ? candidate : (body ? (typeof body === 'string' ? body : JSON.stringify(body)) : `HTTP ${res.status}`);
        throw new Error(msg || res.statusText);
      }
      const data = await response.json();
      const userData = data.user || data;
      const receivedToken = data.token || null;
      setStudent(userData);
      if (receivedToken) setToken(receivedToken);
      localStorage.setItem('studentUser', JSON.stringify(userData));
      if (receivedToken) localStorage.setItem('studentToken', receivedToken);
      return userData;
    } catch (err) {
      console.warn('Student login error (raw):', err);
      // Normalize thrown errors to Error instances with useful messages
      if (err instanceof Error) throw err;
      try {
        throw new Error(typeof err === 'object' ? JSON.stringify(err) : String(err));
      } catch (e) {
        throw new Error('Student login failed');
      }
    }
  };

  // Try to fetch a student's profile from backend using common endpoints.
  // This does not perform login; it only attempts to retrieve a readable profile
  // that can be used to autofill forms. It will try `/me` (with token) and
  // several identifier-based GET endpoints.
  const fetchProfile = async (identifier) => {
    const rawBase = import.meta.env.VITE_API_BASE || '';
    const API_BASE = rawBase.replace(/\/+$/g, '');
    const candidates = [];
    if (API_BASE) {
      // try token-based 'me' endpoint first if token present
      if (token) candidates.push({ url: `${API_BASE}/api/students/me`, opts: { headers: { 'Authorization': `Bearer ${token}` } } });
      // common identifier-based endpoints
      if (identifier) {
        candidates.push({ url: `${API_BASE}/api/students/${encodeURIComponent(identifier)}` });
        candidates.push({ url: `${API_BASE}/api/students/profile?identifier=${encodeURIComponent(identifier)}` });
        candidates.push({ url: `${API_BASE}/api/students?identifier=${encodeURIComponent(identifier)}` });
      }
      // fallback: profile path without /api prefix
      if (identifier) candidates.push({ url: `${API_BASE}/students/${encodeURIComponent(identifier)}` });
    } else {
      // same-local endpoints when running without API_BASE
      if (token) candidates.push({ url: `/api/students/me`, opts: { headers: { 'Authorization': `Bearer ${token}` } } });
      if (identifier) {
        candidates.push({ url: `/api/students/${encodeURIComponent(identifier)}` });
        candidates.push({ url: `/api/students/profile?identifier=${encodeURIComponent(identifier)}` });
        candidates.push({ url: `/api/students?identifier=${encodeURIComponent(identifier)}` });
      }
    }

    for (const c of candidates) {
      try {
        const res = await fetch(c.url, { method: 'GET', ...(c.opts || {}) });
        if (!res.ok) continue;
        let body = null;
        try { body = await res.json(); } catch (e) { continue; }
        // prefer nested user/student objects, else body itself
        const user = body.user || body.student || body;
        // basic heuristic: require an enrollment_number or full_name to accept
        if (user && (user.enrollment_number || user.full_name || user.email)) {
          setStudent(user);
          try { localStorage.setItem('studentUser', JSON.stringify(user)); } catch (e) { /* ignore */ }
          return user;
        }
      } catch (e) {
        // ignore and try next candidate
        console.debug('fetchProfile candidate failed:', c.url, e);
      }
    }
    return null;
  };

  const register = async (payload) => {
    const rawBase = import.meta.env.VITE_API_BASE || '';
    const API_BASE = rawBase.replace(/\/+$/g, '');
    const url = API_BASE ? `${API_BASE}/api/students/register` : `/api/students/register`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let body = null;
        try { body = await res.json(); } catch (e) { /* ignore */ }
        console.debug('Student register failed response:', res.status, body);
        const candidate = body && (body.message || body.detail || body.error) ? (body.message || body.detail || body.error) : null;
        const msg = candidate && typeof candidate === 'string' ? candidate : (body ? JSON.stringify(body) : `HTTP ${res.status}`);
        throw new Error(msg || res.statusText);
      }
      const data = await res.json();
      // If backend returns created user or token, persist them so dashboard can autofill immediately
      const userData = data.user || data.student || data || null;
      const receivedToken = data.token || data.access_token || null;
      if (userData) {
        // store raw backend object so components that map snake_case keys keep working
        setStudent(userData);
        localStorage.setItem('studentUser', JSON.stringify(userData));
      }
      if (receivedToken) {
        setToken(receivedToken);
        localStorage.setItem('studentToken', receivedToken);
      }
      // If backend didn't return user data, try to fetch profile using identifier from payload
      if (!userData) {
        try {
          const id = payload.enrollment_number || payload.roll_number || payload.identifier || payload.email;
          if (id) {
            const fetched = await fetchProfile(id);
            if (fetched) {
              // optionally prefer server-provided token if any
            }
          }
        } catch (e) {
          console.debug('fetchProfile after register failed:', e);
        }
      }
      return data;
    } catch (err) {
      console.warn('Student register error (raw):', err);
      if (err instanceof Error) throw err;
      try {
        throw new Error(typeof err === 'object' ? JSON.stringify(err) : String(err));
      } catch (e) {
        throw new Error('Student registration failed');
      }
    }
  };

  const logout = () => {
    setStudent(null);
    setToken(null);
    localStorage.removeItem('studentUser');
    localStorage.removeItem('studentToken');
  };

  const value = { student, token, loading, login, register, logout };

  return (
    <StudentAuthContext.Provider value={value}>
      {!loading && children}
    </StudentAuthContext.Provider>
  );
};

export default StudentAuthContext;
