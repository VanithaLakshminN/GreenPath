import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader, AlertCircle, User, Check } from 'lucide-react';
import { useAuth } from './AuthContext';

interface LocationState {
  facebookUserData?: any;
  socialUserData?: any;
  provider?: 'facebook';
}

const UsernameSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const facebookUserData = (location.state as LocationState)?.facebookUserData;
  const socialUserData = (location.state as LocationState)?.socialUserData;
  const provider = (location.state as LocationState)?.provider || 'facebook';
  
  // Use social data if available, otherwise fall back to Facebook data
  const userData = socialUserData || facebookUserData;
  const platformName = 'Facebook';

  // Redirect if no social media data
  React.useEffect(() => {
    if (!userData) {
      navigate('/login', { replace: true });
    }
  }, [userData, navigate]);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    try {
      // Simulate username availability check
      // In a real app, you'd check against your database
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, make usernames with numbers available
      const hasNumbers = /\d/.test(usernameToCheck);
      setIsAvailable(hasNumbers || usernameToCheck.length > 6);
    } catch (error) {
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    // Clean username: lowercase, alphanumeric and underscores only
    const cleanUsername = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanUsername);
    
    if (cleanUsername.length >= 3) {
      checkUsernameAvailability(cleanUsername);
    } else {
      setIsAvailable(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || !userData) return;

    setLoading(true);
    setError(null);

    try {
      // Create user data with custom username
      const finalUserData = {
        ...userData,
        username: username,
        // Ensure we have the Facebook ID field
        facebookId: userData.facebookId
      };

      await login(finalUserData);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Username setup failed:', error);
      setError('Failed to set up username. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const suggestUsername = (name: string) => {
    const base = name.toLowerCase().replace(/\s+/g, '_');
    const suggestions = [
      base,
      `${base}_${Math.floor(Math.random() * 100)}`,
      `${base}_gp`,
      `green_${base}`,
      `${base}_eco`
    ];
    return suggestions[0];
  };

  if (!userData) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Choose Your Username
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome {userData.fullName || userData.username}! Pick a unique username for your GreenPath profile.
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            Connected via {platformName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Enter your username"
                maxLength={20}
                minLength={3}
              />
              
              {/* Status indicator */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isChecking && <Loader className="h-5 w-5 text-gray-400 animate-spin" />}
                {!isChecking && isAvailable === true && <Check className="h-5 w-5 text-green-500" />}
                {!isChecking && isAvailable === false && <AlertCircle className="h-5 w-5 text-red-500" />}
              </div>
            </div>
            
            {/* Username feedback */}
            {username.length > 0 && (
              <div className="mt-2">
                {username.length < 3 && (
                  <p className="text-xs text-gray-500">Username must be at least 3 characters</p>
                )}
                {username.length >= 3 && isAvailable === true && (
                  <p className="text-xs text-green-600">✓ Username is available!</p>
                )}
                {username.length >= 3 && isAvailable === false && (
                  <p className="text-xs text-red-600">✗ Username is taken or invalid</p>
                )}
              </div>
            )}
          </div>

          {/* Username suggestions */}
          {username.length === 0 && (
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-xs text-gray-600 mb-2">Suggestion:</p>
              <button
                type="button"
                onClick={() => handleUsernameChange(suggestUsername(userData.fullName || userData.username))}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {suggestUsername(userData.fullName || userData.username)}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={!isAvailable || loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              'Complete Setup'
            )}
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              You can change your username later in settings
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsernameSetup;