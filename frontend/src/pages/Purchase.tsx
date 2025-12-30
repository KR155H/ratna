import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ListFilter as Filter, Diamond, Eye, Heart, Star, User, Calendar, ExternalLink, MessageCircle, Video, Scale, X, Check, ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';

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
  pricePerCarat?: number;
  media?: Array<{ type: 'image' | 'video'; url: string }>;
  certification?: {
    certificateNumber?: string;
    certificateUrl?: string;
  };
  isRatnaDiamond?: boolean;
}

const Purchase: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);

  // Inquiry States
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryDiamond, setInquiryDiamond] = useState<Diamond | null>(null);
  const [inquiryForm, setInquiryForm] = useState({ subject: '', message: '' });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  // Checkout States
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutDiamond, setCheckoutDiamond] = useState<Diamond | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', zip: '', country: ''
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '', expiry: '', cvv: '', name: ''
  });

  const { formatPrice } = useCurrency();
  const { user, token } = useAuth();
  const { compareList, addToCompare, removeFromCompare, isInCompare, clearCompare } = useCompare();
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [filters, setFilters] = useState({
    cut: '',
    color: '',
    clarity: '',
    minPrice: '',
    maxPrice: '',
    minCarat: '',
    maxCarat: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const cuts = [
    'Round Brilliant', 'Princess', 'Emerald', 'Oval', 'Cushion',
    'Marquise', 'Pear', 'Asscher', 'Radiant', 'Heart'
  ];
  
  const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];

  // Initialize filters from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cut = searchParams.get('cut');
    if (cut) {
      setFilters(prev => ({ ...prev, cut }));
      setShowFilters(true);
    }
  }, [location.search]);

  const fetchDiamonds = async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({
        sort: sortBy,
        order: sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.cut && { cut: filters.cut }),
        ...(filters.color && { color: filters.color }),
        ...(filters.clarity && { clarity: filters.clarity }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.minCarat && { minCarat: filters.minCarat }),
        ...(filters.maxCarat && { maxCarat: filters.maxCarat })
      });

      const response = await fetch(`http://localhost:5000/api/diamonds?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setDiamonds(data.diamonds);
      } else {
        setError(data.message || 'Failed to fetch diamonds');
        setDiamonds([]);
      }
    } catch (error) {
      console.error('Error fetching diamonds:', error);
      setError('Network error. Please check your connection and try again.');
      setDiamonds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiamonds();
  }, [sortBy, sortOrder, filters]);

  const handleSearch = () => {
    fetchDiamonds();
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const applyFilters = () => {
    fetchDiamonds();
  };

  const clearFilters = () => {
    setFilters({
      cut: '',
      color: '',
      clarity: '',
      minPrice: '',
      maxPrice: '',
      minCarat: '',
      maxCarat: ''
    });
    setSearchTerm('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInquire = (diamond: Diamond) => {
    if (!user) {
      alert('Please login to send inquiries');
      navigate('/login');
      return;
    }
    
    setInquiryDiamond(diamond);
    setInquiryForm({
      subject: `Inquiry about ${diamond.name}`,
      message: `Hi! I'm interested in the ${diamond.name} (${diamond.carat} carat, ${diamond.cut} cut, ${diamond.color} color, ${diamond.clarity} clarity) priced at ${formatPrice(diamond.price)}. Could you please provide more details?`
    });
    setShowInquiryModal(true);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryDiamond || !user) return;

    setInquiryLoading(true);
    setInquiryError('');

    try {
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: inquiryDiamond.seller._id,
          diamondId: inquiryDiamond._id,
          subject: inquiryForm.subject,
          message: inquiryForm.message
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowInquiryModal(false);
        setInquiryForm({ subject: '', message: '' });
        alert('Inquiry sent successfully! Check your messages for replies.');
      } else {
        setInquiryError(data.message || 'Failed to send inquiry');
      }
    } catch (error) {
      console.error('Error sending inquiry:', error);
      setInquiryError('Network error. Please try again.');
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleBuyNow = (diamond: Diamond) => {
    if (!user) {
      alert('Please login to purchase diamonds');
      navigate('/login');
      return;
    }
    setCheckoutDiamond(diamond);
    setShowCheckoutModal(true);
    setPurchaseSuccess(false);
    setCheckoutError('');
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutDiamond || !user) return;

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const response = await fetch(`http://localhost:5000/api/diamonds/${checkoutDiamond._id}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress,
          paymentDetails // In real app, never send raw card details. Send token.
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPurchaseSuccess(true);
        setTimeout(() => {
          setShowCheckoutModal(false);
          setCheckoutDiamond(null);
          fetchDiamonds(); // Refresh to remove sold diamond
        }, 3000);
      } else {
        setCheckoutError(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing diamond:', error);
      setCheckoutError('Network error. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const DiamondModal = ({ diamond, onClose }: { diamond: Diamond; onClose: () => void }) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const mediaItems = diamond.media && diamond.media.length > 0
      ? diamond.media
      : [{ type: 'image', url: diamond.image }];

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative">
              {/* Media Display */}
              <div className="relative h-96 lg:h-full bg-gray-100 flex items-center justify-center">
                {mediaItems[currentMediaIndex].type === 'image' ? (
                  <img
                    src={mediaItems[currentMediaIndex].url || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                    alt={diamond.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg';
                    }}
                  />
                ) : (
                  <video
                    src={mediaItems[currentMediaIndex].url}
                    className="w-full h-full object-cover"
                    controls
                    controlsList="nodownload"
                  />
                )}
                
                {/* Media Navigation */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentMediaIndex(prev => prev > 0 ? prev - 1 : mediaItems.length - 1)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentMediaIndex(prev => prev < mediaItems.length - 1 ? prev + 1 : 0)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
              
              {/* Media Thumbnails */}
              {mediaItems.length > 1 && (
                <div className="absolute bottom-4 left-4 right-4 flex space-x-2 overflow-x-auto pb-2">
                  {mediaItems.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${
                        currentMediaIndex === index ? 'border-gold' : 'border-white'
                      }`}
                    >
                      {media.type === 'image' ? (
                        <img src={media.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-3xl font-bold text-gray-900 font-serif">{diamond.name}</h2>
                  {diamond.isRatnaDiamond && (
                    <span className="bg-gradient-to-r from-gold to-yellow-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm flex items-center">
                      <Diamond className="w-3 h-3 mr-1 fill-current" />
                      RATNA's diam
                    </span>
                  )}
                </div>
                <p className="text-4xl font-bold text-accent font-serif">{formatPrice(diamond.price)}</p>
                <p className="text-gray-600">{formatPrice(Math.round(diamond.price / diamond.carat))} per carat</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Carat</p>
                  <p className="text-xl font-bold text-accent">{diamond.carat}</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Cut</p>
                  <p className="text-xl font-bold text-accent">{diamond.cut}</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Color</p>
                  <p className="text-xl font-bold text-accent">{diamond.color}</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Clarity</p>
                  <p className="text-xl font-bold text-accent">{diamond.clarity}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{diamond.description}</p>
              </div>

              <div className="mb-6 p-4 bg-secondary rounded-lg border-l-4 border-gold">
                <div className="flex items-center mb-2">
                  <User className="w-5 h-5 text-accent mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Seller Information</h3>
                </div>
                <p className="text-gray-800 font-medium">{diamond.sellerName}</p>
                <p className="text-gray-600 text-sm">Listed on {formatDate(diamond.createdAt)}</p>
                {diamond.certification?.certificateNumber && (
                  <div className="mt-2">
                    <p className="text-gray-800 text-sm">Certificate: {diamond.certification.certificateNumber}</p>
                    {diamond.certification.certificateUrl && (
                      <a 
                        href={diamond.certification.certificateUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gold hover:text-gold-hover text-sm hover:underline font-medium"
                      >
                        View Certificate →
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                {diamond.isRatnaDiamond ? (
                  <button
                    onClick={() => handleBuyNow(diamond)}
                    className="flex-1 bg-gold text-white py-3 px-6 rounded-lg hover:bg-gold-hover transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-lg"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Buy Now
                  </button>
                ) : (
                  <button
                    onClick={() => handleInquire(diamond)}
                    className="flex-1 bg-accent text-white py-3 px-6 rounded-lg hover:bg-accent-hover transition-all duration-300 flex items-center justify-center transform hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send Inquiry
                  </button>
                )}

                <button
                  onClick={() => {
                    if (isInCompare(diamond._id)) {
                      removeFromCompare(diamond._id);
                    } else {
                      addToCompare(diamond);
                    }
                  }}
                  className={`px-6 py-3 border rounded-lg transition-all duration-300 flex items-center ${
                    isInCompare(diamond._id)
                      ? 'bg-secondary text-accent border-accent hover:bg-gray-200'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Scale className="w-5 h-5 mr-2" />
                  {isInCompare(diamond._id) ? 'Added' : 'Compare'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )};

  const CheckoutModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold font-serif text-accent">Secure Checkout</h2>
            <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {purchaseSuccess ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase Successful!</h3>
              <p className="text-gray-600 mb-6">Thank you for your purchase. Your diamond is on its way.</p>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-accent mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-xl flex items-center space-x-4 border border-gray-100">
                <img
                  src={checkoutDiamond?.image || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                  alt={checkoutDiamond?.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{checkoutDiamond?.name}</h4>
                  <p className="text-gold font-bold">{checkoutDiamond && formatPrice(checkoutDiamond.price)}</p>
                </div>
              </div>

              {checkoutError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {checkoutError}
                </div>
              )}

              <form onSubmit={handlePurchase} className="space-y-6">
                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-accent" />
                    Shipping Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Street Address" className="col-span-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent" required value={shippingAddress.street} onChange={e => setShippingAddress({...shippingAddress, street: e.target.value})} />
                    <input type="text" placeholder="City" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent" required value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} />
                    <input type="text" placeholder="State/Province" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent" required value={shippingAddress.state} onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})} />
                    <input type="text" placeholder="ZIP/Postal Code" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent" required value={shippingAddress.zip} onChange={e => setShippingAddress({...shippingAddress, zip: e.target.value})} />
                    <input type="text" placeholder="Country" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent" required value={shippingAddress.country} onChange={e => setShippingAddress({...shippingAddress, country: e.target.value})} />
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-accent" />
                    Payment Method
                  </h3>
                  <div className="space-y-4">
                    <input type="text" placeholder="Cardholder Name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent" required value={paymentDetails.name} onChange={e => setPaymentDetails({...paymentDetails, name: e.target.value})} />
                    <input type="text" placeholder="Card Number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent" required maxLength={19} value={paymentDetails.cardNumber} onChange={e => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="MM/YY" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent" required maxLength={5} value={paymentDetails.expiry} onChange={e => setPaymentDetails({...paymentDetails, expiry: e.target.value})} />
                      <input type="text" placeholder="CVV" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent" required maxLength={4} value={paymentDetails.cvv} onChange={e => setPaymentDetails({...paymentDetails, cvv: e.target.value})} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full py-4 bg-gold text-white font-bold rounded-xl hover:bg-gold-hover transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      Pay {checkoutDiamond && formatPrice(checkoutDiamond.price)}
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CompareModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-serif text-accent">Compare Diamonds</h2>
            <button onClick={() => setShowCompareModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-4 text-left min-w-[150px]">Feature</th>
                  {compareList.map(d => (
                    <th key={d._id} className="p-4 text-center min-w-[200px] relative">
                      <button
                        onClick={() => removeFromCompare(d._id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={d.image || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                        className="w-24 h-24 object-cover mx-auto rounded-lg mb-2"
                        alt={d.name}
                      />
                      <p className="font-serif font-bold text-gray-900 truncate">{d.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: 'Price', value: (d: Diamond) => <span className="font-bold text-accent">{formatPrice(d.price)}</span> },
                  { label: 'Price/Carat', value: (d: Diamond) => formatPrice(Math.round(d.price / d.carat)) },
                  { label: 'Carat', value: (d: Diamond) => d.carat },
                  { label: 'Cut', value: (d: Diamond) => d.cut },
                  { label: 'Color', value: (d: Diamond) => d.color },
                  { label: 'Clarity', value: (d: Diamond) => d.clarity },
                  { label: 'Seller', value: (d: Diamond) => d.sellerName },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-secondary' : 'bg-white'}>
                    <td className="p-4 font-semibold text-gray-600">{row.label}</td>
                    {compareList.map(d => (
                      <td key={d._id} className="p-4 text-center text-gray-800">
                        {row.value(d)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && diamonds.length === 0) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-accent mx-auto mb-4"></div>
            <Diamond className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-accent animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg font-serif">Curating collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pt-28 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-accent flex items-center mb-2 font-serif">
                <Diamond className="w-10 h-10 mr-4 text-gold animate-pulse" />
                Premium Collection
              </h1>
              <p className="text-xl text-gray-600 font-light">Exceptional diamonds from verified sellers</p>
            </div>
            
            <div className="mt-6 md:mt-0 flex items-center space-x-4">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort);
                  setSortOrder(order);
                }}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 hover:shadow-md bg-white text-gray-700 cursor-pointer"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="carat-desc">Carat: High to Low</option>
                <option value="carat-asc">Carat: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, cut, or seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 hover:shadow-md bg-gray-50"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-accent text-white rounded-xl hover:bg-accent-hover hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
              >
                Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-8 py-3 border rounded-xl transition-all duration-300 flex items-center transform hover:scale-105 ${
                  showFilters ? 'border-accent text-accent bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-8 pt-8 border-t border-gray-200 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cut</label>
                  <select
                    value={filters.cut}
                    onChange={(e) => handleFilterChange('cut', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                  >
                    <option value="">All Cuts</option>
                    {cuts.map(cut => (
                      <option key={cut} value={cut}>{cut}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <select
                    value={filters.color}
                    onChange={(e) => handleFilterChange('color', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                  >
                    <option value="">All Colors</option>
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Clarity</label>
                  <select
                    value={filters.clarity}
                    onChange={(e) => handleFilterChange('clarity', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                  >
                    <option value="">All Clarities</option>
                    {clarities.map(clarity => (
                      <option key={clarity} value={clarity}>{clarity}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carat Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      step="0.01"
                      value={filters.minCarat}
                      onChange={(e) => handleFilterChange('minCarat', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      step="0.01"
                      value={filters.maxCarat}
                      onChange={(e) => handleFilterChange('maxCarat', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="px-8 py-3 bg-accent text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="mb-8 flex justify-between items-center">
          <p className="text-lg text-gray-600">
            {diamonds.length === 0 ? 'No diamonds found' : `${diamonds.length} premium diamond${diamonds.length !== 1 ? 's' : ''} available`}
          </p>
        </div>

        {/* Diamond Grid */}
        {diamonds.length === 0 ? (
          <div className="text-center py-16">
            <Diamond className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-3">No Diamonds Found</h3>
            <p className="text-gray-500 text-lg">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diamonds.map((diamond) => (
              <div key={diamond._id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative">
                <div className="relative overflow-hidden h-64">
                  <img
                    src={diamond.image || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                    alt={diamond.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Views */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm flex items-center backdrop-blur-sm">
                    <Eye className="w-3 h-3 mr-1" />
                    {diamond.views}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white text-accent px-3 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">
                      {diamond.status}
                    </span>
                  </div>

                  {/* Ratna's Diamond Badge */}
                  {diamond.isRatnaDiamond && (
                    <div className="absolute top-12 left-3">
                      <span className="bg-gradient-to-r from-gold to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
                        <Diamond className="w-3 h-3 mr-1 fill-current" />
                        RATNA's diam
                      </span>
                    </div>
                  )}

                  {/* Quick Compare Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isInCompare(diamond._id)) {
                        removeFromCompare(diamond._id);
                      } else {
                        addToCompare(diamond);
                      }
                    }}
                    className={`absolute bottom-3 right-3 p-2 rounded-full shadow-lg transition-transform transform ${
                      isInCompare(diamond._id)
                        ? 'bg-gold text-white scale-110'
                        : 'bg-white text-gray-600 hover:scale-110 hover:text-gold'
                    }`}
                    title="Compare"
                  >
                    <Scale className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-accent font-serif group-hover:text-gold transition-colors duration-300">{diamond.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                      <span className="font-semibold text-gray-800">Carat:</span>
                      <span className="ml-2 text-accent font-bold">{diamond.carat}</span>
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
                  
                  <div className="flex items-center text-sm text-gray-500 mb-6 border-t border-gray-100 pt-4">
                    <User className="w-4 h-4 mr-2 text-gold" />
                    <span className="mr-4 font-medium truncate">{diamond.sellerName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-3xl font-bold text-accent font-serif">{formatPrice(diamond.price)}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gold fill-current" />
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedDiamond(diamond)}
                      className="flex-1 px-4 py-3 bg-accent text-white rounded-xl hover:bg-accent-hover hover:shadow-lg transition-all duration-300 text-sm font-semibold transform hover:scale-105 flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    {diamond.isRatnaDiamond ? (
                      <button
                        onClick={() => handleBuyNow(diamond)}
                        className="flex-1 px-4 py-3 bg-gold text-white rounded-xl hover:bg-gold-hover hover:shadow-lg transition-all duration-300 text-sm font-bold transform hover:scale-105 flex items-center justify-center"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Buy Now
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInquire(diamond)}
                        className="flex-1 px-4 py-3 border border-accent text-accent rounded-xl hover:bg-accent hover:text-white transition-all duration-300 text-sm font-semibold transform hover:scale-105 flex items-center justify-center"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Inquire
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diamond Detail Modal */}
        {selectedDiamond && (
          <DiamondModal 
            diamond={selectedDiamond} 
            onClose={() => setSelectedDiamond(null)} 
          />
        )}

        {/* Compare Floating Bar */}
        {compareList.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 z-40 transform translate-y-0 transition-transform animate-fade-in-up">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {compareList.map(d => (
                    <img
                      key={d._id}
                      src={d.image || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                      className="w-12 h-12 rounded-full border-2 border-white object-cover"
                      alt={d.name}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-bold text-accent">{compareList.length} Selected</p>
                  <p className="text-xs text-gray-500">Up to 4 diamonds</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={clearCompare}
                  className="px-4 py-2 text-gray-600 hover:text-red-500 text-sm font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="px-6 py-2 bg-gold text-white rounded-lg hover:bg-gold-hover transition-colors shadow-lg flex items-center"
                >
                  <Scale className="w-4 h-4 mr-2" />
                  Compare Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compare Modal */}
        {showCompareModal && <CompareModal />}

        {/* Checkout Modal */}
        {showCheckoutModal && <CheckoutModal />}

        {/* Inquiry Modal */}
        {showInquiryModal && inquiryDiamond && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 font-serif">Send Inquiry</h2>
                  <button
                    onClick={() => setShowInquiryModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Diamond Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <img
                      src={inquiryDiamond.image || 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg'}
                      alt={inquiryDiamond.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1232218/pexels-photo-1232218.jpeg';
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 font-serif">{inquiryDiamond.name}</h3>
                      <p className="text-accent font-bold">{formatPrice(inquiryDiamond.price)}</p>
                      <p className="text-sm text-gray-600">Seller: {inquiryDiamond.sellerName}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSendInquiry} className="space-y-6">
                  {inquiryError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {inquiryError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={inquiryForm.subject}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-vertical"
                      required
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowInquiryModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inquiryLoading}
                      className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {inquiryLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Send Inquiry
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchase;