import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => useContext(AdminAuthContext);

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token && !isTokenExpired(token)) {
      setAdminToken(token);
    } else if (token) {
      // Token exists but is expired
      logout();
      toast.error('Session expired. Please login again.');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:4000/api/admin/login', {
        email,
        password
      });

      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem('adminToken', token);
        setAdminToken(token);
        navigate('/dashboard');
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
    navigate('/login');
  };

  if (loading) {
    return null;
  }

  return (
    <AdminAuthContext.Provider value={{ adminToken, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
