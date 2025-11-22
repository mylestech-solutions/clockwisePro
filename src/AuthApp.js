import React, { useState, useEffect } from 'react';
import { getCurrentUser, onAuthStateChange } from './supabaseClient';
import App from './App'; // Your existing app

function AuthApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check current session
    checkUser();

    // Listen for auth changes
    const { data: authListener } = onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      setCheckingAuth(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  };

  if (loading && checkingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '24px',
        fontFamily: 'system-ui'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          Loading ClockWise Pro...
        </div>
      </div>
    );
  }

  // Always render the App component
  // Pass user state and a function to refresh authentication
  return <App user={user} onAuthSuccess={() => checkUser()} />;
}

export default AuthApp;
