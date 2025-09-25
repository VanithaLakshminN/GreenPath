import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Globe, Car, Award, TrendingUp, Users } from 'lucide-react';
import StatCard from '../components/StatCard';

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Hero Icons */}
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center animate-pulse delay-150">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center animate-pulse delay-300">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Main Tagline */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Travel <span className="text-green-600">Smarter</span>.
              <br />
              Go <span className="text-blue-600">Greener</span>.
              <br />
              Earn <span className="text-green-500">Rewards</span>.
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Make every journey count for the planet. Discover eco-friendly routes, 
              earn points for sustainable choices, and join a community of green travelers.
            </p>

            {/* CTA Button */}
            <Link 
              to="/maps" 
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Find Routes</span>
              <Car className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Your Impact at a Glance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              icon={Leaf}
              title="CO₂ Saved"
              value="124 kg"
              color="bg-green-500"
            />
            <StatCard 
              icon={Award}
              title="Points Earned"
              value="2,350"
              color="bg-blue-500"
            />
            <StatCard 
              icon={TrendingUp}
              title="Badges Unlocked"
              value="12"
              color="bg-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose GreenPath?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <Leaf className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Eco-Friendly Routes</h4>
                    <p className="text-gray-600">Find the greenest paths for your daily commute</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Reward System</h4>
                    <p className="text-gray-600">Earn points and badges for sustainable choices</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-1">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Community</h4>
                    <p className="text-gray-600">Join thousands of eco-conscious travelers</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Start Your Green Journey</h4>
              <p className="text-gray-600 mb-6">
                Ready to make a difference? Join GreenPath and start earning rewards for your eco-friendly travel choices.
              </p>
              <Link 
                to="/achievements" 
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 text-center block"
              >
                View Achievements
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;