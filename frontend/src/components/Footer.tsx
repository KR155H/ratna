import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Diamond, Mail, Phone, MapPin, Facebook, Twitter, Instagram, 
  Linkedin, Youtube, Heart, ArrowUp, Send, Star
} from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-500' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-500' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-600' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-500' },
  ];

  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/purchase', label: 'Buy Diamonds' },
    { to: '/sell', label: 'Sell Diamond' },
    { to: '/contact', label: 'Contact Us' },
  ];

  const services = [
    { href: '#', label: 'Diamond Appraisal' },
    { href: '#', label: 'Custom Jewelry' },
    { href: '#', label: 'Investment Consulting' },
    { href: '#', label: 'Authentication' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 p-2 rounded-xl shadow-xl">
                    <Diamond className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    Ratna
                  </span>
                  <p className="text-xs text-gray-400 font-medium tracking-wider">PREMIUM DIAMONDS</p>
                </div>
              </Link>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                Discover the world's finest diamonds at Ratna. We connect discerning buyers with premium diamond sellers worldwide.
              </p>
              
              <div className="flex space-x-3">
                {socialLinks.map(({ icon: Icon, href, label, color }, index) => (
                  <a 
                    key={index}
                    href={href} 
                    className={`group p-2 bg-gray-800 rounded-lg ${color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-amber-400">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map(({ to, label }, index) => (
                  <li key={index}>
                    <Link 
                      to={to} 
                      className="group flex items-center text-gray-300 hover:text-amber-400 transition-all duration-300 py-1"
                    >
                      <div className="w-1 h-1 bg-amber-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="group-hover:translate-x-1 transition-transform duration-300 text-sm">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-amber-400">Our Services</h3>
              <ul className="space-y-2">
                {services.map(({ href, label }, index) => (
                  <li key={index}>
                    <a 
                      href={href} 
                      className="group flex items-center text-gray-300 hover:text-amber-400 transition-all duration-300 py-1"
                    >
                      <Star className="w-3 h-3 mr-3 group-hover:text-amber-500 transition-colors" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300 text-sm">{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-amber-400">Stay Connected</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300 text-sm">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300 text-sm">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>info@ratna.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300 text-sm">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>New York, NY</span>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Newsletter</h4>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-r-lg hover:shadow-lg transition-all duration-300">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                &copy; 2024 Ratna Diamond Marketplace. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Built with <Heart className="w-3 h-3 inline text-red-500" /> for diamond enthusiasts worldwide
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex space-x-4">
                <a href="#" className="text-xs text-gray-400 hover:text-amber-400 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-xs text-gray-400 hover:text-amber-400 transition-colors">
                  Terms of Service
                </a>
              </div>
              
              <button
                onClick={scrollToTop}
                className="group p-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              >
                <ArrowUp className="w-4 h-4 text-white group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;