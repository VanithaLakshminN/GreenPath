import React, { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover neon-glow relative overflow-hidden group cursor-pointer ${
        isVisible ? 'scale-in' : 'opacity-0'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-green-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      {/* Floating particles effect */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
      <div className="absolute top-4 right-4 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" style={{ animationDelay: '0.4s' }}></div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 pulse-glow`}>
            <Icon className={`w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300 ${isHovered ? 'icon-spin' : ''}`} />
          </div>
          <div className="group-hover:translate-x-1 transition-transform duration-300">
            <p className="text-gray-600 text-sm font-medium group-hover:text-gray-800 transition-colors duration-300">{title}</p>
            <p className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{value}</p>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`h-1 rounded-full ${color.replace('bg-', 'bg-gradient-to-r from-')} progress-bar`} style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;