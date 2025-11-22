import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Building2, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { signIn, signUp, registerOrganization, registerEmployee, searchOrganizations } from '../supabaseClient';

const InteractiveAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('choose'); // choose, login, signup, orgSetup, employeeSetup
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState(''); // organization, employee, manager

  // Organization search
  const [orgSearch, setOrgSearch] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when closed
      setStep('choose');
      setError('');
      setSuccess('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setUserType('');
      setOrgSearch('');
      setOrganizations([]);
      setSelectedOrg(null);
    }
  }, [isOpen]);

  // Search organizations as user types
  useEffect(() => {
    const searchOrgs = async () => {
      if (orgSearch.length >= 2) {
        const { organizations: orgs } = await searchOrganizations(orgSearch);
        setOrganizations(orgs || []);
      } else {
        setOrganizations([]);
      }
    };

    const debounce = setTimeout(searchOrgs, 300);
    return () => clearTimeout(debounce);
  }, [orgSearch]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          onSuccess(data.user);
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleQuickSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await signUp(email, password);

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      // Move to next step based on user type
      if (userType === 'organization') {
        setStep('orgSetup');
      } else {
        setStep('employeeSetup');
      }

      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .glassmorphism {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
          }
        `}
      </style>

      <div className="glassmorphism w-full max-w-md rounded-t-3xl shadow-2xl animate-slideUp" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="sticky top-0 glassmorphism p-6 border-b border-gray-200 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            {step === 'choose' && 'Welcome to ClockWise Pro'}
            {step === 'login' && 'Sign In'}
            {step === 'signup' && 'Create Account'}
            {step === 'orgSetup' && 'Organization Setup'}
            {step === 'employeeSetup' && 'Employee Setup'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Choose User Type */}
          {step === 'choose' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">Get started by choosing your account type</p>

              <button
                onClick={() => { setStep('login'); }}
                className="w-full p-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105"
              >
                I Have an Account
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or create new account</span>
                </div>
              </div>

              <button
                onClick={() => { setUserType('organization'); setStep('signup'); }}
                className="w-full p-6 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-500 transition">
                    <Building2 size={24} className="text-purple-600 group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-gray-800">Register Organization</h3>
                    <p className="text-sm text-gray-600">For business owners and administrators</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { setUserType('employee'); setStep('signup'); }}
                className="w-full p-6 bg-white border-2 border-cyan-200 rounded-xl hover:border-cyan-500 hover:shadow-lg transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-100 rounded-full group-hover:bg-cyan-500 transition">
                    <User size={24} className="text-cyan-600 group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-gray-800">Join as Employee</h3>
                    <p className="text-sm text-gray-600">For team members and staff</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Login Form */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('choose')}
                className="w-full text-center text-sm text-gray-600 hover:text-purple-600 transition"
              >
                ← Back to options
              </button>
            </form>
          )}

          {/* Signup Form */}
          {step === 'signup' && (
            <form onSubmit={handleQuickSignup} className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Continue'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('choose')}
                className="w-full text-center text-sm text-gray-600 hover:text-purple-600 transition"
              >
                ← Back to options
              </button>
            </form>
          )}

          {/* Success State */}
          {(step === 'orgSetup' || step === 'employeeSetup') && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Account Created!</h3>
              <p className="text-gray-600 mb-6">
                {userType === 'organization'
                  ? 'Your organization has been registered and is pending approval.'
                  : 'Your account has been created and is pending manager approval.'}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Got it!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveAuthModal;
