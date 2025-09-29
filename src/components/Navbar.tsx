import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Instagram, LogOut, User, Menu, X, Home, Award, MapPin, BarChart3 } from 'lucide-react';
import { useAuth } from '../pages/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/achievements', label: 'Achievements', icon: Award },
    { path: '/maps', label: 'Routes', icon: MapPin },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-white shadow-sm border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 pulse-glow">
              <Leaf className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
              GreenPath
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 group ${
                    isActive
                      ? 'bg-green-100 text-green-700 font-semibold'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <item.icon className={`w-4 h-4 group-hover:scale-110 transition-transform duration-300 ${
                    isActive ? 'text-green-600' : ''
                  }`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 icon-spin" />
            ) : (
              <Menu className="w-6 h-6 icon-spin" />
            )}
          </button>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:block">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 group">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <User className={`w-8 h-8 text-gray-400 bg-gray-100 rounded-full p-1 group-hover:scale-110 transition-transform duration-300 ${user.profilePicture ? 'hidden' : ''}`} />
                  <span className="text-gray-700 font-medium group-hover:text-green-600 transition-colors duration-300">
                    Welcome, @{user.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors disabled:opacity-50 group"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="btn-primary flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 shadow-md hover:shadow-lg focus-ring"
              >
                <Instagram className="w-4 h-4 icon-spin" />
                <span>Login with Instagram</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 group ${
                      isActive
                        ? 'bg-green-100 text-green-700 font-semibold'
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 group-hover:scale-110 transition-transform duration-300 ${
                      isActive ? 'text-green-600' : ''
                    }`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <User className={`w-8 h-8 text-gray-400 bg-gray-100 rounded-full p-1 ${user.profilePicture ? 'hidden' : ''}`} />
                      <span className="text-gray-700 font-medium">@{user.username}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={isLoggingOut}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-primary w-full flex items-center space-x-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 focus-ring"
                  >
                    <Instagram className="w-5 h-5 icon-spin" />
                    <span>Login with Instagram</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;