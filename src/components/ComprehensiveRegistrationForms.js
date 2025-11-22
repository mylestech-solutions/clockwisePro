import React, { useState, useEffect } from 'react';
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
import { Building, MapPin, Globe, Clock, Shield, User, Mail, Phone, Briefcase, Users, ChevronLeft, ChevronRight, Check, AlertCircle, Eye, EyeOff, Lock, Building2 } from 'lucide-react';
import PendingApprovalScreen from './PendingApprovalScreen';

// Premium Input Component
const PremiumInput = ({ label, type = 'text', value, onChange, placeholder, required, icon: Icon, hint, className = '' }) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={18} className={`transition-colors duration-300 ${focused ? 'text-teal-500' : 'text-gray-400'}`} />
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
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'} py-3.5 bg-white border-2 border-gray-100 rounded-xl
                     focus:border-teal-500 focus:outline-none transition-all duration-300 text-gray-800
                     placeholder-gray-400 font-medium text-sm`}
          style={{ boxShadow: focused ? '0 4px 20px rgba(13,148,136,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

// Premium Select Component
const PremiumSelect = ({ label, value, onChange, options, required, icon: Icon, className = '' }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon size={18} className={`transition-colors duration-300 ${focused ? 'text-teal-500' : 'text-gray-400'}`} />
          </div>
        )}
        <select
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl
                     focus:border-teal-500 focus:outline-none transition-all duration-300 text-gray-800
                     font-medium text-sm appearance-none cursor-pointer`}
          style={{ boxShadow: focused ? '0 4px 20px rgba(13,148,136,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

// Premium Textarea Component
const PremiumTextarea = ({ label, value, onChange, placeholder, rows = 3, className = '' }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl
                   focus:border-teal-500 focus:outline-none transition-all duration-300 text-gray-800
                   placeholder-gray-400 font-medium text-sm resize-none"
        style={{ boxShadow: focused ? '0 4px 20px rgba(13,148,136,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
      />
    </div>
  );
};

// Step Progress Component
const StepProgress = ({ currentStep, totalSteps, steps }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-3">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              index + 1 < currentStep
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                : index + 1 === currentStep
                ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
                 style={{ boxShadow: index + 1 <= currentStep ? '0 4px 12px rgba(13,148,136,0.25)' : 'none' }}>
              {index + 1 < currentStep ? <Check size={18} /> : index + 1}
            </div>
            <span className={`mt-2 text-xs font-medium ${index + 1 === currentStep ? 'text-teal-600' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
              index + 1 < currentStep ? 'bg-emerald-400' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// ============================================================================
// ORGANIZATION REGISTRATION FORM
// ============================================================================

export const OrganizationRegistrationForm = ({ onSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPendingScreen, setShowPendingScreen] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form

  // Organization Information
  const [orgData, setOrgData] = useState({
    organizationName: '',
    organizationSlug: '',
    organizationCategory: 'corporate',
    description: '',
    email: '',
    phone: '',
    website: '',
    taxId: '',
    registrationNumber: ''
  });

  // Address Information
  const [addressData, setAddressData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA'
  });

  // Settings
  const [settingsData, setSettingsData] = useState({
    timezone: 'America/New_York',
    currency: 'USD',
    requireGPS: true,
    requirePhoto: false,
    maxClockInDistance: 100
  });

  // Admin Information
  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const categories = getOrganizationCategories();
  const countries = getCountries();
  const timezones = getTimezones();

  // Auto-generate slug from organization name
  const handleOrgNameChange = (e) => {
    const name = e.target.value;
    setOrgData({
      ...orgData,
      organizationName: name,
      organizationSlug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    });
  };

  const validateStep1 = () => {
    if (!orgData.organizationName.trim()) {
      setError('Organization name is required');
      return false;
    }
    if (!orgData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Valid organization email is required');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!addressData.addressLine1.trim()) {
      setError('Street address is required');
      return false;
    }
    if (!addressData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!addressData.postalCode.trim()) {
      setError('Postal code is required');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep3 = () => {
    if (!adminData.firstName.trim() || !adminData.lastName.trim()) {
      setError('Admin first and last name are required');
      return false;
    }
    if (!adminData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Valid admin email is required');
      return false;
    }
    if (adminData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (adminData.password !== adminData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep3()) return;

    setLoading(true);
    setError('');

    try {
      const result = await registerOrganization({
        // Organization details
        organizationName: orgData.organizationName,
        organizationSlug: orgData.organizationSlug,
        organizationCategory: orgData.organizationCategory,

        // Address details
        organizationAddress: addressData.addressLine1,
        organizationCity: addressData.city,
        organizationState: addressData.state,
        organizationPostalCode: addressData.postalCode,
        organizationCountry: addressData.country,
        organizationTimezone: settingsData.timezone,

        // Admin details
        adminEmail: adminData.email,
        adminPassword: adminData.password,
        adminFirstName: adminData.firstName,
        adminLastName: adminData.lastName,
        adminPhone: adminData.phone
      });

      if (result.success) {
        setSuccess(result.message || 'Organization registered successfully!');
        // Show pending approval screen instead of redirecting to login
        if (result.requiresApproval) {
          setShowPendingScreen(true);
        } else {
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 2000);
        }
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show pending approval screen if registration was successful
  if (showPendingScreen) {
    return (
      <PendingApprovalScreen
        type="organization"
        message={success}
        onBackToLogin={onSuccess}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 mb-6 rounded-xl bg-white/60 backdrop-blur-sm
                     border border-gray-200/50 hover:bg-white/80 transition-all duration-300 group"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <ChevronLeft size={18} className="text-gray-600 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium text-gray-600">Back</span>
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
             style={{
               background: 'linear-gradient(165deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
               boxShadow: '0 8px 24px rgba(13,148,136,0.35)'
             }}>
          <Building2 size={26} className="text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-1">
          Register Organization
        </h1>
        <p className="text-gray-500 text-sm font-medium">Set up your company on ClockWise Pro</p>
      </div>

      {/* Progress Indicator */}
      <StepProgress
        currentStep={step}
        totalSteps={3}
        steps={['Organization', 'Address', 'Admin']}
      />

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <Check size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-800 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6"
           style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSubmit}>
          {/* STEP 1: Organization Information */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center border border-teal-100">
                  <Building size={20} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Organization Details</h2>
                  <p className="text-xs text-gray-500">Basic information about your company</p>
                </div>
              </div>

              <PremiumInput
                label="Organization Name"
                value={orgData.organizationName}
                onChange={handleOrgNameChange}
                placeholder="Enter your organization name"
                required
                icon={Building}
              />

              <PremiumInput
                label="Organization Slug (URL Identifier)"
                value={orgData.organizationSlug}
                onChange={(e) => setOrgData({...orgData, organizationSlug: e.target.value})}
                placeholder="your-organization"
                required
                hint={`Used in URLs: clockwise.app/${orgData.organizationSlug || 'your-org'}`}
              />

              <PremiumSelect
                label="Industry/Category"
                value={orgData.organizationCategory}
                onChange={(e) => setOrgData({...orgData, organizationCategory: e.target.value})}
                options={categories}
                required
                icon={Briefcase}
              />

              <PremiumTextarea
                label="Description"
                value={orgData.description}
                onChange={(e) => setOrgData({...orgData, description: e.target.value})}
                placeholder="Brief description of your organization"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PremiumInput
                  label="Organization Email"
                  type="email"
                  value={orgData.email}
                  onChange={(e) => setOrgData({...orgData, email: e.target.value})}
                  placeholder="contact@organization.com"
                  required
                  icon={Mail}
                />
                <PremiumInput
                  label="Phone Number"
                  type="tel"
                  value={orgData.phone}
                  onChange={(e) => setOrgData({...orgData, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                  icon={Phone}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PremiumInput
                  label="Website"
                  type="url"
                  value={orgData.website}
                  onChange={(e) => setOrgData({...orgData, website: e.target.value})}
                  placeholder="https://www.organization.com"
                  icon={Globe}
                />
                <PremiumInput
                  label="Tax ID / EIN"
                  value={orgData.taxId}
                  onChange={(e) => setOrgData({...orgData, taxId: e.target.value})}
                  placeholder="XX-XXXXXXX"
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full py-4 text-white rounded-xl font-bold text-sm
                           transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-4 group"
                style={{
                  background: 'linear-gradient(165deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
                  boxShadow: '0 4px 20px rgba(13,148,136,0.35)'
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  Continue to Address
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          )}

          {/* STEP 2: Address Information */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center border border-teal-100">
                  <MapPin size={20} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Organization Address</h2>
                  <p className="text-xs text-gray-500">Where is your organization located?</p>
                </div>
              </div>

              <PremiumInput
                label="Street Address"
                value={addressData.addressLine1}
                onChange={(e) => setAddressData({...addressData, addressLine1: e.target.value})}
                placeholder="123 Main Street"
                required
                icon={MapPin}
              />

              <PremiumInput
                label="Address Line 2"
                value={addressData.addressLine2}
                onChange={(e) => setAddressData({...addressData, addressLine2: e.target.value})}
                placeholder="Suite, Floor, Building (optional)"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PremiumInput
                  label="City"
                  value={addressData.city}
                  onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                  placeholder="City"
                  required
                />
                <PremiumInput
                  label="State/Province"
                  value={addressData.state}
                  onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                  placeholder="State"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PremiumInput
                  label="Postal Code"
                  value={addressData.postalCode}
                  onChange={(e) => setAddressData({...addressData, postalCode: e.target.value})}
                  placeholder="12345"
                  required
                />
                <PremiumSelect
                  label="Country"
                  value={addressData.country}
                  onChange={(e) => setAddressData({...addressData, country: e.target.value})}
                  options={countries}
                  required
                  icon={Globe}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PremiumSelect
                  label="Timezone"
                  value={settingsData.timezone}
                  onChange={(e) => setSettingsData({...settingsData, timezone: e.target.value})}
                  options={timezones}
                  required
                  icon={Clock}
                />
                <PremiumSelect
                  label="Currency"
                  value={settingsData.currency}
                  onChange={(e) => setSettingsData({...settingsData, currency: e.target.value})}
                  options={[
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'EUR', label: 'EUR - Euro' },
                    { value: 'GBP', label: 'GBP - British Pound' },
                    { value: 'CAD', label: 'CAD - Canadian Dollar' },
                    { value: 'AUD', label: 'AUD - Australian Dollar' },
                    { value: 'INR', label: 'INR - Indian Rupee' },
                    { value: 'NGN', label: 'NGN - Nigerian Naira' }
                  ]}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm
                             hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3.5 text-white rounded-xl font-bold text-sm
                             transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                  style={{
                    background: 'linear-gradient(165deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
                    boxShadow: '0 4px 20px rgba(13,148,136,0.35)'
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    Continue <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Administrator Account */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center border border-teal-100">
                  <Shield size={20} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Administrator Account</h2>
                  <p className="text-xs text-gray-500">Your admin credentials for full access</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PremiumInput
                  label="First Name"
                  value={adminData.firstName}
                  onChange={(e) => setAdminData({...adminData, firstName: e.target.value})}
                  placeholder="First Name"
                  required
                  icon={User}
                />
                <PremiumInput
                  label="Last Name"
                  value={adminData.lastName}
                  onChange={(e) => setAdminData({...adminData, lastName: e.target.value})}
                  placeholder="Last Name"
                  required
                  icon={User}
                />
              </div>

              <PremiumInput
                label="Email Address"
                type="email"
                value={adminData.email}
                onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                placeholder="admin@organization.com"
                required
                icon={Mail}
              />

              <PremiumInput
                label="Phone Number"
                type="tel"
                value={adminData.phone}
                onChange={(e) => setAdminData({...adminData, phone: e.target.value})}
                placeholder="+1 (555) 123-4567"
                icon={Phone}
              />

              <PremiumInput
                label="Password"
                type="password"
                value={adminData.password}
                onChange={(e) => setAdminData({...adminData, password: e.target.value})}
                placeholder="Minimum 8 characters"
                required
                icon={Lock}
                hint="Use a strong password with letters, numbers, and symbols"
              />

              <PremiumInput
                label="Confirm Password"
                type="password"
                value={adminData.confirmPassword}
                onChange={(e) => setAdminData({...adminData, confirmPassword: e.target.value})}
                placeholder="Re-enter password"
                required
                icon={Lock}
              />

              {/* Info Banner */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-teal-800 font-medium">
                    You will be the primary administrator with full access to manage your organization.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm
                             hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 text-white rounded-xl font-bold text-sm
                             transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: 'linear-gradient(165deg, #059669 0%, #10b981 50%, #34d399 100%)',
                    boxShadow: '0 4px 20px rgba(5,150,105,0.35)'
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Check size={18} /> Complete Registration
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// MANAGER REGISTRATION FORM
// ============================================================================

export const ManagerRegistrationForm = ({ onSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registrationMode, setRegistrationMode] = useState(''); // 'join' or 'create'
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);

  // Organization creation data (if creating new org)
  const [orgData, setOrgData] = useState({
    organizationName: '',
    organizationSlug: '',
    organizationCategory: 'corporate',
    email: '',
    phone: '',
    website: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    timezone: 'America/New_York'
  });

  const [formData, setFormData] = useState({
    organizationId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: 'Manager',
    departmentId: '',
    branchId: '',
    password: '',
    confirmPassword: ''
  });

  const categories = getOrganizationCategories();
  const countries = getCountries();
  const timezones = getTimezones();

  const handleOrgSearch = async () => {
    if (searchQuery.length < 2) return;

    const { organizations: orgs } = await searchOrganizations(searchQuery);
    setOrganizations(orgs);
  };

  const handleOrgSelect = async (org) => {
    setSelectedOrg(org);
    setFormData({...formData, organizationId: org.id});

    // Fetch departments and branches
    const { departments: depts } = await getDepartments(org.id);
    const { branches: brnches } = await getBranches(org.id);
    setDepartments(depts);
    setBranches(brnches);
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (registrationMode === 'create') {
        // Create new organization with manager as admin
        const result = await registerOrganization({
          organizationName: orgData.organizationName,
          organizationSlug: orgData.organizationSlug,
          organizationCategory: orgData.organizationCategory,
          adminEmail: formData.email,
          adminPassword: formData.password,
          adminFirstName: formData.firstName,
          adminLastName: formData.lastName,
          adminPhone: formData.phone
        });

        if (result.success) {
          setSuccess('Organization created successfully! You are now the administrator. Logging you in...');
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 2000);
        } else {
          setError(result.error || 'Registration failed');
        }
      } else {
        // Join existing organization
        const result = await registerEmployee({
          ...formData,
          role: 'manager'
        });

        if (result.success) {
          setSuccess('Manager registration submitted! Please wait for administrator approval.');
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 3000);
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Shield size={32} className="text-purple-600" />
        Manager Registration
      </h2>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Search */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Building size={20} className="text-purple-600" />
            Find Your Organization
          </h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleOrgSearch())}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Search by organization name or ID..."
            />
            <button
              type="button"
              onClick={handleOrgSearch}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              Search
            </button>
          </div>

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
                  <p className="text-sm text-gray-600">{org.category}</p>
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

        {selectedOrg && (
          <>
            {/* Personal Information */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Department & Branch */}
            {departments.length > 0 && (
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

            {branches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch/Location</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <Shield className="inline mr-2" size={16} />
                Manager accounts require approval from your organization's administrator.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Manager Registration'}
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
// EMPLOYEE REGISTRATION FORM
// ============================================================================

export const EmployeeRegistrationForm = ({ onSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);

  const [formData, setFormData] = useState({
    organizationId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    departmentId: '',
    branchId: '',
    password: '',
    confirmPassword: ''
  });

  const handleOrgSearch = async () => {
    if (searchQuery.length < 2) return;

    const { organizations: orgs } = await searchOrganizations(searchQuery);
    setOrganizations(orgs);
  };

  const handleOrgSelect = async (org) => {
    setSelectedOrg(org);
    setFormData({...formData, organizationId: org.id});

    const { departments: depts } = await getDepartments(org.id);
    const { branches: brnches } = await getBranches(org.id);
    setDepartments(depts);
    setBranches(brnches);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await registerEmployee(formData);

      if (result.success) {
        setSuccess('Registration submitted! Please wait for manager approval before logging in.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 3000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Users size={32} className="text-teal-600" />
        Employee Registration
      </h2>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Search */}
        <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-6 border-2 border-teal-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Building size={20} className="text-teal-600" />
            Find Your Organization
          </h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleOrgSearch())}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Search by organization name or ID..."
            />
            <button
              type="button"
              onClick={handleOrgSearch}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
            >
              Search
            </button>
          </div>

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
                  <p className="text-sm text-gray-600">{org.category}</p>
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

        {selectedOrg && (
          <>
            {/* Personal Information */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Software Engineer, Nurse, Sales Associate"
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
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Password */}
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
            </div>

            <div>
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

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-teal-800">
                <Shield className="inline mr-2" size={16} />
                Your registration will be pending until approved by your organization's manager.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Employee Registration'}
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
