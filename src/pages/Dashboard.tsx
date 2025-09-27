import React, { useEffect, useMemo, useState } from 'react';
import { Leaf, Award, Image as ImageIcon, Video as VideoIcon, User, TrendingUp, Calendar, MapPin, Clock, Zap, Star } from 'lucide-react';
import { listJourneys } from '../services/journeys';
import { awardPointsForDistance, badgesFromPoints } from '../services/gamification';
import { useAuth } from './AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [journeys, setJourneys] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!user) return; // Don't fetch if not logged in
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const userId = user.facebookId || user.instagramId || user.id || user.username;
        const js = await listJourneys(userId);
        if (!mounted) return;
        setJourneys(js);
      } catch (e) {
        setError('Failed to load journeys');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  const totals = useMemo(() => {
    const totalCo2 = journeys.reduce((a, j) => a + (j.co2SavedKg || 0), 0);
    const totalKm = journeys.reduce((a, j) => a + (j.metrics?.distanceKm || 0), 0);
    const points = awardPointsForDistance(totalKm);
    const badges = badgesFromPoints(points);
    return { totalCo2, points, badges };
  }, [journeys]);
  
  if (!user) {
    return <div className="p-8 text-center">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full opacity-10 blur-3xl float-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* User Profile Header */}
        <div className={`bg-white rounded-2xl shadow-lg p-6 mb-6 card-hover neon-glow relative overflow-hidden ${
          isVisible ? 'slide-in-up' : 'opacity-0'
        }`}>
          {/* Animated background pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.username}
                    className="w-16 h-16 rounded-full object-cover border-2 border-green-200 group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <User className={`w-16 h-16 text-gray-400 bg-gray-100 rounded-full p-3 border-2 border-green-200 group-hover:scale-110 transition-transform duration-300 ${user.profilePicture ? 'hidden' : ''}`} />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center pulse-glow">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                  Welcome back!
                </h1>
                <p className="text-lg text-gray-600 flex items-center space-x-2">
                  <span>@{user.username}</span>
                  <Zap className="w-4 h-4 text-yellow-500 icon-spin" />
                </p>
                {user.fullName && user.fullName !== user.username && (
                  <p className="text-sm text-gray-500">{user.fullName}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`bg-white rounded-xl p-6 shadow card-hover neon-glow group cursor-pointer ${
            isVisible ? 'stagger-item' : 'opacity-0'
          }`} style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 text-sm font-medium">Total CO₂ Saved</div>
              <Leaf className="w-6 h-6 text-green-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
            </div>
            <div className="text-2xl font-bold text-green-700 group-hover:text-green-600 transition-colors duration-300">
              {totals.totalCo2.toFixed(1)} kg
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full progress-bar" style={{ width: '75%' }}></div>
            </div>
          </div>
          
          <div className={`bg-white rounded-xl p-6 shadow card-hover neon-glow group cursor-pointer ${
            isVisible ? 'stagger-item' : 'opacity-0'
          }`} style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 text-sm font-medium">Points Earned</div>
              <TrendingUp className="w-6 h-6 text-blue-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
            </div>
            <div className="text-2xl font-bold text-blue-700 group-hover:text-blue-600 transition-colors duration-300">
              {totals.points}
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full progress-bar" style={{ width: '60%' }}></div>
            </div>
          </div>
          
          <div className={`bg-white rounded-xl p-6 shadow card-hover neon-glow group cursor-pointer ${
            isVisible ? 'stagger-item' : 'opacity-0'
          }`} style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 text-sm font-medium">Badges</div>
              <Award className="w-6 h-6 text-purple-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {totals.badges.length === 0 && (
                <span className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">No badges yet</span>
              )}
              {totals.badges.map((b, index) => (
                <span 
                  key={b.id} 
                  className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm group-hover:bg-purple-200 group-hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  <Award className="w-4 h-4 icon-spin" />
                  {b.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-2xl shadow p-6 card-hover neon-glow ${
          isVisible ? 'slide-in-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-green-500 icon-spin" />
              <span>Journey History</span>
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{journeys.length} trips</span>
            </div>
          </div>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="spinner w-8 h-8"></div>
              <span className="ml-3 text-gray-600">Loading your journeys...</span>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">⚠️ {error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Try again
              </button>
            </div>
          )}
          
          {!loading && journeys.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-600 mb-4">No journeys yet.</div>
              <div className="text-sm text-gray-500">Start your first eco-friendly trip to see it here!</div>
            </div>
          )}
          
          <div className="space-y-4">
            {journeys.map((j, index) => (
              <div 
                key={j.id} 
                className={`border rounded-xl p-4 card-hover group cursor-pointer ${
                  isVisible ? 'stagger-item' : 'opacity-0'
                }`}
                style={{ animationDelay: `${1 + index * 0.1}s` }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                    {j.sourceText} → {j.destinationText}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(j.completedAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700 mb-3">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span>{j.mode}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span>{j.metrics.distanceKm.toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>{(j.metrics.durationSeconds/60|0)} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Leaf className="w-4 h-4 text-green-600" />
                    <span>{j.metrics.co2Kg.toFixed(1)} kg CO₂</span>
                  </div>
                </div>
                
                {Array.isArray(j.media) && j.media.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {j.media.map((m: any, idx: number) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 group-hover:bg-green-100 group-hover:text-green-700 transition-colors duration-300"
                      >
                        {m.kind === 'photo' ? <ImageIcon className="w-3 h-3" /> : <VideoIcon className="w-3 h-3" />}
                        Media
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
