import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Diamond, Bell, Settings, Shield, FileCheck as CheckCircle, Clock, Circle as XCircle, Upload, FileText, AlertCircle, Eye, Calendar, DollarSign, Gem, MessageCircle, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { validateAadhaar, formatAadhaar, maskAadhaar, validateAadhaarWithMessage } from '../utils/verhoeff';

interface Diamond {
  _id: string;
  name: string;
  carat: number;
  cut: string;
  color: string;
  clarity: string;
  price: number;
  description: string;
  image: string;
  status: string;
  views: number;
  createdAt: string;
}

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    diamondId?: string;
    diamondName?: string;
    price?: number;
    adminName?: string;
    reason?: string;
  };
}

interface Verification {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  documentType: string;
  aadhaarNumber: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);
  
  // Verification form state
  const [verificationForm, setVerificationForm] = useState({
    aadhaarNumber: '',
    documentType: 'aadhaar',
    documentNumber: '',
    document: null as File | null
  });
  const [verificationError, setVerificationError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [aadhaarValidation, setAadhaarValidation] = useState({ isValid: false, message: '' });

  // Sold form state
  const [soldForm, setSoldForm] = useState({
    invoiceNumber: '',
    paymentAmount: '',
    invoice: null as File | null,
    paymentProof: null as File | null
  });
  const [soldError, setSoldError] = useState('');
  const [soldLoading, setSoldLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchUserData();
    }
  }, [user, token]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDiamonds(),
        fetchNotifications(),
        fetchVerificationStatus()
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiamonds = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/diamonds/seller/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setDiamonds(data.diamonds);
      }
    } catch (error) {
      console.error('Error fetching diamonds:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/verification/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setVerification(data.verification);
        console.log('✅ Verification status:', data.verification);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatAadhaar(value);
    
    // Limit to 14 characters (12 digits + 2 spaces)
    if (formatted.length <= 14) {
      setVerificationForm(prev => ({ ...prev, aadhaarNumber: formatted }));
      
      // Validate Aadhaar
      const validation = validateAadhaarWithMessage(formatted);
      setAadhaarValidation(validation);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationLoading(true);
    setVerificationError('');

    try {
      // Validate Aadhaar
      const validation = validateAadhaarWithMessage(verificationForm.aadhaarNumber);
      if (!validation.isValid) {
        setVerificationError(validation.message);
        setVerificationLoading(false);
        return;
      }

      if (!verificationForm.document) {
        setVerificationError('Please upload a government document');
        setVerificationLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('aadhaarNumber', verificationForm.aadhaarNumber);
      formData.append('documentType', verificationForm.documentType);
      formData.append('documentNumber', verificationForm.documentNumber);
      formData.append('document', verificationForm.document);

      console.log('📤 Submitting verification with data:', {
        aadhaarNumber: verificationForm.aadhaarNumber,
        documentType: verificationForm.documentType,
        documentNumber: verificationForm.documentNumber,
        hasDocument: !!verificationForm.document
      });

      const response = await fetch('http://localhost:5000/api/verification/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();
      console.log('📡 Verification response:', data);

      if (data.success) {
        setShowVerificationModal(false);
        setVerificationForm({
          aadhaarNumber: '',
          documentType: 'aadhaar',
          documentNumber: '',
          document: null
        });
        await fetchVerificationStatus();
      } else {
        setVerificationError(data.message || 'Failed to submit verification');
      }
    } catch (error) {
      console.error('Verification submission error:', error);
      setVerificationError('Network error. Please try again.');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleMarkSold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiamond) return;

    setSoldLoading(true);
    setSoldError('');

    try {
      if (!soldForm.invoice || !soldForm.paymentProof) {
        setSoldError('Both invoice and payment proof are required');
        setSoldLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('invoiceNumber', soldForm.invoiceNumber);
      formData.append('paymentAmount', soldForm.paymentAmount);
      formData.append('invoice', soldForm.invoice);
      formData.append('paymentProof', soldForm.paymentProof);

      const response = await fetch(`http://localhost:5000/api/diamonds/${selectedDiamond._id}/mark-sold`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setShowSoldModal(false);
        setSoldForm({
          invoiceNumber: '',
          paymentAmount: '',
          invoice: null,
          paymentProof: null
        });
        setSelectedDiamond(null);
        await fetchDiamonds();
      } else {
        setSoldError(data.message || 'Failed to mark diamond as sold');
      }
    } catch (error) {
      console.error('Mark sold error:', error);
      setSoldError('Network error. Please try again.');
    } finally {
      setSoldLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n._id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-accent text-white py-2 px-4 rounded-lg hover:bg-accent-hover transition-colors"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-accent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'seller' ? 'text-green-700 bg-green-100' : 'text-blue-700 bg-blue-100'
                }`}>
                  {user.role === 'seller' ? 'Verified Seller' : 'Member'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-4 border-accent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${
                verification?.status === 'approved' ? 'bg-green-100' :
                verification?.status === 'pending' ? 'bg-yellow-100' :
                verification?.status === 'rejected' ? 'bg-red-100' : 'bg-secondary'
              }`}>
                {verification ? getVerificationIcon(verification.status) : <Shield className="w-5 h-5 text-gray-500" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Identity Verification</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {verification ? (
                    verification.status === 'approved' ? (
                      <span className="text-green-600 font-medium">✅ Your identity has been verified - You can now sell diamonds!</span>
                    ) : verification.status === 'pending' ? (
                      <span className="text-yellow-600 font-medium">⏳ Your verification is under review</span>
                    ) : verification.status === 'rejected' ? (
                      <span className="text-red-600 font-medium">❌ Verification was rejected</span>
                    ) : 'Status unknown'
                  ) : 'Complete verification to sell diamonds'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {verification && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVerificationStatusColor(verification.status)}`}>
                  {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                </span>
              )}
              {!verification && (
                <button
                  onClick={() => user?.role !== 'seller' && setShowVerificationModal(true)}
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Start Verification
                </button>
              )}
            </div>
          </div>
          
          {verification?.status === 'rejected' && verification.rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{verification.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'diamonds', label: 'My Diamonds', icon: Diamond },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(({ id, label, icon: Icon }) => (
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
                  {id === 'notifications' && notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Diamonds</p>
                      <p className="text-2xl font-bold text-blue-900">{diamonds.length}</p>
                    </div>
                    <Diamond className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Active Listings</p>
                      <p className="text-2xl font-bold text-green-900">
                        {diamonds.filter(d => d.status === 'active').length}
                      </p>
                    </div>
                    <Gem className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-secondary p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(diamonds.reduce((sum, d) => sum + d.price, 0))}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-accent" />
                  </div>
                </div>
              </div>
            )}

            {/* Diamonds Tab */}
            {activeTab === 'diamonds' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Diamonds</h2>
                  <button
                    onClick={() => navigate('/sell')}
                    className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    Add New Diamond
                  </button>
                </div>

                {diamonds.length === 0 ? (
                  <div className="text-center py-12">
                    <Diamond className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Diamonds Listed</h3>
                    <p className="text-gray-500 mb-6">Start by adding your first diamond to the marketplace</p>
                    <button
                      onClick={() => navigate('/sell')}
                      className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                    >
                      List Your First Diamond
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {diamonds.map((diamond) => (
                      <div key={diamond._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <img
                          src={diamond.image || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                          alt={diamond.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg';
                          }}
                        />
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{diamond.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              diamond.status === 'active' ? 'bg-green-100 text-green-800' :
                              diamond.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                              diamond.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {diamond.status === 'pending' ? 'Awaiting Verification' : diamond.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                            <div>Carat: <span className="font-medium">{diamond.carat}</span></div>
                            <div>Cut: <span className="font-medium">{diamond.cut}</span></div>
                            <div>Color: <span className="font-medium">{diamond.color}</span></div>
                            <div>Clarity: <span className="font-medium">{diamond.clarity}</span></div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-2xl font-bold text-gray-900">{formatPrice(diamond.price)}</p>
                              <p className="text-sm text-gray-500 flex items-center mt-1">
                                <Eye className="w-4 h-4 mr-1" />
                                {diamond.views} views
                              </p>
                            </div>
                          </div>

                          {diamond.status === 'active' && (
                            <button 
                              onClick={() => {
                                setSelectedDiamond(diamond);
                                setShowSoldModal(true);
                              }}
                              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Mark as Sold
                            </button>
                          )}
                          
                          {diamond.status === 'pending' && (
                            <div className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-center text-sm font-medium">
                              ⏳ Sale Pending Verification
                              <p className="text-xs text-yellow-600 mt-1">Admin is reviewing your sale documents</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('http://localhost:5000/api/notifications/mark-all-read', {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                            },
                          });
                          if (response.ok) {
                            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                          }
                        } catch (error) {
                          console.error('Error marking all as read:', error);
                        }
                      }}
                      className="text-sm text-accent hover:text-accent-hover"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Notifications</h3>
                    <p className="text-gray-500">You'll see notifications here when there are updates</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-6 rounded-xl border transition-all ${
                          notification.isRead 
                            ? 'bg-white border-gray-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-3">{notification.message}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(notification.createdAt)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead && (
                              <button
                                onClick={() => markNotificationAsRead(notification._id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-600">Settings panel coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification Modal */}
        {showVerificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleVerificationSubmit} className="space-y-6">
                  {verificationError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {verificationError}
                    </div>
                  )}

                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">📋 Please provide your Aadhaar number and upload a clear photo of your government ID for verification.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhaar Number *
                    </label>
                    <input
                      type="text"
                      value={verificationForm.aadhaarNumber}
                      onChange={handleAadhaarChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${
                        verificationForm.aadhaarNumber ? (
                          aadhaarValidation.isValid ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                        ) : 'border-gray-300'
                      }`}
                      placeholder="1234 5678 9012"
                      maxLength={14}
                    />
                    {verificationForm.aadhaarNumber && (
                      <p className={`text-sm mt-2 ${aadhaarValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {aadhaarValidation.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Type *
                    </label>
                    <select
                      value={verificationForm.documentType}
                      onChange={(e) => setVerificationForm(prev => ({ ...prev, documentType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                      <option value="voter_id">Voter ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Number *
                    </label>
                    <input
                      type="text"
                      value={verificationForm.documentNumber}
                      onChange={(e) => setVerificationForm(prev => ({ ...prev, documentNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Enter document number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Upload *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload clear photo of your document</p>
                      <input 
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setVerificationForm(prev => ({ ...prev, document: e.target.files?.[0] || null }))}
                        className="hidden"
                        id="document-upload"
                        required
                      />
                      <label
                        htmlFor="document-upload"
                        className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Choose File
                      </label>
                      {verificationForm.document && (
                        <p className="text-sm text-green-600 mt-2">
                          ✅ Selected: {verificationForm.document.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowVerificationModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={verificationLoading || !aadhaarValidation.isValid}
                      className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verificationLoading ? 'Submitting...' : 'Submit Verification'}
                    </button>
                  </div>
                </form>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 text-center">🔒 Your documents are secure and will only be viewed by our verification team.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mark Sold Modal */}
        {showSoldModal && selectedDiamond && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Mark Diamond as Sold</h2>
                  <button
                    onClick={() => setShowSoldModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{selectedDiamond.name}</h3>
                  <p className="text-sm text-gray-600">Listed Price: {formatPrice(selectedDiamond.price)}</p>
                </div>

                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">💎 Upload your invoice and payment proof to complete the sale verification process.</p>
                </div>

                <form onSubmit={handleMarkSold} className="space-y-6">
                  {soldError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {soldError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number *
                    </label>
                    <input
                      type="text"
                      value={soldForm.invoiceNumber}
                      onChange={(e) => setSoldForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Enter invoice number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount *
                    </label>
                    <input
                      type="number"
                      value={soldForm.paymentAmount}
                      onChange={(e) => setSoldForm(prev => ({ ...prev, paymentAmount: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Actual payment received"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Document *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setSoldForm(prev => ({ ...prev, invoice: e.target.files?.[0] || null }))} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Proof *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf" 
                      onChange={(e) => setSoldForm(prev => ({ ...prev, paymentProof: e.target.files?.[0] || null }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowSoldModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={soldLoading}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {soldLoading ? 'Submitting...' : 'Submit Sale'}
                    </button>
                  </div>
                </form>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 text-center">📋 Admin will review your documents and verify the sale. You'll be notified once approved.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;