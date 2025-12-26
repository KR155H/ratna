# Ratna - Premium Diamond Marketplace

A luxurious and professional diamond selling website built with ReactJS, Node.js, Express, and MongoDB. Ratna offers a complete marketplace for buying and selling premium diamonds with user authentication, advanced filtering, and a beautiful responsive design.

## 📁 Project Structure

```
ratna/
├── frontend/          # React.js frontend application
│   ├── src/          # Source files
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/          # Node.js backend API
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   └── package.json  # Backend dependencies
└── README.md         # Project documentation
```

## 🌟 Features

### Frontend Features
- **Elegant Homepage** with hero section, featured diamonds, and company information
- **Advanced Diamond Search** with filtering by cut, color, clarity, price, and carat
- **User Authentication** with secure login and registration
- **Sell Diamond Interface** for authenticated users to list their diamonds
- **Contact Page** with business information and contact form
- **Responsive Design** that works perfectly on all devices
- **Professional UI/UX** with smooth animations and premium styling

### Backend Features
- **RESTful API** built with Express.js
- **MongoDB Database** with Mongoose ODM
- **JWT Authentication** for secure user sessions
- **File Upload Support** with Multer for diamond images
- **Data Validation** with comprehensive error handling
- **Password Encryption** using bcryptjs
- **Advanced Filtering** and pagination for diamond listings

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create environment variables file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB connection string and other settings:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ratna
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

5. Start the backend server:
   ```bash
   npm start
   # or for development with auto-restart:
   # npm run dev
   ```

The backend API will be available at [http://localhost:5000](http://localhost:5000)

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (user/seller/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Diamond Model
```javascript
{
  name: String,
  carat: Number,
  cut: String (enum),
  color: String (enum),
  clarity: String (enum),
  price: Number,
  description: String,
  image: String,
  seller: ObjectId (ref: User),
  sellerName: String,
  status: String (active/sold/pending),
  certification: Object,
  dimensions: Object,
  fluorescence: String,
  polish: String,
  symmetry: String,
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Diamonds
- `GET /api/diamonds` - Get all diamonds (with filtering)
- `GET /api/diamonds/:id` - Get single diamond
- `POST /api/diamonds` - Add new diamond (protected)
- `PUT /api/diamonds/:id` - Update diamond (owner only)
- `DELETE /api/diamonds/:id` - Delete diamond (owner only)
- `GET /api/diamonds/seller/:sellerId` - Get diamonds by seller

### Contact
- `POST /api/contact` - Submit contact form

## 🎨 Design Features

### Color Palette
- **Primary**: Deep Navy (#1a1f3a) and Slate tones
- **Accent**: Gold (#d4af37) and Yellow (#f59e0b)
- **Text**: Various shades of gray for hierarchy
- **Background**: Clean whites and subtle grays

### Typography
- **Headings**: Elegant serif fonts for luxury feel
- **Body**: Clean sans-serif for readability
- **Hierarchy**: Consistent font weights and sizes

### Components
- **Navigation**: Responsive navbar with user authentication state
- **Cards**: Diamond listing cards with hover effects
- **Forms**: Comprehensive validation and error handling
- **Buttons**: Consistent styling with hover animations
- **Modals**: Clean popups for confirmations

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ratna

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your preferred hosting service

### Backend (Heroku/Railway/DigitalOcean)
1. Ensure all environment variables are set
2. Create a production MongoDB database
3. Deploy using your preferred service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Enhancements

- **Payment Integration** with Stripe/PayPal
- **Advanced Search** with AI-powered recommendations
- **Wishlist Feature** for favorite diamonds
- **Real-time Chat** between buyers and sellers
- **Diamond Comparison** tool
- **Mobile App** with React Native
- **Admin Dashboard** for platform management
- **Email Notifications** for various actions
- **Social Media Integration** for sharing
- **Multi-language Support**

## 📞 Support

For support, email info@ratna.com or join our Discord community.

---

**Built with ❤️ by the Ratna Team**

Experience the finest diamonds at [Ratna](https://ratna.com) - Where Elegance Meets Excellence.