import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = {
          id: Math.floor(Math.random() * 1000),
          username: credentials.username,
          role: credentials.role,
          name: credentials.role === 'admin' ? 'Administrator' : 
                credentials.role === 'faculty' ? 'Professor Singh' :
                credentials.role === 'office' ? 'Office Manager' :
                credentials.role === 'exam' ? 'Exam Coordinator' :
                'Accounts Officer'
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        resolve(userData);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};