import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Diamond, Star, Users, Shield, Award, ArrowRight, Eye, Heart, TrendingUp, CheckCircle, Sparkles, Scissors, Palette, Scale, Search, Quote, Mail } from 'lucide-react';
import { RoundDiamond, PrincessDiamond, EmeraldDiamond, PearDiamond, OvalDiamond, HeartDiamond } from '../components/DiamondShapes';
import { useCurrency } from '../context/CurrencyContext';

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
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  sellerName: string;
  status: string;
  views: number;
  createdAt: string;
}

const Home: React.FC = () => {
  const [featuredDiamonds, setFeaturedDiamonds] = useState<Diamond[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDiamonds: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchFeaturedDiamonds();
    fetchStats();
  }, []);

  const fetchFeaturedDiamonds = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/diamonds?limit=6&sort=createdAt&order=desc');
      const data = await response.json();
      
      if (data.success) {
        setFeaturedDiamonds(data.diamonds || []);
      }
    } catch (error) {
      console.error('Error fetching featured diamonds:', error);
      setFeaturedDiamonds([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/diamonds');
      const data = await response.json();
      
      if (data.success) {
        const diamonds = data.diamonds || [];
        const totalValue = diamonds.reduce((sum: number, diamond: Diamond) => sum + diamond.price, 0);
        
        setStats({
          totalUsers: 150, // Static for now
          totalDiamonds: diamonds.length,
          totalValue: totalValue
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full opacity-25 animate-bounce"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 p-6 rounded-full shadow-2xl">
                  <Diamond className="w-16 h-16 text-white animate-gentle-float" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Discover Premium
              <span className="block bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent animate-gradient-x bg-300%">
                Diamonds
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the world's finest diamonds from verified sellers worldwide. 
              Where elegance meets excellence in every precious stone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/purchase"
                className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-lg font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <span>Explore Diamonds</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/sell"
                className="px-8 py-4 border-2 border-amber-400 text-amber-400 text-lg font-semibold rounded-xl hover:bg-amber-400 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Sell Your Diamond
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Shape Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by <span className="text-amber-500">Shape</span>
            </h2>
            <p className="text-gray-600">Find the perfect cut for your style</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Round', icon: RoundDiamond, cut: 'Round Brilliant' },
              { name: 'Princess', icon: PrincessDiamond, cut: 'Princess' },
              { name: 'Emerald', icon: EmeraldDiamond, cut: 'Emerald' },
              { name: 'Pear', icon: PearDiamond, cut: 'Pear' },
              { name: 'Oval', icon: OvalDiamond, cut: 'Oval' },
              { name: 'Heart', icon: HeartDiamond, cut: 'Heart' },
            ].map((shape) => (
              <Link
                key={shape.name}
                to={`/purchase?cut=${shape.cut}`}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-amber-50 group border border-gray-100"
              >
                <div className="w-16 h-16 mb-4 text-gray-400 group-hover:text-amber-500 transition-colors flex items-center justify-center transform group-hover:scale-110 duration-300">
                  <shape.icon className="w-full h-full" />
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-amber-700">{shape.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Diamond Education Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Understanding the <span className="text-amber-500">4Cs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn what makes each diamond unique and valuable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Cut',
                icon: Scissors,
                desc: 'The most important factor. It determines the diamond\'s brilliance and sparkle.',
                color: 'blue'
              },
              {
                title: 'Color',
                icon: Palette,
                desc: 'Graded from D (colorless) to Z (light yellow). Less color means higher value.',
                color: 'purple'
              },
              {
                title: 'Clarity',
                icon: Search,
                desc: 'Measures internal inclusions and external blemishes. Flawless is the rarest.',
                color: 'green'
              },
              {
                title: 'Carat',
                icon: Scale,
                desc: 'The unit of weight for diamonds. One carat equals 200 milligrams.',
                color: 'amber'
              }
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 group">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-${item.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stories of <span className="text-amber-500">Love</span>
            </h2>
            <p className="text-xl text-gray-600">Hear from our happy customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah & James",
                role: "Engaged Couple",
                text: "We found the perfect engagement ring on Ratna. The process was transparent, and the diamond is absolutely stunning!",
                location: "New York, USA"
              },
              {
                name: "Michael Chen",
                role: "Jewelry Collector",
                text: "As a collector, I appreciate the detailed certification and verification process. Ratna is my go-to for premium stones.",
                location: "Singapore"
              },
              {
                name: "Emily Thompson",
                role: "Happy Seller",
                text: "Selling my diamond was safe and easy. I got a fair price and the support team was helpful throughout the process.",
                location: "London, UK"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all relative">
                <Quote className="absolute top-6 left-6 w-10 h-10 text-amber-100" />
                <div className="relative z-10 pt-8">
                  <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 font-bold mr-3">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role} • {testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <Mail className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stay in the Loop</h2>
              <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                Subscribe to our newsletter for exclusive offers, diamond education, and market updates.
              </p>

              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Thanks for subscribing!'); }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalUsers.toLocaleString()}+</h3>
              <p className="text-gray-600">Trusted Customers</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Diamond className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalDiamonds.toLocaleString()}</h3>
              <p className="text-gray-600">Premium Diamonds</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{formatPrice(stats.totalValue)}</h3>
              <p className="text-gray-600">Total Value</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Diamonds */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured <span className="text-amber-500">Diamonds</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our handpicked selection of exceptional diamonds from verified sellers
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading featured diamonds...</p>
            </div>
          ) : featuredDiamonds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDiamonds.map((diamond, index) => (
                <div 
                  key={diamond._id} 
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={diamond.image || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                      alt={diamond.name}
                      className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm flex items-center backdrop-blur-sm">
                      <Eye className="w-3 h-3 mr-1" />
                      {diamond.views}
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        FEATURED
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors duration-300">
                        {diamond.name}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                        <span className="font-semibold text-gray-800">Carat:</span>
                        <span className="ml-2 text-amber-600 font-bold">{diamond.carat}</span>
                      </div>
                      <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                        <span className="font-semibold text-gray-800">Cut:</span>
                        <span className="ml-2">{diamond.cut}</span>
                      </div>
                      <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                        <span className="font-semibold text-gray-800">Color:</span>
                        <span className="ml-2">{diamond.color}</span>
                      </div>
                      <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                        <span className="font-semibold text-gray-800">Clarity:</span>
                        <span className="ml-2">{diamond.clarity}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {diamond.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(diamond.price)}</p>
                        <p className="text-sm text-amber-600 font-semibold">
                          {formatPrice(Math.round(diamond.price / diamond.carat))}/carat
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>

                    <div className="text-center">
                      <Link
                        to="/purchase"
                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Diamond className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Diamond className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Featured Diamonds</h3>
              <p className="text-gray-500">Check back soon for our latest collection</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/purchase"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              View All Diamonds
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-amber-500">Ratna</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the finest diamond marketplace with unmatched quality and service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Certified Authentic</h3>
              <p className="text-gray-600 leading-relaxed">
                Every diamond comes with professional certification and authenticity guarantee from trusted institutions.
              </p>
            </div>

            <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Sellers</h3>
              <p className="text-gray-600 leading-relaxed">
                All our sellers are thoroughly vetted and verified to ensure you're dealing with trusted professionals.
              </p>
            </div>

            <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">
                We curate only the finest diamonds with exceptional cut, clarity, color, and carat specifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect Diamond?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-3xl mx-auto">
              Join thousands of satisfied customers who found their dream diamonds through Ratna
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/purchase"
                className="px-8 py-4 bg-white text-amber-600 text-lg font-semibold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Shopping
              </Link>
              <Link
                to="/sell"
                className="px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white hover:text-amber-600 transition-all duration-300 transform hover:scale-105"
              >
                Sell Your Diamond
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;