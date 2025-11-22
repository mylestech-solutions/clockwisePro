import React, { useState } from 'react';
import { signIn, getCurrentUserProfile } from '../supabaseClient';

const LoginForm = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await getCurrentUserProfile();

      if (profileError || !profile) {
        setError('Could not load user profile. Please contact support.');
        setLoading(false);
        return;
      }

      // Check if user is approved
      if (profile.employee_status === 'pending') {
        setError('Your account is pending approval. Please wait for your administrator to approve your registration.');
        setLoading(false);
        return;
      }

      if (profile.employee_status === 'suspended') {
        setError('Your account has been suspended. Please contact your administrator.');
        setLoading(false);
        return;
      }

      if (!profile.is_active) {
        setError('Your account is inactive. Please contact your administrator.');
        setLoading(false);
        return;
      }

      // Login successful - AuthApp will automatically detect the auth state change
      // and show the main app
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.logoContainer}>
        <h1 style={styles.logo}>⏰ ClockWise Pro</h1>
        <p style={styles.tagline}>Time Tracking & Workforce Management</p>
      </div>

      <h2 style={styles.title}>Login to Your Account</h2>

        {error && (
          <div style={styles.errorMessage}>
            <span style={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="your.email@example.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div style={styles.forgotPassword}>
            <a href="/forgot-password" style={styles.link}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>OR</span>
        </div>

        <div style={styles.registerSection}>
          <p style={styles.registerText}>Don't have an account?</p>
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={styles.registerButton}
          >
            Register Now
          </button>
        </div>

      <div style={styles.footer}>
        <a href="/help" style={styles.footerLink}>Help Center</a>
        <span style={styles.footerSeparator}>•</span>
        <a href="/privacy" style={styles.footerLink}>Privacy Policy</a>
        <span style={styles.footerSeparator}>•</span>
        <a href="/terms" style={styles.footerLink}>Terms of Service</a>
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
    borderRadius: '16px',
    padding: '50px 40px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logo: {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px'
  },
  tagline: {
    fontSize: '14px',
    color: '#888',
    margin: '0'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '30px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555'
  },
  input: {
    padding: '14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  forgotPassword: {
    textAlign: 'right',
    marginTop: '-10px'
  },
  link: {
    color: '#667eea',
    fontSize: '13px',
    textDecoration: 'none',
    fontWeight: '500'
  },
  submitButton: {
    padding: '16px',
    backgroundColor: '#667eea',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px'
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #fff',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  errorMessage: {
    padding: '14px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #fcc'
  },
  errorIcon: {
    fontSize: '18px'
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '30px 0'
  },
  dividerText: {
    backgroundColor: '#fff',
    padding: '0 15px',
    color: '#999',
    fontSize: '13px',
    position: 'relative',
    zIndex: 1
  },
  registerSection: {
    textAlign: 'center',
    marginTop: '20px'
  },
  registerText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px'
  },
  registerButton: {
    display: 'inline-block',
    padding: '12px 30px',
    backgroundColor: '#f5f5f5',
    color: '#667eea',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  footer: {
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '12px',
    color: '#999',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px'
  },
  footerLink: {
    color: '#999',
    textDecoration: 'none'
  },
  footerSeparator: {
    color: '#ddd'
  }
};

// Add CSS animation for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default LoginForm;
