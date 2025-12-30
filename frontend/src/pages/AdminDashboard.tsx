import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Diamond, Mail, CheckCircle2 as CheckCircle, Clock, Circle as XCircle, Eye, FileText, Download, Trash2, LogOut, BarChart3, TrendingUp, DollarSign, AlertCircle, User, Calendar, MessageCircle, Settings, Bell, Search, Filter, RefreshCw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface DashboardStats {
  totalUsers: number;
  totalDiamonds: number;
  totalContacts: number;
  totalVerifications: number;
  pendingVerifications: number;
  totalValue: number;
  averagePrice: number;
  recentUsers: any[];
  recentDiamonds: any[];
  recentContacts: any[];
  recentVerifications: any[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Diamond {
  _id: string;
  name: string;
  carat: number;
  cut: string;
  color: string;
  clarity: string;
  price: number;
  status: string;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Verification {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  aadhaarNumber: string;
  documentType: string;
  documentNumber: string;
  documentPath: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface DiamondSale {
  _id: string;
  diamond: {
    _id: string;
    name: string;
    carat: number;
    cut: string;
    color: string;
    clarity: string;
    price: number;
    image: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  invoiceNumber: string;
  paymentAmount: number;
  invoiceDocument: string;
  paymentProof: string;
  status: string;
  submittedAt: string;
  verifiedAt?: string;
  documentsViewed: boolean;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { admin, token, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [diamondSales, setDiamondSales] = useState<DiamondSale[]>([]);
  
  // Modal states
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [selectedSale, setSelectedSale] = useState<DiamondSale | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!admin || !token) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [admin, token, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchDiamonds(),
        fetchContacts(),
        fetchVerifications(),
        fetchDiamondSales()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDiamonds = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/diamonds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDiamonds(data.diamonds);
      }
    } catch (error) {
      console.error('Error fetching diamonds:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchVerifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/verifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setVerifications(data.verifications);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    }
  };

  const fetchDiamondSales = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/sales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDiamondSales(data.sales);
      }
    } catch (error) {
      console.error('Error fetching diamond sales:', error);
    }
  };

  const handleVerificationAction = async (verificationId: string, status: 'approved' | 'rejected') => {
    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/verifications/${verificationId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setSelectedVerification(null);
        setRejectionReason('');
        await fetchVerifications();
        await fetchStats();
      } else {
        setError(data.message || 'Failed to update verification');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      setError('Failed to update verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaleAction = async (saleId: string, status: 'verified' | 'rejected') => {
    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/sales/${saleId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setSelectedSale(null);
        setRejectionReason('');
        await fetchDiamondSales();
        await fetchStats();
      } else {
        setError(data.message || 'Failed to update sale');
      }
    } catch (error) {
      console.error('Error updating sale:', error);
      setError('Failed to update sale');
    } finally {
      setActionLoading(false);
    }
  };

  const markSaleDocumentsViewed = async (saleId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/sales/${saleId}/mark-viewed`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchDiamondSales();
      }
    } catch (error) {
      console.error('Error marking documents as viewed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'inactive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please login to access the admin dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-accent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">Ratna Diamond Marketplace</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                  <p className="text-xs text-gray-600">{admin.role}</p>
                </div>
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'diamonds', label: 'Diamonds', icon: Diamond },
                { id: 'contacts', label: 'Contacts', icon: Mail },
                { 
                  id: 'verifications', 
                  label: 'Verifications', 
                  icon: CheckCircle,
                  badge: verifications.filter(v => v.status === 'pending').length
                },
                { 
                  id: 'sales', 
                  label: 'Diamond Sales', 
                  icon: DollarSign,
                  badge: diamondSales.filter(s => s.status === 'pending').length
                }
              ].map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                  {badge && badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Total Users</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-600 text-sm font-medium">Total Diamonds</p>
                        <p className="text-2xl font-bold text-amber-900">{stats.totalDiamonds}</p>
                      </div>
                      <Diamond className="w-8 h-8 text-amber-500" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Total Value</p>
                        <p className="text-2xl font-bold text-green-900">{formatPrice(stats.totalValue)}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Pending Verifications</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.pendingVerifications}</p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                    <div className="space-y-3">
                      {stats.recentUsers.map((user) => (
                        <div key={user._id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Diamonds</h3>
                    <div className="space-y-3">
                      {stats.recentDiamonds.map((diamond) => (
                        <div key={diamond._id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{diamond.name}</p>
                            <p className="text-sm text-gray-600">{diamond.carat} carat, {diamond.cut}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatPrice(diamond.price)}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(diamond.status)}`}>
                              {diamond.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
                  <button
                    onClick={fetchUsers}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isVerified ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                              }`}>
                                {user.isVerified ? 'Verified' : 'Not Verified'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Diamonds Tab */}
            {activeTab === 'diamonds' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Diamonds Management</h2>
                  <button
                    onClick={fetchDiamonds}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamond</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specifications</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listed</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {diamonds.map((diamond) => (
                          <tr key={diamond._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{diamond.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {diamond.carat}ct, {diamond.cut}, {diamond.color}, {diamond.clarity}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{formatPrice(diamond.price)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{diamond.seller.name}</div>
                              <div className="text-sm text-gray-500">{diamond.seller.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(diamond.status)}`}>
                                {diamond.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(diamond.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
                  <button
                    onClick={fetchContacts}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contacts.map((contact) => (
                          <tr key={contact._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                <div className="text-sm text-gray-500">{contact.email}</div>
                                {contact.phone && <div className="text-sm text-gray-500">{contact.phone}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{contact.subject}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">{contact.message}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                                {contact.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(contact.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Verifications Tab */}
            {activeTab === 'verifications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Verifications</h2>
                  <button
                    onClick={fetchVerifications}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {verifications.map((verification) => (
                          <tr key={verification._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{verification.user?.name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{verification.user?.email || 'N/A'}</div>
                                {verification.user?.phone && <div className="text-sm text-gray-500">{verification.user.phone}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm text-gray-900">{verification.documentType}</div>
                                <div className="text-sm text-gray-500">{verification.documentNumber}</div>
                                <div className="text-sm text-gray-500">Aadhaar: ****{verification.aadhaarNumber.slice(-4)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(verification.status)}`}>
                                {getStatusIcon(verification.status)}
                                <span className="ml-1">{verification.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(verification.submittedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedVerification(verification)}
                                className="flex items-center space-x-1 px-3 py-1 bg-accent text-white text-sm rounded-lg hover:bg-accent-hover transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Review</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Diamond Sales Tab */}
            {activeTab === 'sales' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Diamond Sales</h2>
                  <button
                    onClick={fetchDiamondSales}
                    className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diamond</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {diamondSales.map((sale) => (
                          <tr key={sale._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={sale.diamond.image || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                                  alt={sale.diamond.name}
                                  className="w-10 h-10 rounded-lg object-cover mr-3"
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{sale.diamond.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {sale.diamond.carat}ct, {sale.diamond.cut}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{sale.seller.name}</div>
                                <div className="text-sm text-gray-500">{sale.seller.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm text-gray-900">Invoice: {sale.invoiceNumber}</div>
                                <div className="text-sm font-medium text-gray-900">{formatPrice(sale.paymentAmount)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                                {getStatusIcon(sale.status)}
                                <span className="ml-1">{sale.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(sale.submittedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedSale(sale)}
                                className="flex items-center space-x-1 px-3 py-1 bg-accent text-white text-sm rounded-lg hover:bg-accent-hover transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Review</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification Review Modal */}
        {selectedVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review Verification</h2>
                  <button
                    onClick={() => setSelectedVerification(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* User Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900">{selectedVerification.user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedVerification.user.email}</p>
                      </div>
                      {selectedVerification.user.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Phone</label>
                          <p className="text-gray-900">{selectedVerification.user.phone}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Document Type</label>
                        <p className="text-gray-900">{selectedVerification.documentType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Document Number</label>
                        <p className="text-gray-900">{selectedVerification.documentNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Aadhaar Number</label>
                        <p className="text-gray-900">****-****-{selectedVerification.aadhaarNumber.slice(-4)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Submitted</label>
                        <p className="text-gray-900">{formatDate(selectedVerification.submittedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Document Image */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Document</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={selectedVerification.documentPath}
                        alt="Verification Document"
                        className="w-full h-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxNzVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QjlCIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkRvY3VtZW50IG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {selectedVerification.status === 'pending' && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason (if rejecting)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                          placeholder="Enter reason for rejection..."
                        />
                      </div>

                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleVerificationAction(selectedVerification._id, 'approved')}
                          disabled={actionLoading}
                          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Approve</span>
                        </button>
                        
                        <button
                          onClick={() => handleVerificationAction(selectedVerification._id, 'rejected')}
                          disabled={actionLoading || !rejectionReason.trim()}
                          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-5 h-5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedVerification.status === 'rejected' && selectedVerification.rejectionReason && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Rejection Reason</h3>
                    <p className="text-gray-700 bg-red-50 p-4 rounded-lg">{selectedVerification.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Diamond Sale Review Modal */}
        {selectedSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review Diamond Sale</h2>
                  <button
                    onClick={() => setSelectedSale(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Sale Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sale Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Diamond</label>
                        <p className="text-gray-900">{selectedSale.diamond.name}</p>
                        <p className="text-sm text-gray-600">
                          {selectedSale.diamond.carat}ct, {selectedSale.diamond.cut}, {selectedSale.diamond.color}, {selectedSale.diamond.clarity}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Listed Price</label>
                        <p className="text-gray-900">{formatPrice(selectedSale.diamond.price)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Seller</label>
                        <p className="text-gray-900">{selectedSale.seller.name}</p>
                        <p className="text-sm text-gray-600">{selectedSale.seller.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Invoice Number</label>
                        <p className="text-gray-900">{selectedSale.invoiceNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Payment Amount</label>
                        <p className="text-gray-900 font-bold text-lg">{formatPrice(selectedSale.paymentAmount)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Submitted</label>
                        <p className="text-gray-900">{formatDate(selectedSale.submittedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sale Documents</h3>
                    
                    {!selectedSale.documentsViewed ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Invoice Document */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Invoice Document</h4>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={selectedSale.invoiceDocument}
                              alt="Invoice Document"
                              className="w-full h-auto"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxNzVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QjlCIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkludm9pY2UgRG9jdW1lbnQ8L3RleHQ+Cjwvc3ZnPgo=';
                              }}
                            />
                          </div>
                        </div>

                        {/* Payment Proof */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Payment Proof</h4>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={selectedSale.paymentProof}
                              alt="Payment Proof"
                              className="w-full h-auto"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxNzVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QjlCIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPlBheW1lbnQgUHJvb2Y8L3RleHQ+Cjwvc3ZnPgo=';
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">Documents have been viewed and deleted for security</p>
                        <p className="text-sm text-gray-500 mt-1">Invoice and payment details are preserved</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedSale.status === 'pending' && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason (if rejecting)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                          placeholder="Enter reason for rejection..."
                        />
                      </div>

                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            markSaleDocumentsViewed(selectedSale._id);
                            handleSaleAction(selectedSale._id, 'verified');
                          }}
                          disabled={actionLoading}
                          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Verify Sale</span>
                        </button>
                        
                        <button
                          onClick={() => handleSaleAction(selectedSale._id, 'rejected')}
                          disabled={actionLoading || !rejectionReason.trim()}
                          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-5 h-5" />
                          <span>Reject Sale</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;