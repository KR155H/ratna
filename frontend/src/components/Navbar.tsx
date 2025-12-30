import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Diamond, Menu, X, User, LogOut, ShoppingBag, Gem, Bell, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CurrencySelector from './CurrencySelector';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.pagination.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
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
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleLogout = () => {
    logout();
    setIsNotificationOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: null },
    { path: '/purchase', label: 'Buy Diamonds', icon: ShoppingBag },
    { path: '/sell', label: 'Sell Diamond', icon: Gem },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
    { path: '/contact', label: 'Contact', icon: null },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-accent/95 backdrop-blur-xl shadow-md border-b border-white/10'
        : 'bg-accent/80 backdrop-blur-lg shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white/10 p-2.5 rounded-xl group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 border border-white/20">
                <Diamond className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-tight">
                Ratna
              </span>
              <span className="text-[10px] text-gray-300 font-medium tracking-[0.2em] uppercase">Premium Diamonds</span>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`group relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(path)
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2 relative z-10">
                  {Icon && <Icon className={`w-4 h-4 ${isActive(path) ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors duration-300`} />}
                  <span className={isActive(path) ? 'text-white' : ''}>{label}</span>
                </div>
                {isActive(path) && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-b-lg"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Enhanced User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Currency Selector */}
            <div className="text-white">
              <CurrencySelector />
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-accent rounded-xl shadow-2xl border border-gray-700 py-2 transform transition-all duration-300 scale-100 opacity-100 z-50">
                      <div className="px-6 py-4 border-b border-gray-700 bg-accent">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-white">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="bg-secondary text-accent text-xs font-bold px-2 py-1 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              className={`px-6 py-4 border-b border-gray-700 hover:bg-white/5 transition-colors cursor-pointer ${
                                !notification.isRead ? 'bg-white/5' : ''
                              }`}
                              onClick={() => {
                                if (!notification.isRead) {
                                  markAsRead(notification._id);
                                }
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  !notification.isRead ? 'bg-white' : 'bg-gray-600'
                                }`}></div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-white mb-1">
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(notification.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-6 py-8 text-center">
                            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      
                      {notifications.length > 0 && (
                        <div className="px-6 py-3 border-t border-gray-700">
                          <Link
                            to="/profile"
                            onClick={() => setIsNotificationOpen(false)}
                            className="text-sm text-gray-300 hover:text-white font-medium"
                          >
                            View all notifications →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-bold text-white">{user.name}</p>
                      <p className="text-xs text-gray-300 uppercase tracking-wider">Premium</p>
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-accent rounded-xl shadow-2xl border border-gray-700 py-2 transform transition-all duration-300 scale-100 opacity-100">
                      <div className="px-6 py-4 border-b border-gray-700">
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      
                <Link
                  to="/profile"
                  className="flex items-center px-6 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors group"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors" />
                  <div>
                    <p className="font-medium">My Profile</p>
                    <p className="text-xs text-gray-500">View account & diamonds</p>
                  </div>
                </Link>
                
                      <Link
                        to="/sell"
                        className="flex items-center px-6 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Gem className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors" />
                        <div>
                          <p className="font-medium">Sell Diamond</p>
                          <p className="text-xs text-gray-500">List your precious stones</p>
                        </div>
                      </Link>
                      
                      <div className="border-t border-gray-700 mt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-6 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors group"
                        >
                          <LogOut className="w-5 h-5 mr-3 group-hover:text-red-400 transition-colors" />
                          <div className="text-left">
                            <p className="font-medium">Sign Out</p>
                            <p className="text-xs text-gray-500">Logout from account</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-6 py-2 text-sm font-semibold text-white hover:text-gray-300 transition-colors relative group"
                >
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="group relative px-6 py-2.5 bg-secondary text-accent text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-white/10 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10">Join Ratna</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 bg-accent/95 backdrop-blur-lg">
            <div className="px-4 py-6 space-y-3">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isActive(path)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span>{label}</span>
                </Link>
              ))}
              
              {user ? (
                <div className="pt-4 border-t border-gray-700 space-y-3">
                  {/* Mobile Notifications */}
                  <div className="px-4 py-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="bg-secondary text-accent text-xs font-bold px-2 py-1 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 ? (
                      <div className="space-y-2">
                        {notifications.slice(0, 2).map((notification) => (
                          <div key={notification._id} className="text-xs text-gray-400">
                            <p className="font-medium text-gray-200">{notification.title}</p>
                            <p className="truncate">{notification.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No new notifications</p>
                    )}
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded-lg border border-white/5"
                  >
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">View Profile</p>
                    </div>
                  </Link>
                  
                  <Link
                    to="/sell"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors rounded-lg"
                  >
                    <Gem className="w-5 h-5" />
                    <span>Sell Diamond</span>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-700 space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold text-center text-white hover:text-gray-300 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block mx-4 px-6 py-3 bg-secondary text-accent text-sm font-bold rounded-lg text-center shadow-lg"
                  >
                    Join Ratna
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;