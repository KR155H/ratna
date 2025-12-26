import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Diamond, DollarSign, Info, X, Image, Video, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sell: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    carat: '',
    cut: '',
    color: '',
    clarity: '',
    price: '',
    description: '',
    fluorescence: 'None',
    polish: 'Excellent',
    symmetry: 'Excellent',
    certificateNumber: '',
    certificateUrl: ''
  });

  const cuts = [
    'Round Brilliant', 'Princess', 'Emerald', 'Oval', 'Cushion',
    'Marquise', 'Pear', 'Asscher', 'Radiant', 'Heart'
  ];
  
  const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
  const fluorescenceOptions = ['None', 'Faint', 'Medium', 'Strong', 'Very Strong'];
  const polishOptions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  const symmetryOptions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (mediaFiles.length + files.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach(file => {
      // Validate file types
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        setError('Please select only image or video files');
        return;
      }

      // Validate file sizes
      const maxImageSize = 5 * 1024 * 1024; // 5MB
      const maxVideoSize = 50 * 1024 * 1024; // 50MB
      
      if (isImage && file.size > maxImageSize) {
        setError('Image files must be less than 5MB');
        return;
      }
      
      if (isVideo && file.size > maxVideoSize) {
        setError('Video files must be less than 50MB');
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setMediaFiles(prev => [...prev, ...validFiles]);
          setMediaPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      setError('');
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log('🎫 Token from localStorage:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setError('Authentication required. Please login to sell diamonds.');
        setLoading(false);
        return;
      }

      // Validate required fields
      if (mediaFiles.length === 0) {
        setError('At least one image or video is required.');
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('carat', formData.carat);
      submitData.append('cut', formData.cut);
      submitData.append('color', formData.color);
      submitData.append('clarity', formData.clarity);
      submitData.append('price', formData.price);
      submitData.append('description', formData.description);
      submitData.append('fluorescence', formData.fluorescence);
      submitData.append('polish', formData.polish);
      submitData.append('symmetry', formData.symmetry);
      submitData.append('certificateNumber', formData.certificateNumber);
      submitData.append('certificateUrl', formData.certificateUrl);
      
      mediaFiles.forEach((file, index) => {
        submitData.append(`media`, file);
      });

      console.log('📤 Submitting diamond data with token');
      
      const response = await fetch('http://localhost:5000/api/diamonds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData
      });

      const data = await response.json();
      console.log('📡 Diamond upload response:', data);

      if (data.success) {
        setSuccess('Diamond listed successfully! Redirecting to marketplace...');
        setFormData({
          name: '',
          carat: '',
          cut: '',
          color: '',
          clarity: '',
          price: '',
          description: '',
          fluorescence: 'None',
          polish: 'Excellent',
          symmetry: 'Excellent',
          certificateNumber: '',
          certificateUrl: ''
        });
        setMediaFiles([]);
        setMediaPreviews([]);
        setTimeout(() => {
          navigate('/purchase');
        }, 1500);
      } else {
        console.log('❌ Diamond upload failed:', data.message);
        setError(data.message || 'Failed to list diamond');
      }
    } catch (error) {
      console.error('Error listing diamond:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <Diamond className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to sell your diamonds</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Diamond className="w-8 h-8 mr-3" />
              Sell Your Diamond
            </h1>
            <p className="text-amber-100 mt-2">List your precious diamond on our premium marketplace</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-amber-500" />
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diamond Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g., Brilliant Round Diamond"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carat Weight *
                    </label>
                    <input
                      type="number"
                      name="carat"
                      value={formData.carat}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0.01"
                      max="50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="1.25"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="5000"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Number
                    </label>
                    <input
                      type="text"
                      name="certificateNumber"
                      value={formData.certificateNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="e.g., GIA-1234567890"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate URL
                    </label>
                    <input
                      type="url"
                      name="certificateUrl"
                      value={formData.certificateUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Describe your diamond's unique features, history, or special characteristics..."
                  />
                </div>
              </div>

              {/* Diamond Characteristics */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Diamond className="w-5 h-5 mr-2 text-amber-500" />
                  Diamond Characteristics
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cut *
                  </label>
                  <select
                    name="cut"
                    value={formData.cut}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Select Cut</option>
                    {cuts.map(cut => (
                      <option key={cut} value={cut}>{cut}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color *
                    </label>
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Select Color</option>
                      {colors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clarity *
                    </label>
                    <select
                      name="clarity"
                      value={formData.clarity}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Select Clarity</option>
                      {clarities.map(clarity => (
                        <option key={clarity} value={clarity}>{clarity}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fluorescence
                    </label>
                    <select
                      name="fluorescence"
                      value={formData.fluorescence}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {fluorescenceOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Polish
                    </label>
                    <select
                      name="polish"
                      value={formData.polish}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {polishOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symmetry
                    </label>
                    <select
                      name="symmetry"
                      value={formData.symmetry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {symmetryOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                <Video className="w-5 h-5 mr-2 text-amber-500" />
                Diamond Media * (Images & Videos)
              </h3>
              
              <div className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700">Upload Diamond Media</p>
                    <p className="text-sm text-gray-500">Images: PNG, JPG, JPEG, WebP (max 5MB each)</p>
                    <p className="text-sm text-gray-500">Videos: MP4, MOV, AVI, MKV (max 50MB each)</p>
                    <p className="text-sm text-gray-500">Maximum 10 files total</p>
                  </div>
                  <input
                    type="file"
                    id="media"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="media"
                    className="mt-4 inline-flex items-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Media Files
                  </label>
                </div>
                
                {/* Media Previews */}
                {mediaPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        {mediaFiles[index].type.startsWith('image/') ? (
                          <img
                            src={preview}
                            alt={`Diamond media ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <video
                            src={preview}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            controls
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          {mediaFiles[index].type.startsWith('image/') ? (
                            <Image className="w-3 h-3 inline mr-1" />
                          ) : (
                            <Video className="w-3 h-3 inline mr-1" />
                          )}
                          {(mediaFiles[index].size / 1024 / 1024).toFixed(1)}MB
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/purchase')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Listing Diamond...
                  </>
                ) : (
                  <>
                    <Diamond className="w-5 h-5 mr-2" />
                    List Diamond
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Sell;