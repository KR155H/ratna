import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { admin, login } = useAdmin();
  const [formData, setFormData] = useState({
    adminId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard');
    }
  }, [admin, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.adminId, formData.password);
      
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="bg-gray-100 p-3 rounded-full">
                <Shield className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Admin Access</h2>
            <p className="mt-2 text-gray-600">Secure administrative portal</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="adminId"
                    name="adminId"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.adminId}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                    placeholder="Enter admin ID"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Access Admin Panel
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Main Site
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-2">Default Admin Credentials:</p>
              <p className="text-xs text-gray-600">ID: <code className="bg-gray-200 px-1 rounded">admin</code></p>
              <p className="text-xs text-gray-600">Password: <code className="bg-gray-200 px-1 rounded">admin123</code></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;