import React from 'react';
import { User, Award, Leaf, Car, Bike, TreePine, Globe, Star, Trophy, Medal, Target, Zap } from 'lucide-react';

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
    username: '@you',
    profilePic: '👤',
    points: 2350,
    totalPoints: 5000,
    level: 'Green Explorer',
    co2Saved: 124,
    tripsCompleted: 45
  };

  const progressPercentage = (currentUser.points / currentUser.totalPoints) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-3xl">
              {currentUser.profilePic}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentUser.username}</h1>
              <p className="text-green-600 font-semibold">{currentUser.level}</p>
              <p className="text-gray-600">{currentUser.tripsCompleted} eco trips completed</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress to next level</span>
              <span className="text-sm font-medium text-green-600">{currentUser.points}/{currentUser.totalPoints} points</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Leaf className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-green-800 font-semibold">{currentUser.co2Saved}kg CO₂</p>
                  <p className="text-green-600 text-sm">Saved this month</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-blue-800 font-semibold">{currentUser.points} Points</p>
                  <p className="text-blue-600 text-sm">Total earned</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Medal className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-purple-800 font-semibold">{badges.filter(b => b.earned).length} Badges</p>
                  <p className="text-purple-600 text-sm">Unlocked</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Badges Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievement Badges</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      badge.earned
                        ? 'border-green-200 bg-white shadow-md'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      badge.earned ? badge.color : 'bg-gray-400'
                    }`}>
                      <div className="text-white">
                        {badge.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    {badge.earned && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Top Green Travelers</h2>
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <div key={user.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8">
                      {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                      {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                      {index === 2 && <Medal className="w-6 h-6 text-orange-500" />}
                      {index > 2 && <span className="font-bold text-gray-400">#{index + 1}</span>}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-lg">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.username}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{user.points} pts</span>
                        <span>•</span>
                        <span>{user.badges} badges</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Achievement Button */}
            <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
              <span>Share Achievement on Instagram</span>
              <Zap className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Achievements;