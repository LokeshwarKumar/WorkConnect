import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      const { accessToken, id, email: userEmail, roles, name } = response.data;
      
      const userData = { id, email: userEmail, role: roles[0], name }; // Assuming single role
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const signup = async (signupData) => {
    try {
      await api.post('/auth/signup', signupData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
