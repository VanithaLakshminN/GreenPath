import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface DeletionRequest {
  signed_request: string;
  user_id?: string;
  confirmation_code?: string;
}

const DataDeletionCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing data deletion request...');
  const [confirmationCode, setConfirmationCode] = useState<string>('');

  useEffect(() => {
    const handleDataDeletion = async () => {
      try {
        // Get signed_request from URL parameters
        const signedRequest = searchParams.get('signed_request');
        
        if (!signedRequest) {
          throw new Error('No signed request found');
        }

        // In a real implementation, you would:
        // 1. Verify the signed request with your app secret
        // 2. Parse the user data from the signed request
        // 3. Delete user data from your database
        // 4. Generate and return a confirmation code

        // For now, we'll simulate the process
        const mockDeletion = await simulateDataDeletion(signedRequest);
        
        setConfirmationCode(mockDeletion.confirmation_code);
        setStatus('success');
        setMessage('Data deletion request processed successfully');

      } catch (error) {
        console.error('Data deletion error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to process data deletion request');
      }
    };

    handleDataDeletion();
  }, [searchParams]);

  const simulateDataDeletion = async (signedRequest: string): Promise<{ confirmation_code: string }> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a unique confirmation code
    const confirmationCode = `DEL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real implementation, you would:
    // 1. Decode and verify the signed_request
    // 2. Extract user_id from the signed_request
    // 3. Delete user data from your database
    // 4. Log the deletion for compliance
    
    return { confirmation_code: confirmationCode };
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center">
            <Loader className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Processing Request
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Data Deletion Completed
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
            {confirmationCode && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Confirmation Code:</p>
                <p className="text-lg font-mono text-gray-700 mt-1">{confirmationCode}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Please save this confirmation code for your records
                </p>
              </div>
            )}
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Request Failed
            </h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                If this error persists, please contact our support team.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Return the response in the format Facebook expects
  if (status === 'success') {
    // For API calls from Facebook, return JSON response
    if (searchParams.get('format') === 'json') {
      return (
        <div style={{ display: 'none' }}>
          {JSON.stringify({
            url: `${window.location.origin}/auth/facebook/deauthorize/status?code=${confirmationCode}`,
            confirmation_code: confirmationCode
          })}
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        {renderContent()}
        
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-500 underline"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default DataDeletionCallback;