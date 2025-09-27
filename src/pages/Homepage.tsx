import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Globe, Car, Award, TrendingUp, Users, ArrowRight, Sparkles, Zap, Heart, Star, Target } from 'lucide-react';
import StatCard from '../components/StatCard';
import { useAuth } from './AuthContext';

const Homepage: React.FC = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-green-200 rounded-full opacity-20 blur-3xl float"
          style={{
            left: mousePosition.x * 0.1,
            top: mousePosition.y * 0.1,
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl float-delayed"
          style={{
            right: mousePosition.x * 0.05,
            bottom: mousePosition.y * 0.05,
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl float-slow"
          style={{
            left: mousePosition.x * 0.08,
            bottom: mousePosition.y * 0.08,
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Hero Icons with Enhanced Animations */}
            <div className={`flex justify-center items-center space-x-8 mb-8 ${isVisible ? 'bounce-in' : 'opacity-0'}`}>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center pulse-glow icon-spin group cursor-pointer">
                <Leaf className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center pulse-glow icon-spin group cursor-pointer">
                <Globe className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center pulse-glow icon-spin group cursor-pointer">
                <Car className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>

            {/* Main Tagline with Staggered Animation */}
            <div className={`${isVisible ? 'text-reveal' : 'opacity-0'}`}>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="inline-block">Travel </span>
                <span className="text-green-600 gradient-animate bg-clip-text text-transparent inline-block">Smarter</span>.
                <br />
                <span className="inline-block">Go </span>
                <span className="text-blue-600 gradient-animate bg-clip-text text-transparent inline-block">Greener</span>.
                <br />
                <span className="inline-block">Earn </span>
                <span className="text-green-500 gradient-animate bg-clip-text text-transparent inline-block">Rewards</span>.
              </h1>
            </div>

            <div className={`${isVisible ? 'text-reveal' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Make every journey count for the planet. Discover eco-friendly routes, 
                earn points for sustainable choices, and join a community of green travelers.
              </p>
            </div>

            {/* Enhanced CTA Button */}
            <div className={`${isVisible ? 'scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <Link 
                to="/maps" 
                className="btn-primary inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 focus-ring"
              >
                <span>Find Routes</span>
                <Car className="w-5 h-5 icon-spin" />
                <ArrowRight className="w-5 h-5 icon-spin" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${isVisible ? 'slide-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Impact at a Glance
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`stagger-item ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
              <StatCard 
                icon={Leaf}
                title="CO₂ Saved"
                value="124 kg"
                color="bg-green-500"
              />
            </div>
            <div className={`stagger-item ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
              <StatCard 
                icon={Award}
                title="Points Earned"
                value="2,350"
                color="bg-blue-500"
              />
            </div>
            <div className={`stagger-item ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: '1.4s' }}>
              <StatCard 
                icon={TrendingUp}
                title="Badges Unlocked"
                value="12"
                color="bg-purple-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`${isVisible ? 'slide-in-left' : 'opacity-0'}`} style={{ animationDelay: '1.6s' }}>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose <span className="gradient-animate bg-clip-text text-transparent">GreenPath</span>?
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group cursor-pointer">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mt-1 pulse-glow icon-spin group-hover:scale-110 transition-transform duration-300">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <div className="group-hover:translate-x-2 transition-transform duration-300">
                    <h4 className="font-semibold text-gray-900 text-lg">Eco-Friendly Routes</h4>
                    <p className="text-gray-600">Find the greenest paths for your daily commute</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group cursor-pointer">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mt-1 pulse-glow icon-spin group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div className="group-hover:translate-x-2 transition-transform duration-300">
                    <h4 className="font-semibold text-gray-900 text-lg">Reward System</h4>
                    <p className="text-gray-600">Earn points and badges for sustainable choices</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group cursor-pointer">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mt-1 pulse-glow icon-spin group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="group-hover:translate-x-2 transition-transform duration-300">
                    <h4 className="font-semibold text-gray-900 text-lg">Community</h4>
                    <p className="text-gray-600">Join thousands of eco-conscious travelers</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${isVisible ? 'slide-in-right' : 'opacity-0'}`} style={{ animationDelay: '1.8s' }}>
              <div className="bg-white rounded-2xl shadow-xl p-8 card-hover neon-glow relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
                
                <div className="relative z-10">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Star className="w-6 h-6 text-yellow-500 mr-2 icon-spin" />
                    Start Your Green Journey
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Ready to make a difference? Join GreenPath and start earning rewards for your eco-friendly travel choices.
                  </p>
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="btn-primary w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 text-center block focus-ring"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Target className="w-5 h-5 icon-spin" />
                        <span>Go to Your Dashboard</span>
                        <ArrowRight className="w-5 h-5 icon-spin" />
                      </div>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="btn-primary w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 text-center block focus-ring"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Sparkles className="w-5 h-5 icon-spin" />
                        <span>Sign Up & Start Earning</span>
                        <ArrowRight className="w-5 h-5 icon-spin" />
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;