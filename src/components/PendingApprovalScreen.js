import React from 'react';
import { CheckCircle, Clock, Mail, Bell, ArrowLeft } from 'lucide-react';

const PendingApprovalScreen = ({
  type = 'organization', // 'organization', 'manager', 'employee'
  message,
  onBackToLogin
}) => {
  const getTitle = () => {
    switch (type) {
      case 'organization':
        return 'Organization Under Review';
      case 'manager':
        return 'Manager Registration Submitted';
      case 'employee':
        return 'Employee Registration Submitted';
      default:
        return 'Registration Submitted';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'organization':
        return 'Thank you for registering your organization with ClockWise Pro. Our team is currently reviewing your application.';
      case 'manager':
        return 'Your manager registration has been submitted successfully. The organization administrator will review your request.';
      case 'employee':
        return 'Your employee registration has been submitted successfully. Your manager will review your request.';
      default:
        return 'Your registration has been submitted and is under review.';
    }
  };

  const getApprover = () => {
    switch (type) {
      case 'organization':
        return 'ClockWise Pro Team';
      case 'manager':
        return 'Organization Administrator';
      case 'employee':
        return 'Your Manager';
      default:
        return 'Administrator';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-6">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {getTitle()}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 text-center mb-8">
            {message || getDescription()}
          </p>

          {/* Status Steps */}
          <div className="space-y-4 mb-8">
            {/* Step 1 - Completed */}
            <div className="flex items-start space-x-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900">Registration Submitted</h3>
                <p className="text-sm text-green-700">Your information has been received successfully</p>
              </div>
            </div>

            {/* Step 2 - In Progress */}
            <div className="flex items-start space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Under Review</h3>
                <p className="text-sm text-blue-700">
                  {getApprover()} is reviewing your application
                </p>
              </div>
            </div>

            {/* Step 3 - Pending */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 border border-gray-200 rounded-xl opacity-60">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Approval Notification</h3>
                <p className="text-sm text-gray-600">You'll receive an email once approved</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
            <div className="flex items-start space-x-3">
              <Bell className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Your application will be reviewed within 24-48 hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>You will receive an email notification once your account is approved</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>After approval, you can log in using your registered email and password</span>
                  </li>
                  {type === 'organization' && (
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>You'll get full access to the admin dashboard and can start adding team members</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onBackToLogin}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Login</span>
            </button>
          </div>

          {/* Support Contact */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Have questions?{' '}
              <a
                href="mailto:support@clockwisepro.com"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            You can close this page safely. We'll notify you via email when your account is ready.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalScreen;
