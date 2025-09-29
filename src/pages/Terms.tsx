import React from 'react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
            <p>
              By using GreenPath, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description of Service</h2>
            <p>
              GreenPath is an environmental impact tracking application that helps users 
              monitor and improve their sustainable transportation choices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">User Accounts</h2>
            <p>
              You may create an account using Instagram Login. You are responsible for 
              maintaining the confidentiality of your account information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptable Use</h2>
            <p>
              You agree to use GreenPath only for lawful purposes and in accordance with 
              these Terms of Service. You will not use the service to harm others or 
              violate any laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy to 
              understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
            <p>
              GreenPath is provided "as is" without warranties. We shall not be liable 
              for any direct, indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Users will be 
              notified of significant changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
            <p>
              For questions about these Terms of Service, contact us at: 
              support@greenpath.app
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

export default Terms;