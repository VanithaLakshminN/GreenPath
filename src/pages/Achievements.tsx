import React, { useState, useEffect } from 'react';
import { User, Award, Leaf, Car, Bike, TreePine, Globe, Star, Trophy, Medal, Target, Zap, Share, Camera, Download, Sparkles, Heart } from 'lucide-react';
import { useAuth } from './AuthContext';
import achievementShareService, { type UserAchievement, type ShareableAchievement } from '../services/achievementShare';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  color: string;
}

interface LeaderboardUser {
  id: string;
  username: string;
  points: number;
  badges: number;
  avatar: string;
}

const Achievements: React.FC = () => {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const badges: Badge[] = [
    {
      id: '1',
      name: 'Green Starter',
      description: 'Complete your first eco-friendly trip',
      icon: <Leaf className="w-6 h-6" />,
      earned: true,
      color: 'bg-green-500'
    },
    {
      id: '2',
      name: 'Bike Champion',
      description: 'Travel 50km by bicycle',
      icon: <Bike className="w-6 h-6" />,
      earned: true,
      color: 'bg-blue-500'
    },
    {
      id: '3',
      name: 'Public Transit Pro',
      description: 'Use public transport 20 times',
      icon: <Car className="w-6 h-6" />,
      earned: true,
      color: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'Tree Hugger',
      description: 'Save 100kg of CO₂',
      icon: <TreePine className="w-6 h-6" />,
      earned: false,
      color: 'bg-green-600'
    },
    {
      id: '5',
      name: 'Global Guardian',
      description: 'Complete 100 eco trips',
      icon: <Globe className="w-6 h-6" />,
      earned: false,
      color: 'bg-indigo-500'
    },
    {
      id: '6',
      name: 'Eco Warrior',
      description: 'Reach 5000 points',
      icon: <Star className="w-6 h-6" />,
      earned: false,
      color: 'bg-yellow-500'
    }
  ];

  const leaderboard: LeaderboardUser[] = [
    { id: '1', username: '@ecowarrior', points: 4850, badges: 8, avatar: '🌱' },
    { id: '2', username: '@greentravel', points: 4200, badges: 7, avatar: '🌍' },
    { id: '3', username: '@bikelife', points: 3950, badges: 6, avatar: '🚴' },
    { id: '4', username: '@sustainableme', points: 3100, badges: 5, avatar: '♻️' },
    { id: '5', username: '@planetfriend', points: 2350, badges: 4, avatar: '🌿' }
  ];

  const currentUser = {
    username: user ? user.username : 'Guest',
    profilePic: '👤',
    points: 2350,
    totalPoints: 5000,
    level: 'Green Explorer',
    co2Saved: 124,
    tripsCompleted: 45
  };

  const progressPercentage = (currentUser.points / currentUser.totalPoints) * 100;

  // Get shareable achievements
  const userAchievementData: UserAchievement = {
    username: currentUser.username,
    level: currentUser.level,
    points: currentUser.points,
    co2Saved: currentUser.co2Saved,
    tripsCompleted: currentUser.tripsCompleted,
    badgesEarned: badges.filter(b => b.earned).length
  };

  const shareableAchievements = achievementShareService.getShareableAchievements(userAchievementData);

  const handleShareAchievement = async (achievement: ShareableAchievement) => {
    setIsSharing(true);
    try {
      await achievementShareService.shareAchievement(achievement, userAchievementData);
    } catch (error) {
      console.error('Failed to share achievement:', error);
      alert('Failed to share achievement. Please try again.');
    } finally {
      setIsSharing(false);
      setShareModalOpen(false);
    }
  };

  const handleShareStory = async (achievement: ShareableAchievement) => {
    setIsSharing(true);
    try {
      await achievementShareService.shareToInstagramStory(achievement, userAchievementData);
    } catch (error) {
      console.error('Failed to create story:', error);
      alert('Failed to create story. Please try again.');
    } finally {
      setIsSharing(false);
      setShareModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full opacity-10 blur-3xl float-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* User Profile Card */}
        <div className={`bg-white rounded-2xl shadow-xl p-8 mb-8 card-hover neon-glow relative overflow-hidden ${
          isVisible ? 'slide-in-up' : 'opacity-0'
        }`}>
          {/* Animated background pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 pulse-glow">
                  {currentUser.profilePic}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center pulse-glow">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                  {currentUser.username}
                </h1>
                <p className="text-green-600 font-semibold flex items-center space-x-2">
                  <span>{currentUser.level}</span>
                  <Sparkles className="w-4 h-4 icon-spin" />
                </p>
                <p className="text-gray-600 flex items-center space-x-2">
                  <span>{currentUser.tripsCompleted} eco trips completed</span>
                  <Heart className="w-4 h-4 text-red-500 icon-spin" />
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress to next level</span>
                <span className="text-sm font-medium text-green-600 flex items-center space-x-1">
                  <span>{currentUser.points}/{currentUser.totalPoints} points</span>
                  <Zap className="w-4 h-4 icon-spin" />
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 progress-bar">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 card-hover group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Leaf className="w-8 h-8 text-green-600 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                  <div>
                    <p className="text-green-800 font-semibold group-hover:text-green-600 transition-colors duration-300">
                      {currentUser.co2Saved}kg CO₂
                    </p>
                    <p className="text-green-600 text-sm">Saved this month</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 card-hover group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-8 h-8 text-blue-600 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                  <div>
                    <p className="text-blue-800 font-semibold group-hover:text-blue-600 transition-colors duration-300">
                      {currentUser.points} Points
                    </p>
                    <p className="text-blue-600 text-sm">Total earned</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 card-hover group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Medal className="w-8 h-8 text-purple-600 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                  <div>
                    <p className="text-purple-800 font-semibold group-hover:text-purple-600 transition-colors duration-300">
                      {badges.filter(b => b.earned).length} Badges
                    </p>
                    <p className="text-purple-600 text-sm">Unlocked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Badges Section */}
          <div className="lg:col-span-2">
            <div className={`bg-white rounded-2xl shadow-xl p-6 card-hover neon-glow ${
              isVisible ? 'slide-in-left' : 'opacity-0'
            }`} style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Award className="w-6 h-6 text-green-500 icon-spin" />
                  <span>Achievement Badges</span>
                </h2>
                <div className="text-sm text-gray-500 flex items-center space-x-1">
                  <span>{badges.filter(b => b.earned).length}/{badges.length} earned</span>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge, index) => (
                  <div
                    key={badge.id}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-300 card-hover group cursor-pointer ${
                      isVisible ? 'stagger-item' : 'opacity-0'
                    } ${
                      badge.earned
                        ? 'border-green-200 bg-white shadow-md hover:shadow-lg hover:border-green-300'
                        : 'border-gray-200 bg-gray-50 opacity-60 hover:opacity-80'
                    }`}
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                    onMouseEnter={() => setSelectedBadge(badge.id)}
                    onMouseLeave={() => setSelectedBadge(null)}
                  >
                    {/* Animated background */}
                    <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                      badge.earned ? 'bg-gradient-to-br from-green-50 to-blue-50' : 'bg-gray-100'
                    } ${selectedBadge === badge.id ? 'opacity-100' : 'opacity-0'}`}></div>
                    
                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ${
                        badge.earned ? badge.color : 'bg-gray-400'
                      } ${badge.earned ? 'pulse-glow' : ''}`}>
                        <div className="text-white group-hover:scale-110 transition-transform duration-300">
                          {badge.icon}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors duration-300">
                        {badge.name}
                      </h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                        {badge.description}
                      </p>
                      
                      {badge.earned && (
                        <div className="absolute top-2 right-2 group-hover:scale-110 transition-transform duration-300">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center pulse-glow">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Progress indicator for unearned badges */}
                      {!badge.earned && (
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-gradient-to-r from-gray-400 to-gray-500 h-1 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div>
            <div className={`bg-white rounded-2xl shadow-xl p-6 mb-6 card-hover neon-glow ${
              isVisible ? 'slide-in-right' : 'opacity-0'
            }`} style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Trophy className="w-6 h-6 text-yellow-500 icon-spin" />
                  <span>Top Green Travelers</span>
                </h2>
                <div className="text-sm text-gray-500 flex items-center space-x-1">
                  <span>Live</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 card-hover group cursor-pointer ${
                      isVisible ? 'stagger-item' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 group-hover:scale-110 transition-transform duration-300">
                      {index === 0 && <Trophy className="w-6 h-6 text-yellow-500 icon-spin" />}
                      {index === 1 && <Medal className="w-6 h-6 text-gray-400 group-hover:scale-110 transition-transform duration-300" />}
                      {index === 2 && <Medal className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform duration-300" />}
                      {index > 2 && <span className="font-bold text-gray-400 group-hover:text-gray-600 transition-colors duration-300">#{index + 1}</span>}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 pulse-glow">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                        {user.username}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{user.points} pts</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Award className="w-3 h-3 text-purple-500" />
                          <span>{user.badges} badges</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Achievement Button */}
            <button 
              onClick={() => setShareModalOpen(true)}
              disabled={isSharing || shareableAchievements.length === 0}
              className={`btn-primary w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed focus-ring ${
                isVisible ? 'scale-in' : 'opacity-0'
              }`}
              style={{ animationDelay: '0.8s' }}
            >
              {isSharing ? (
                <>
                  <div className="spinner w-5 h-5"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Share className="w-5 h-5 icon-spin" />
                  <span>Share Achievement on Social Media</span>
                  <Sparkles className="w-5 h-5 icon-spin" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Share Your Achievement</h3>
                <button 
                  onClick={() => setShareModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {shareableAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Complete more achievements to unlock sharing!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shareableAchievements.map((achievement, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <p className="text-lg font-bold text-green-600">{achievement.value}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleShareAchievement(achievement)}
                          disabled={isSharing}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          <span>Post</span>
                        </button>
                        
                        <button
                          onClick={() => handleShareStory(achievement)}
                          disabled={isSharing}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Story</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h5 className="font-medium text-blue-900 mb-2">📱 How to Share:</h5>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li><strong>Post:</strong> Downloads image for social media feed</li>
                      <li><strong>Story:</strong> Downloads story-sized image</li>
                      <li>Open your social media app and upload the image</li>
                      <li>Add your caption and hashtags</li>
                      <li>Share with the world! 🌍</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;