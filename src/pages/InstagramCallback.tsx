import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import instagramAuthService from '../services/instagramAuth';

const InstagramCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { code, state, error } = instagramAuthService.handleCallback();
        
        if (error) {
          throw new Error(error);
        }
        
        if (!code || !state) {
          throw new Error('No authorization code or state received from Instagram');
        }

        const userData = await instagramAuthService.authenticateUser(code, state);
        
        // Redirect to username setup instead of auto-login
        navigate('/username-setup', { 
          replace: true,
          state: { 
            socialUserData: userData,
            provider: 'instagram'
          }
        });
      } catch (error) {
        console.error('Instagram authentication failed:', error);
        setError(error instanceof Error ? error.message : 'Instagram authentication failed');
        // Redirect to login page with error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, login]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl text-center">
          <div>
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-center text-xl font-medium text-gray-900">
              Authentication Failed
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {error}
            </p>
            <p className="mt-4 text-center text-xs text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl text-center">
        <div className="animate-pulse">
          <Loader className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
          <h2 className="mt-6 text-center text-xl font-medium text-gray-900">
            Completing Instagram Login...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we verify your Instagram account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstagramCallback;