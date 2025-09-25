import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Instagram } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GreenPath</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">Home</Link>
            <Link to="/achievements" className="text-gray-700 hover:text-green-600 transition-colors">Achievements</Link>
            <Link to="/maps" className="text-gray-700 hover:text-green-600 transition-colors">Routes</Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-green-600 transition-colors">Dashboard</Link>
          </div>

          {/* Login Button */}
          <button className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
            <Instagram className="w-4 h-4" />
            <span className="hidden sm:block">Login with Instagram</span>
            <span className="sm:hidden">Login</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;