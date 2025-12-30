import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Purchase from './pages/Purchase';
import Sell from './pages/Sell';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddDiamond from './pages/AdminAddDiamond';
import Messages from './pages/Messages';

function App() {
  return (
    <AdminProvider>
      <AuthProvider>
        <CurrencyProvider>
          <CompareProvider>
            <Router>
              <div className="min-h-screen">
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/add-diamond" element={
                  <AdminRoute>
                    <AdminAddDiamond />
                  </AdminRoute>
                } />
                
                {/* Public Routes */}
                <Route path="/*" element={
                  <div className="relative">
                    <Navbar />
                    <div className="pt-20">
                      <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/purchase" element={<Purchase />} />
                      <Route path="/sell" element={<Sell />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/messages" element={<Messages />} />
                      </Routes>
                    </div>
                    <Footer />
                  </div>
                } />
              </Routes>
              </div>
            </Router>
          </CompareProvider>
        </CurrencyProvider>
      </AuthProvider>
    </AdminProvider>
  );
}

export default App;