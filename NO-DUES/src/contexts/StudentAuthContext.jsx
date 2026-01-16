import { createContext, useState, useContext, useEffect, useCallback } from 'react';

export const StudentAuthContext = createContext();

export const useStudentAuth = () => useContext(StudentAuthContext);

export const StudentAuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [studentToken, setStudentToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync state with localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const stored = localStorage.getItem('studentUser');
      const storedToken = localStorage.getItem('studentToken');
      
      if (stored && stored !== "undefined") {
        try {
          setStudent(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored user", e);
          localStorage.removeItem('studentUser');
        }
      }
      
      if (storedToken) setStudentToken(storedToken);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Helper to build API URLs
  const getUrl = useCallback((path) => {
    const rawBase = import.meta.env.VITE_API_BASE || '';
    const API_BASE = rawBase.replace(/\/+$/g, '');
    return API_BASE ? `${API_BASE}${path}` : path;
  }, []);

  /**
   * ✅ LOGIN LOGIC
   * Sends identifier, password, captcha_input, captcha_hash, AND captcha_ts
   */
  const login = async ({ identifier, password, captcha_input, captcha_hash, captcha_ts }) => {
    const url = getUrl('/api/students/login');
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        credentials: 'include', 
        body: JSON.stringify({ 
          identifier, 
          password, 
          captcha_input, 
          captcha_hash,
          captcha_ts // ✅ ADDED: Timestamp is now sent to the backend
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let message = 'Login failed';
        if (data.detail) {
          message = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        }
        
        const error = new Error(message);
        error.isCaptchaError = message.toLowerCase().includes("captcha");
        throw error;
      }

      const userData = data.student || data.user || data;
      const receivedToken = data.access_token || data.token || data.accessToken;

      setStudent(userData);
      setStudentToken(receivedToken);
      
      localStorage.setItem('studentUser', JSON.stringify(userData));
      if (receivedToken) {
        localStorage.setItem('studentToken', receivedToken);
      }

      return userData;
    } catch (err) {
      console.error('AuthContext Login Error:', err.message);
      throw err;
    }
  };

  /**
   * ✅ REGISTER LOGIC
   * Payload already contains captcha_input, captcha_hash, and captcha_ts from the form component
   */
  const register = async (payload) => {
    const url = getUrl('/api/students/register');
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        credentials: 'include',
        // Payload object passed from Register component must include captcha_ts
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        let message = 'Registration failed';
        if (data.detail) {
          message = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        }
        
        const error = new Error(message);
        error.isCaptchaError = message.toLowerCase().includes("captcha");
        throw error;
      }

      const userData = data.student || data.user || data;
      const receivedToken = data.access_token || data.token || data.accessToken;

      // Update local state if the backend returns a session/token on registration
      if (userData) {
        setStudent(userData);
        localStorage.setItem('studentUser', JSON.stringify(userData));
      }
      if (receivedToken) {
        setStudentToken(receivedToken);
        localStorage.setItem('studentToken', receivedToken);
      }

      return data;
    } catch (err) {
      console.error('AuthContext Register Error:', err.message);
      throw err;
    }
  };

  const logout = useCallback(() => {
    setStudent(null);
    setStudentToken(null);
    localStorage.removeItem('studentUser');
    localStorage.removeItem('studentToken');
  }, []);

  const value = { 
    student, 
    token: studentToken, 
    loading, 
    login, 
    register, 
    logout 
  };

  return (
    <StudentAuthContext.Provider value={value}>
      {!loading && children}
    </StudentAuthContext.Provider>
  );
};

export default StudentAuthProvider;