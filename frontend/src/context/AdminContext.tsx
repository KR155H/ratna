import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Admin {
  id: string;
  adminId: string;
  name: string;
  email: string;
  role: string;
  lastLogin?: string;
}

interface AdminContextType {
  admin: Admin | null;
  token: string | null;
  login: (adminId: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('admin');
    
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (error) {
        console.error('Error parsing stored admin:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (adminId: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🔐 Attempting admin login for:', adminId);
      
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId, password }),
      });

      const data = await response.json();
      console.log('📡 Admin login response:', data);

      if (data.success) {
        setAdmin(data.admin);
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        console.log('✅ Admin login successful');
        return { success: true, message: 'Login successful' };
      } else {
        console.log('❌ Admin login failed:', data.message);
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('❌ Admin login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    console.log('🚪 Admin logged out');
  };

  const value = {
    admin,
    token,
    login,
    logout,
    loading,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};