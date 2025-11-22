import React, { useState } from 'react';
import {
  registerOrganization,
  registerEmployee,
  getOrganizationCategories,
  getCountries,
  getTimezones,
  getDepartments,
  getBranches,
  searchOrganizations
} from '../supabaseClient';
import { Building, Shield, Users, Briefcase, MapPin, Globe, Clock, Phone, ChevronLeft, ChevronRight, Check, AlertCircle, Eye, EyeOff, Lock, Mail, User, Search, Building2 } from 'lucide-react';
import PendingApprovalScreen from './PendingApprovalScreen';

// Premium Input Component - Responsive
const PremiumInput = ({ label, type = 'text', value, onChange, placeholder, required, icon: Icon, hint, className = '' }) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={className}>
      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
        {Icon && (
          <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={16} className={`transition-colors duration-300 sm:hidden ${focused ? 'text-purple-500' : 'text-gray-400'}`} />
            <Icon size={18} className={`transition-colors duration-300 hidden sm:block ${focused ? 'text-purple-500' : 'text-gray-400'}`} />
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full ${Icon ? 'pl-9 sm:pl-11' : 'pl-3 sm:pl-4'} ${isPassword ? 'pr-10 sm:pr-12' : 'pr-3 sm:pr-4'} py-2.5 sm:py-3.5 bg-white border-2 border-gray-100 rounded-lg sm:rounded-xl
                     focus:border-purple-500 focus:outline-none transition-all duration-300 text-gray-800
                     placeholder-gray-400 font-medium text-xs sm:text-sm`}
          style={{ boxShadow: focused ? '0 4px 20px rgba(124,58,237,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={16} className="sm:hidden" /> : <Eye size={16} className="sm:hidden" />}
            {showPassword ? <EyeOff size={18} className="hidden sm:block" /> : <Eye size={18} className="hidden sm:block" />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1 sm:mt-1.5 text-2xs sm:text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

// Premium Select Component - Responsive
const PremiumSelect = ({ label, value, onChange, options, required, icon: Icon, className = '' }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={className}>
      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
        {Icon && (
          <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon size={16} className={`transition-colors duration-300 sm:hidden ${focused ? 'text-purple-500' : 'text-gray-400'}`} />
            <Icon size={18} className={`transition-colors duration-300 hidden sm:block ${focused ? 'text-purple-500' : 'text-gray-400'}`} />
          </div>
        )}
        <select
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full ${Icon ? 'pl-9 sm:pl-11' : 'pl-3 sm:pl-4'} pr-8 sm:pr-10 py-2.5 sm:py-3.5 bg-white border-2 border-gray-100 rounded-lg sm:rounded-xl
                     focus:border-purple-500 focus:outline-none transition-all duration-300 text-gray-800
                     font-medium text-xs sm:text-sm appearance-none cursor-pointer`}
          style={{ boxShadow: focused ? '0 4px 20px rgba(124,58,237,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronRight size={16} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none sm:hidden" />
        <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none hidden sm:block" />
      </div>
    </div>
  );
};

// ============================================================================
// PASSWORD STRENGTH METER COMPONENT
// ============================================================================

const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };

    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(pwd)
    };

    // Score based on criteria met
    if (checks.length) score += 1;
    if (checks.lowercase) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.numbers) score += 1;
    if (checks.special) score += 1;

    // Bonus for longer passwords
    if (pwd.length >= 12) score += 0.5;
    if (pwd.length >= 16) score += 0.5;

    // Determine strength level
    if (score <= 2) return { score: 1, label: 'Weak', color: 'red', width: '25%', bgColor: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'orange', width: '50%', bgColor: 'bg-orange-500' };
    if (score <= 4.5) return { score: 3, label: 'Strong', color: 'yellow', width: '75%', bgColor: 'bg-yellow-500' };
    return { score: 4, label: 'Very Strong', color: 'green', width: '100%', bgColor: 'bg-green-500' };
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {/* Strength Bar */}
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.bgColor} transition-all duration-500 ease-out`}
          style={{ width: strength.width }}
        />
      </div>
      {/* Strength Label */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${
          strength.color === 'red' ? 'text-red-600' :
          strength.color === 'orange' ? 'text-orange-600' :
          strength.color === 'yellow' ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {strength.label}
        </span>
        <span className="text-xs text-gray-500">
          {password.length < 8 ? `${8 - password.length} more chars needed` : 'Min. 8 characters'}
        </span>
      </div>
      {/* Requirements */}
      <div className="flex flex-wrap gap-1.5 mt-1">
        {[
          { met: password.length >= 8, label: '8+ chars' },
          { met: /[a-z]/.test(password), label: 'lowercase' },
          { met: /[A-Z]/.test(password), label: 'uppercase' },
          { met: /[0-9]/.test(password), label: 'number' },
          { met: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password), label: 'special' }
        ].map((req, idx) => (
          <span
            key={idx}
            className={`text-[10px] px-1.5 py-0.5 rounded-full transition-all duration-300 ${
              req.met
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            {req.met ? '✓' : '○'} {req.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// ENHANCED MANAGER REGISTRATION FORM
// ============================================================================

export const EnhancedManagerRegistrationForm = ({ onSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPendingScreen, setShowPendingScreen] = useState(false);
  const [pendingType, setPendingType] = useState('manager'); // 'manager' or 'organization'
  const [registrationMode, setRegistrationMode] = useState(''); // 'join' or 'create'

  // For joining existing org
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // For creating new org
  const [orgData, setOrgData] = useState({
    organizationName: '',
    organizationSlug: '',
    organizationCategory: 'corporate',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    timezone: 'America/New_York'
  });

  // Manager personal data
  const [formData, setFormData] = useState({
    organizationId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: 'Manager',
    departmentId: '',
    branchId: '',
    employeeNumber: '',
    password: '',
    confirmPassword: ''
  });

  const categories = getOrganizationCategories();
  const countries = getCountries();
  const timezones = getTimezones();

  const handleOrgSearch = async () => {
    if (searchQuery.length < 2) {
      setSearchError('Please enter at least 2 characters to search');
      return;
    }

    setSearchError('');
    setSearchLoading(true);

    try {
      const { organizations: orgs, error } = await searchOrganizations(searchQuery);

      if (error) {
        setSearchError('Failed to search organizations. Please try again.');
        setOrganizations([]);
      } else {
        setOrganizations(orgs || []);
        if (orgs?.length === 0) {
          setSearchError('No organizations found. Try a different search term.');
        }
      }
    } catch (err) {
      console.error('Organization search error:', err);
      setSearchError('An error occurred while searching. Please try again.');
      setOrganizations([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOrgSelect = async (org) => {
    setSelectedOrg(org);
    setSearchError('');
    setFormData({...formData, organizationId: org.id});

    try {
      const { departments: depts } = await getDepartments(org.id);
      const { branches: brnches } = await getBranches(org.id);
      setDepartments(depts || []);
      setBranches(brnches || []);
    } catch (err) {
      console.error('Error loading organization data:', err);
    }
  };

  const handleOrgNameChange = (e) => {
    const name = e.target.value;
    setOrgData({
      ...orgData,
      organizationName: name,
      organizationSlug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      if (registrationMode === 'create') {
        // Validation for org creation
        if (!orgData.organizationName.trim() || !orgData.addressLine1.trim() || !orgData.city.trim()) {
          setError('Please fill in all required organization fields');
          setLoading(false);
          return;
        }

        // Create new organization with manager as admin
        const result = await registerOrganization({
          organizationName: orgData.organizationName,
          organizationSlug: orgData.organizationSlug,
          organizationCategory: orgData.organizationCategory,
          organizationAddress: orgData.addressLine1,
          organizationCity: orgData.city,
          organizationState: orgData.state,
          organizationPostalCode: orgData.postalCode,
          organizationCountry: orgData.country,
          organizationTimezone: orgData.timezone,
          adminEmail: formData.email,
          adminPassword: formData.password,
          adminFirstName: formData.firstName,
          adminLastName: formData.lastName,
          adminPhone: formData.phone
        });

        if (result.success) {
          setSuccess(result.message || 'Organization created! Awaiting approval...');
          setPendingType('organization');
          setShowPendingScreen(true);
        } else {
          setError(result.error || 'Registration failed. Please check your details and try again.');
          setLoading(false);
          return;
        }
      } else {
        // Join existing organization as manager
        if (!selectedOrg) {
          setError('Please search and select your organization');
          setLoading(false);
          return;
        }

        const result = await registerEmployee({
          organizationId: formData.organizationId,
          email: formData.email,
          phone: formData.phone,
          firstName: formData.firstName,
          lastName: formData.lastName,
          jobTitle: formData.jobTitle,
          departmentId: formData.departmentId,
          branchId: formData.branchId,
          employeeNumber: formData.employeeNumber,
          password: formData.password,
          role: 'manager'
        });

        if (result.success) {
          setSuccess(result.message || 'Registration submitted! Awaiting administrator approval.');
          setPendingType('manager');
          setShowPendingScreen(true);
        } else {
          setError(result.error || 'Registration failed. Please check your details and try again.');
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show pending approval screen if registration was successful
  if (showPendingScreen) {
    return (
      <PendingApprovalScreen
        type={pendingType}
        message={success}
        onBackToLogin={onSuccess}
      />
    );
  }

  // If no mode selected, show mode selection
  if (!registrationMode) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-5 py-4 sm:py-6">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 mb-4 sm:mb-6 rounded-lg sm:rounded-xl bg-white/60 backdrop-blur-sm
                       border border-gray-200/50 hover:bg-white/80 transition-all duration-300 group"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <ChevronLeft size={16} className="text-gray-600 group-hover:-translate-x-0.5 transition-transform sm:hidden" />
            <ChevronLeft size={18} className="text-gray-600 group-hover:-translate-x-0.5 transition-transform hidden sm:block" />
            <span className="text-xs sm:text-sm font-medium text-gray-600">Back</span>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl mb-3 sm:mb-4"
               style={{
                 background: 'linear-gradient(165deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%)',
                 boxShadow: '0 8px 24px rgba(124,58,237,0.35)'
               }}>
            <Shield size={22} className="text-white sm:hidden" />
            <Shield size={26} className="text-white hidden sm:block" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-1.5 sm:mb-2">
            Manager Registration
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-medium">
            Choose how you want to join as a manager
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <button
            onClick={() => setRegistrationMode('join')}
            className="w-full text-left bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5
                       transition-all duration-300 hover:scale-[1.02] group"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)' }}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center
                              bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100
                              group-hover:from-purple-500 group-hover:to-indigo-600 transition-all duration-300">
                <Building size={20} className="text-purple-600 group-hover:text-white transition-colors sm:hidden" />
                <Building size={24} className="text-purple-600 group-hover:text-white transition-colors hidden sm:block" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5 sm:mb-1 gap-2">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">Join Existing Organization</h3>
                  <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0 sm:hidden" />
                  <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0 hidden sm:block" />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1.5 sm:mb-2">
                  Your organization is already using ClockWise Pro
                </p>
                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs font-medium bg-purple-100 text-purple-700">
                  Requires approval
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setRegistrationMode('create')}
            className="w-full text-left bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5
                       transition-all duration-300 hover:scale-[1.02] group"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)' }}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center
                              bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100
                              group-hover:from-purple-500 group-hover:to-indigo-600 transition-all duration-300">
                <Building2 size={20} className="text-purple-600 group-hover:text-white transition-colors sm:hidden" />
                <Building2 size={24} className="text-purple-600 group-hover:text-white transition-colors hidden sm:block" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5 sm:mb-1 gap-2">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">Create New Organization</h3>
                  <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0 sm:hidden" />
                  <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0 hidden sm:block" />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1.5 sm:mb-2">
                  Set up your company and become the administrator
                </p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  Instant access
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50"
             style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50
                            flex items-center justify-center border border-purple-100">
              <Shield size={18} className="text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Manager Privileges</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                As a manager, you'll have access to team oversight, approval workflows, and detailed reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button
          onClick={() => {
            setRegistrationMode('');
            setError('');
            setSuccess('');
          }}
          className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
        >
          ← Back
        </button>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Shield size={32} className="text-purple-600" />
        {registrationMode === 'create' ? 'Create Organization' : 'Join as Manager'}
      </h2>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* JOIN MODE: Organization Search */}
        {registrationMode === 'join' && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Building size={20} className="text-purple-600" />
              Find Your Organization
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchError(''); }}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleOrgSearch())}
                disabled={searchLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                placeholder="Search by organization name..."
              />
              <button
                type="button"
                onClick={handleOrgSearch}
                disabled={searchLoading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searchLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
            </div>

            {/* Search Error/Info Message */}
            {searchError && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                {searchError}
              </div>
            )}

            {organizations.length > 0 && (
              <div className="space-y-2">
                {organizations.map(org => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => handleOrgSelect(org)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      selectedOrg?.id === org.id
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <p className="font-semibold">{org.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{org.category}</p>
                  </button>
                ))}
              </div>
            )}

            {selectedOrg && (
              <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm text-green-800 font-semibold">✓ Selected: {selectedOrg.name}</p>
              </div>
            )}
          </div>
        )}

        {/* CREATE MODE: Organization Details */}
        {registrationMode === 'create' && (
          <>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building size={20} className="text-purple-600" />
                Organization Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    value={orgData.organizationName}
                    onChange={handleOrgNameChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter organization name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    value={orgData.organizationSlug}
                    onChange={(e) => setOrgData({...orgData, organizationSlug: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="organization-slug"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    clockwise.app/{orgData.organizationSlug || 'your-org'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                    <select
                      value={orgData.organizationCategory}
                      onChange={(e) => setOrgData({...orgData, organizationCategory: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone *</label>
                    <select
                      value={orgData.timezone}
                      onChange={(e) => setOrgData({...orgData, timezone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      {timezones.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    value={orgData.addressLine1}
                    onChange={(e) => setOrgData({...orgData, addressLine1: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={orgData.city}
                      onChange={(e) => setOrgData({...orgData, city: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="City"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={orgData.state}
                      onChange={(e) => setOrgData({...orgData, state: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="State"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      value={orgData.postalCode}
                      onChange={(e) => setOrgData({...orgData, postalCode: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="12345"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <select
                    value={orgData.country}
                    onChange={(e) => setOrgData({...orgData, country: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    {countries.map(country => (
                      <option key={country.value} value={country.value}>{country.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Show personal details after org is selected (join mode) or always show (create mode) */}
        {(registrationMode === 'create' || selectedOrg) && (
          <>
            {/* Personal Information */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-purple-600" />
                Your Information
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Operations Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
                    <input
                      type="text"
                      value={formData.employeeNumber}
                      onChange={(e) => setFormData({...formData, employeeNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Department & Branch (only for join mode) */}
                {registrationMode === 'join' && departments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {registrationMode === 'join' && branches.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch/Location</label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.name} - {branch.city}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Minimum 8 characters"
                    required
                  />
                  <PasswordStrengthMeter password={formData.password} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className={`${registrationMode === 'create' ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
              <p className={`text-sm flex items-center gap-2 ${registrationMode === 'create' ? 'text-purple-800' : 'text-blue-800'}`}>
                <Shield size={16} />
                {registrationMode === 'create'
                  ? 'You will be the organization administrator with full access.'
                  : 'Your registration requires approval from your organization administrator.'}
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : registrationMode === 'create'
                  ? 'Create Organization & Register'
                  : 'Submit Manager Registration'}
            </button>
          </>
        )}
      </form>

      {onBack && (
        <button onClick={onBack} className="mt-4 text-sm text-gray-600 hover:text-gray-800">
          ← Back to account type selection
        </button>
      )}
    </div>
  );
};

// ============================================================================
// ENHANCED EMPLOYEE REGISTRATION FORM
// ============================================================================

export const EnhancedEmployeeRegistrationForm = ({ onSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPendingScreen, setShowPendingScreen] = useState(false);

  // For joining existing org
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Employee personal data - ALL database fields
  const [formData, setFormData] = useState({
    organizationId: '',
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    jobTitle: '',
    departmentId: '',
    branchId: '',
    employeeNumber: '',
    dateOfBirth: '',
    gender: '',
    // Address fields
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'CMR',
    timezone: 'Africa/Douala',
    // Emergency contact fields
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    // Password
    password: '',
    confirmPassword: ''
  });

  const handleOrgSearch = async () => {
    if (searchQuery.length < 2) {
      setSearchError('Please enter at least 2 characters to search');
      return;
    }

    setSearchError('');
    setSearchLoading(true);

    try {
      const { organizations: orgs, error } = await searchOrganizations(searchQuery);

      if (error) {
        setSearchError('Failed to search organizations. Please try again.');
        setOrganizations([]);
      } else {
        setOrganizations(orgs || []);
        if (orgs?.length === 0) {
          setSearchError('No organizations found. Try a different search term.');
        }
      }
    } catch (err) {
      console.error('Organization search error:', err);
      setSearchError('An error occurred while searching. Please try again.');
      setOrganizations([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOrgSelect = async (org) => {
    setSelectedOrg(org);
    setSearchError('');
    setFormData({...formData, organizationId: org.id});

    try {
      const { departments: depts } = await getDepartments(org.id);
      const { branches: brnches } = await getBranches(org.id);
      setDepartments(depts || []);
      setBranches(brnches || []);
    } catch (err) {
      console.error('Error loading organization data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!selectedOrg) {
      setError('Please search and select your organization');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      // Join existing organization as employee - with ALL fields
      const result = await registerEmployee({
        organizationId: formData.organizationId,
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        jobTitle: formData.jobTitle,
        departmentId: formData.departmentId,
        branchId: formData.branchId,
        employeeNumber: formData.employeeNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        // Address fields
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        timezone: formData.timezone,
        // Emergency contact
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelationship: formData.emergencyContactRelationship,
        password: formData.password,
        role: 'employee'
      });

      if (result.success) {
        setSuccess(result.message || 'Registration submitted! Awaiting manager approval.');
        setShowPendingScreen(true);
      } else {
        setError(result.error || 'Registration failed. Please check your details and try again.');
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Employee registration error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show pending approval screen if registration was successful
  if (showPendingScreen) {
    return (
      <PendingApprovalScreen
        type="employee"
        message={success}
        onBackToLogin={onSuccess}
      />
    );
  }

  // Employee registration form (join existing organization only)
  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        <Users size={24} className="text-teal-600 sm:hidden" />
        <Users size={32} className="text-teal-600 hidden sm:block" />
        Employee Registration
      </h2>

      {error && <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs sm:text-sm">{error}</div>}
      {success && <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-xs sm:text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Organization Search */}
        <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-teal-200">
          <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Building size={18} className="text-teal-600 sm:hidden" />
            <Building size={20} className="text-teal-600 hidden sm:block" />
            Find Your Organization
          </h3>
          <div className="flex flex-col xs:flex-row gap-2 mb-2 sm:mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchError(''); }}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleOrgSearch())}
              disabled={searchLoading}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 text-sm sm:text-base"
              placeholder="Search by organization name..."
            />
            <button
              type="button"
              onClick={handleOrgSearch}
              disabled={searchLoading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {searchLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden xs:inline">Searching...</span>
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Search Error/Info Message */}
          {searchError && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              {searchError}
            </div>
          )}

          {organizations.length > 0 && (
            <div className="space-y-2">
              {organizations.map(org => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleOrgSelect(org)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    selectedOrg?.id === org.id
                      ? 'border-teal-500 bg-teal-100'
                      : 'border-gray-200 bg-white hover:border-teal-300'
                  }`}
                >
                  <p className="font-semibold">{org.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{org.category}</p>
                </button>
              ))}
            </div>
          )}

          {selectedOrg && (
            <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-sm text-green-800 font-semibold">✓ Selected: {selectedOrg.name}</p>
            </div>
          )}
        </div>

        {/* Employee Personal Details - Show after organization is selected */}
        {selectedOrg && (
          <>
            {/* Personal Information */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-teal-600" />
                Your Information
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Cashier, Nurse, Engineer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
                    <input
                      type="text"
                      value={formData.employeeNumber}
                      onChange={(e) => setFormData({...formData, employeeNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="If assigned"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="How you'd like to be called"
                  />
                </div>

                {/* Department & Branch */}
                {departments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {branches.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch/Location</label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.name} - {branch.city}</option>
                      ))}
                    </select>
                  </div>
                )}

              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-teal-600" />
                Home Address
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({...formData, addressLine2: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="State or province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="ZIP or postal code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="CMR">Cameroon</option>
                      <option value="USA">United States</option>
                      <option value="CAN">Canada</option>
                      <option value="GBR">United Kingdom</option>
                      <option value="NGA">Nigeria</option>
                      <option value="ZAF">South Africa</option>
                      <option value="KEN">Kenya</option>
                      <option value="FRA">France</option>
                      <option value="DEU">Germany</option>
                      <option value="CHN">China</option>
                      <option value="IND">India</option>
                      <option value="JPN">Japan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Africa/Douala">West Africa Time (WAT) - Cameroon</option>
                    <option value="Africa/Lagos">West Africa Time (WAT) - Nigeria</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Africa/Johannesburg">South Africa (SAST)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">China (CST)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Phone size={20} className="text-teal-600" />
                Emergency Contact
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <select
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => setFormData({...formData, emergencyContactRelationship: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select Relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="partner">Partner</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="+237 XXX XXX XXX"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-teal-600" />
                Account Security
              </h3>

              <div className="space-y-4">

                <div className="border-t pt-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Minimum 8 characters"
                      required
                    />
                    <PasswordStrengthMeter password={formData.password} />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border-blue-200 border rounded-lg p-4">
              <p className="text-sm flex items-center gap-2 text-blue-800">
                <Shield size={16} />
                Your registration requires approval from your manager before you can clock in.
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-400 transition-colors"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit Employee Registration'}
            </button>
          </>
        )}
      </form>

      {onBack && (
        <button onClick={onBack} className="mt-4 text-sm text-gray-600 hover:text-gray-800">
          ← Back to account type selection
        </button>
      )}
    </div>
  );
};
