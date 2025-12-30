import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Eye, Calendar, Diamond, User, Reply, Trash2, Mail, MailOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  receiver: {
    _id: string;
    name: string;
    email: string;
  };
  diamond: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  subject: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  replies: Array<{
    sender: {
      _id: string;
      name: string;
      email: string;
    };
    message: string;
    sentAt: string;
  }>;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedMessage) {
      scrollToBottom();
    }
  }, [selectedMessage?.replies]);

  useEffect(() => {
    if (user && token) {
      fetchMessages();
    }
  }, [user, token, activeTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError('');
      
      const endpoint = activeTab === 'inbox' ? '/api/messages/inbox' : '/api/messages/sent';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
        if (activeTab === 'inbox') {
          setUnreadCount(data.pagination.unreadCount);
        }
      } else {
        setError(data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (message: Message) => {
    try {
      // Fetch full message details
      const response = await fetch(`http://localhost:5000/api/messages/${message._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSelectedMessage(data.message);
        
        // Update local state if message was marked as read
        if (!message.isRead && activeTab === 'inbox') {
          setMessages(prev => prev.map(m => 
            m._id === message._id ? { ...m, isRead: true } : m
          ));
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error fetching message details:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    setReplyLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${selectedMessage._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyText.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedMessage(data.data);
        setReplyText('');
      } else {
        setError(data.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setError('Network error. Please try again.');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
        if (selectedMessage?._id === messageId) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login to view your messages</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Manage your diamond inquiries and conversations</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('inbox')}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                      activeTab === 'inbox'
                        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Inbox</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('sent')}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                      activeTab === 'sent'
                        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Sent</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Messages List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading messages...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No messages found</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      onClick={() => handleMessageClick(message)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedMessage?._id === message._id ? 'bg-blue-50 border-blue-200' : ''
                      } ${
                        !message.isRead && activeTab === 'inbox' ? 'bg-blue-25' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {!message.isRead && activeTab === 'inbox' ? (
                            <MailOpen className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Mail className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium truncate ${
                              !message.isRead && activeTab === 'inbox' ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {activeTab === 'inbox' ? message.sender.name : message.receiver.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(message.createdAt)}
                            </p>
                          </div>
                          <p className={`text-sm truncate ${
                            !message.isRead && activeTab === 'inbox' ? 'text-blue-800' : 'text-gray-600'
                          }`}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {message.diamond.name} - {formatPrice(message.diamond.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Message Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>
                            {activeTab === 'inbox' ? 'From' : 'To'}: {
                              activeTab === 'inbox' ? selectedMessage.sender.name : selectedMessage.receiver.name
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(selectedMessage.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMessage(selectedMessage._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Diamond Info */}
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedMessage.diamond.image || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                        alt={selectedMessage.diamond.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg';
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedMessage.diamond.name}</h3>
                        <p className="text-blue-600 font-bold">{formatPrice(selectedMessage.diamond.price)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50 min-h-[400px] max-h-[600px]">
                  <div className="space-y-6">
                    {/* Original Message */}
                    <div className={`flex flex-col ${selectedMessage.sender._id === user.id ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                        selectedMessage.sender._id === user.id
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 rounded-tl-none'
                      }`}>
                        <div className="flex items-center justify-between mb-1 gap-4">
                          <span className={`text-xs font-semibold ${
                            selectedMessage.sender._id === user.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {selectedMessage.sender.name}
                          </span>
                          <span className={`text-xs ${
                            selectedMessage.sender._id === user.id ? 'text-blue-100' : 'text-gray-400'
                          }`}>
                            {formatDate(selectedMessage.createdAt)}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                    </div>

                    {/* Replies */}
                    {selectedMessage.replies.map((reply, index) => {
                      const isMe = reply.sender._id === user.id;
                      return (
                        <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 rounded-tl-none'
                          }`}>
                            <div className="flex items-center justify-between mb-1 gap-4">
                              <span className={`text-xs font-semibold ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                {reply.sender.name}
                              </span>
                              <span className={`text-xs ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                {formatDate(reply.sentAt)}
                              </span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Reply Form */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <form onSubmit={handleReply} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reply
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        placeholder="Type your reply..."
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={replyLoading || !replyText.trim()}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {replyLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Reply className="w-4 h-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Message</h3>
                <p className="text-gray-500">Choose a message from the list to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;