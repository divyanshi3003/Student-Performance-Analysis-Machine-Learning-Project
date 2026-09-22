import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Mock token bypass for UI testing
    if (token === 'mock_student_token') {
      setUser({ email: 'student@edumetrics.com', role: 'student' });
      setLoading(false);
      return;
    }
    if (token === 'mock_teacher_token') {
      setUser({ email: 'teacher@edumetrics.com', role: 'teacher' });
      setLoading(false);
      return;
    }

    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    // Temporary hardcoded credentials for testing UI
    if (email === 'student@edumetrics.com' && password === 'password123') {
      const mockUser = { email: 'student@edumetrics.com', role: 'student' };
      localStorage.setItem('token', 'mock_student_token');
      localStorage.setItem('role', 'student');
      setUser(mockUser);
      return { access_token: 'mock_student_token', role: 'student' };
    }
    
    if (email === 'teacher@edumetrics.com' && password === 'password123') {
      const mockUser = { email: 'teacher@edumetrics.com', role: 'teacher' };
      localStorage.setItem('token', 'mock_teacher_token');
      localStorage.setItem('role', 'teacher');
      setUser(mockUser);
      return { access_token: 'mock_teacher_token', role: 'teacher' };
    }

    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 expects username
    formData.append('password', password);
    
    const res = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('role', res.data.role);
    
    const userRes = await api.get('/auth/me');
    setUser(userRes.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
