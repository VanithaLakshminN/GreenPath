import React from 'react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
            <p>
              When you use Instagram Login, we collect basic profile information including your Instagram username, 
              account type, and profile information as permitted by Instagram's Basic Display API.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
            <p>
              We use your Instagram information solely to provide you with a personalized experience in our 
              GreenPath application. This includes creating your user profile and tracking your environmental 
              impact journeys.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Services</h2>
            <p>
              Our application integrates with Instagram Basic Display API. Please review Instagram's 
              privacy policy for information about how they handle your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Deletion</h2>
            <p>
              You can request deletion of your data at any time by contacting us or disconnecting 
              your Instagram account from our application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: 
              privacy@greenpath.app
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link 
            to="/" 
            className="text-green-600 hover:text-green-500 font-medium"
          >
            ← Back to GreenPath
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;