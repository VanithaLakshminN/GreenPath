import React, { useState } from 'react';
import { Instagram, Leaf, AlertCircle, Loader, ExternalLink, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import instagramAuthService, { InstagramUserData } from '../services/instagramAuth';

const Login: React.FC = () => {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateAccountHelp, setShowCreateAccountHelp] = useState(false);

  const handleInstagramLogin = async () => {
    setError(null);
    
    if (!instagramAuthService.isConfigured()) {
      setError('Instagram authentication requires app credentials. Please configure your Instagram app in .env.local file. See setup instructions.');
      return;
    }

    // Check if we have valid credentials (not placeholder values)
    const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
    if (!clientId || clientId === '123456789' || clientId === 'your_instagram_client_id_here') {
      setError('Instagram app credentials are not configured. Please add your real Instagram Client ID and Secret to .env.local file.');
      return;
    }

    try {
      // Always use reauthenticate to allow account switching
      instagramAuthService.login(true);
    } catch (error) {
      console.error('Failed to initiate Instagram login:', error);
      setError('Failed to start Instagram authentication');
    }
  };

  const isLoading = loading || authLoading;

  const handleCreateInstagramAccount = () => {
    // Open Instagram signup page in a new window
    const signupUrl = 'https://www.instagram.com/accounts/emailsignup/';
    window.open(signupUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    // Show create account help
    setShowCreateAccountHelp(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl text-center">
        <div>
          <div className="mx-auto h-12 w-auto bg-green-500 rounded-full flex items-center justify-center">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Join GreenPath
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Log in to save your journeys, track your impact, and earn rewards!
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                  {error.includes('credentials') && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-800 font-medium mb-2">Quick Setup Guide:</p>
                      <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developer Console</a></li>
                        <li>Create an app and add Instagram Basic Display product</li>
                        <li>Get your Instagram App ID and Secret</li>
                        <li>Update .env.local with your Instagram credentials</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Instagram Options Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
            <p className="text-xs text-gray-600">
              📸 Have Instagram? Click pink button • No account? Click green button
            </p>
          </div>
          
          {/* Instagram Login Button */}
          <button
            onClick={handleInstagramLogin}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Connecting to Instagram...
              </>
            ) : (
              <>
                <Instagram className="w-5 h-5 mr-2" />
                Login with Instagram
              </>
            )}
          </button>
          
          {/* Create Instagram Account Button */}
          <button
            onClick={handleCreateInstagramAccount}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-green-300 text-sm font-medium rounded-md text-green-600 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Don't have Instagram? Create Account
            <ExternalLink className="w-3 h-3 ml-2" />
          </button>
          
          {/* Create Account Help */}
          {showCreateAccountHelp && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-800 font-medium mb-2">Creating Instagram Account:</p>
                  <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
                    <li>Instagram signup page opened in new window</li>
                    <li>Fill in your details to create new account</li>
                    <li>Verify your email/phone number</li>
                    <li>Come back and click "Login with Instagram"</li>
                  </ol>
                  <p className="text-xs text-green-600 mt-2 font-medium">💡 Tip: Keep this tab open while creating your account</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-sm text-center">
            <Link to="/" className="font-medium text-green-600 hover:text-green-500">
              Or continue as a guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;