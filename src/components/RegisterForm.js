import React, { useState } from 'react';
import { registerOrganization, registerEmployee } from '../supabaseClient';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [registrationType, setRegistrationType] = useState('organization'); // 'organization' or 'employee'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Organization form state
  const [orgForm, setOrgForm] = useState({
    organizationName: '',
    organizationSlug: '',
    organizationCategory: 'corporate',
    adminEmail: '',
    adminPassword: '',
    adminConfirmPassword: '',
    adminFirstName: '',
    adminLastName: '',
    adminPhone: ''
  });

  // Employee form state
  const [empForm, setEmpForm] = useState({
    organizationId: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    firstName: '',
    lastName: '',
    jobTitle: ''
  });

  const organizationCategories = [
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'banking', label: 'Banking & Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'ngo', label: 'NGO / Non-Profit' },
    { value: 'education', label: 'Education' },
    { value: 'government', label: 'Government' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'technology', label: 'Technology' },
    { value: 'construction', label: 'Construction' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'other', label: 'Other' }
  ];

  const handleOrgInputChange = (e) => {
    const { name, value } = e.target;
    setOrgForm(prev => ({ ...prev, [name]: value }));

    // Auto-generate slug from organization name
    if (name === 'organizationName') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setOrgForm(prev => ({ ...prev, organizationSlug: slug }));
    }
  };

  const handleEmpInputChange = (e) => {
    const { name, value } = e.target;
    setEmpForm(prev => ({ ...prev, [name]: value }));
  };

  const validateOrgForm = () => {
    if (!orgForm.organizationName.trim()) return 'Organization name is required';
    if (!orgForm.organizationSlug.trim()) return 'Organization slug is required';
    if (!orgForm.adminEmail.trim()) return 'Admin email is required';
    if (!orgForm.adminEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Invalid email format';
    if (orgForm.adminPassword.length < 8) return 'Password must be at least 8 characters';
    if (orgForm.adminPassword !== orgForm.adminConfirmPassword) return 'Passwords do not match';
    if (!orgForm.adminFirstName.trim()) return 'Admin first name is required';
    if (!orgForm.adminLastName.trim()) return 'Admin last name is required';
    return null;
  };

  const validateEmpForm = () => {
    if (!empForm.organizationId.trim()) return 'Organization ID is required';
    if (!empForm.email.trim()) return 'Email is required';
    if (!empForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Invalid email format';
    if (empForm.password.length < 8) return 'Password must be at least 8 characters';
    if (empForm.password !== empForm.confirmPassword) return 'Passwords do not match';
    if (!empForm.firstName.trim()) return 'First name is required';
    if (!empForm.lastName.trim()) return 'Last name is required';
    return null;
  };

  const handleOrganizationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateOrgForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await registerOrganization({
        organizationName: orgForm.organizationName,
        organizationSlug: orgForm.organizationSlug,
        organizationCategory: orgForm.organizationCategory,
        adminEmail: orgForm.adminEmail,
        adminPassword: orgForm.adminPassword,
        adminFirstName: orgForm.adminFirstName,
        adminLastName: orgForm.adminLastName,
        adminPhone: orgForm.adminPhone
      });

      if (result.success) {
        setSuccess('Organization registered successfully! You can now login with your credentials.');
        // AuthApp will automatically detect the auth state and show the main app
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

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateEmpForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await registerEmployee({
        organizationId: empForm.organizationId,
        email: empForm.email,
        phone: empForm.phone,
        firstName: empForm.firstName,
        lastName: empForm.lastName,
        jobTitle: empForm.jobTitle,
        password: empForm.password
      });

      if (result.success) {
        setSuccess('Registration submitted! Please wait for approval from your organization admin before logging in.');
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

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>Register for ClockWise Pro</h1>

        {/* Registration Type Selector */}
        <div style={styles.toggleContainer}>
          <button
            style={{
              ...styles.toggleButton,
              ...(registrationType === 'organization' ? styles.toggleButtonActive : {})
            }}
            onClick={() => {
              setRegistrationType('organization');
              setError('');
              setSuccess('');
            }}
          >
            Register Organization
          </button>
          <button
            style={{
              ...styles.toggleButton,
              ...(registrationType === 'employee' ? styles.toggleButtonActive : {})
            }}
            onClick={() => {
              setRegistrationType('employee');
              setError('');
              setSuccess('');
            }}
          >
            Join as Employee
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && <div style={styles.errorMessage}>{error}</div>}
        {success && <div style={styles.successMessage}>{success}</div>}

        {/* Organization Registration Form */}
        {registrationType === 'organization' && (
          <form onSubmit={handleOrganizationSubmit} style={styles.form}>
            <h2 style={styles.sectionTitle}>Organization Information</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Organization Name *</label>
              <input
                type="text"
                name="organizationName"
                value={orgForm.organizationName}
                onChange={handleOrgInputChange}
                style={styles.input}
                placeholder="Enter organization name"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Organization Slug (URL identifier) *</label>
              <input
                type="text"
                name="organizationSlug"
                value={orgForm.organizationSlug}
                onChange={handleOrgInputChange}
                style={styles.input}
                placeholder="organization-slug"
                required
              />
              <small style={styles.helpText}>
                Used in URLs: clockwise.app/{orgForm.organizationSlug || 'your-org'}
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Organization Category *</label>
              <select
                name="organizationCategory"
                value={orgForm.organizationCategory}
                onChange={handleOrgInputChange}
                style={styles.select}
                required
              >
                {organizationCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <h2 style={styles.sectionTitle}>Administrator Account</h2>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name *</label>
                <input
                  type="text"
                  name="adminFirstName"
                  value={orgForm.adminFirstName}
                  onChange={handleOrgInputChange}
                  style={styles.input}
                  placeholder="First name"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name *</label>
                <input
                  type="text"
                  name="adminLastName"
                  value={orgForm.adminLastName}
                  onChange={handleOrgInputChange}
                  style={styles.input}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address *</label>
              <input
                type="email"
                name="adminEmail"
                value={orgForm.adminEmail}
                onChange={handleOrgInputChange}
                style={styles.input}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                name="adminPhone"
                value={orgForm.adminPhone}
                onChange={handleOrgInputChange}
                style={styles.input}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                name="adminPassword"
                value={orgForm.adminPassword}
                onChange={handleOrgInputChange}
                style={styles.input}
                placeholder="Minimum 8 characters"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password *</label>
              <input
                type="password"
                name="adminConfirmPassword"
                value={orgForm.adminConfirmPassword}
                onChange={handleOrgInputChange}
                style={styles.input}
                placeholder="Re-enter password"
                required
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Organization'}
            </button>
          </form>
        )}

        {/* Employee Registration Form */}
        {registrationType === 'employee' && (
          <form onSubmit={handleEmployeeSubmit} style={styles.form}>
            <h2 style={styles.sectionTitle}>Employee Information</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Organization ID *</label>
              <input
                type="text"
                name="organizationId"
                value={empForm.organizationId}
                onChange={handleEmpInputChange}
                style={styles.input}
                placeholder="Ask your admin for organization ID"
                required
              />
              <small style={styles.helpText}>
                Your organization admin should provide this ID
              </small>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={empForm.firstName}
                  onChange={handleEmpInputChange}
                  style={styles.input}
                  placeholder="First name"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={empForm.lastName}
                  onChange={handleEmpInputChange}
                  style={styles.input}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={empForm.email}
                onChange={handleEmpInputChange}
                style={styles.input}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={empForm.phone}
                onChange={handleEmpInputChange}
                style={styles.input}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={empForm.jobTitle}
                onChange={handleEmpInputChange}
                style={styles.input}
                placeholder="e.g., Software Engineer, Nurse, Manager"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                name="password"
                value={empForm.password}
                onChange={handleEmpInputChange}
                style={styles.input}
                placeholder="Minimum 8 characters"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={empForm.confirmPassword}
                onChange={handleEmpInputChange}
                style={styles.input}
                placeholder="Re-enter password"
                required
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>

            <div style={styles.infoBox}>
              <strong>Note:</strong> Your registration will be pending until approved by your organization administrator.
            </div>
          </form>
        )}

      {/* Login Link */}
      <div style={styles.footer}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{...styles.link, background: 'none', border: 'none', cursor: 'pointer', padding: 0}}
        >
          Login here
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px'
  },
  toggleContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    backgroundColor: '#f5f5f5',
    padding: '5px',
    borderRadius: '8px'
  },
  toggleButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  toggleButtonActive: {
    backgroundColor: '#667eea',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(102,126,234,0.3)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginTop: '10px',
    marginBottom: '10px',
    borderBottom: '2px solid #667eea',
    paddingBottom: '10px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  row: {
    display: 'flex',
    gap: '15px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.3s ease'
  },
  select: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  helpText: {
    fontSize: '12px',
    color: '#888'
  },
  submitButton: {
    padding: '14px',
    backgroundColor: '#667eea',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '10px'
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  errorMessage: {
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px'
  },
  successMessage: {
    padding: '12px',
    backgroundColor: '#efe',
    color: '#3c3',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px'
  },
  infoBox: {
    padding: '12px',
    backgroundColor: '#f0f8ff',
    color: '#0066cc',
    borderRadius: '6px',
    fontSize: '13px',
    border: '1px solid #cce5ff'
  },
  footer: {
    textAlign: 'center',
    marginTop: '30px',
    fontSize: '14px',
    color: '#666'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default RegisterForm;
