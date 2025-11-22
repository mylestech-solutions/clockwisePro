import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Clock, Users, Activity, AlertCircle, CheckCircle, WifiOff, Bell, MessageSquare, Briefcase, Heart, TrendingUp, Shield, Moon, Coffee, Droplet, Zap, UserCheck, Building2, Calendar, BarChart3, Settings, LogOut, ChevronRight, ChevronLeft, Eye, EyeOff, Home, History, User, UserPlus, Lock, Send, Search, Phone, Video, MoreVertical, Edit2, Mail } from 'lucide-react';
import { OrganizationRegistrationForm } from './components/ComprehensiveRegistrationForms';
import { EnhancedManagerRegistrationForm, EnhancedEmployeeRegistrationForm } from './components/EnhancedManagerEmployeeForms';
import FaceRecognition from './components/FaceRecognition';
import {
  // Authentication
  getCurrentUser,
  onAuthStateChange,
  signIn,
  signOut,
  getCurrentUserProfile,
  // Face Recognition
  enrollFace,
  verifyFace,
  getFaceDescriptor,
  hasEnrolledFace,
  // Time Tracking
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  // Location & Device
  getCurrentLocation,
  getDeviceInfo,
  // Notifications
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  // Dashboard
  getOrganizationDashboardStats,
  searchEmployees,
  approveEmployee,
  // Schedule
  getMySchedule
} from './supabaseClient';

const ClockWiseProPrototype = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [isClocked, setIsClocked] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [permissions, setPermissions] = useState({
    location: false,
    camera: false,
    motion: false,
    notifications: false
  });

  // Authentication state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Also load user profile to check organization membership and status
          const { data: profile } = await getCurrentUserProfile();
          if (profile) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: authListener } = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Load profile on auth change
        const { data: profile } = await getCurrentUserProfile();
        if (profile) {
          setUserProfile(profile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Define public screens (no auth required)
  const publicScreens = ['splash', 'login', 'signup', 'managerLogin'];

  // Define screens that require active organization membership
  const protectedScreens = [
    'employeeDashboard', 'clockIn', 'clockInSuccess', 'clockOut', 'clockOutSuccess',
    'managerDashboard', 'overtimeRequest', 'shiftManagement', 'managerClockInOut',
    'currentlyClocked', 'staffToday', 'aiAnalytics', 'employeeAIChat', 'managerAIChat',
    'takeBreak', 'notifications', 'mySchedule', 'myClients', 'equipmentCheck', 'settings',
    'departmentDetail', 'permissions'
  ];

  // Auth guard - redirect to login if accessing protected screen without auth
  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    const isProtectedScreen = protectedScreens.includes(currentScreen);
    const isPublicScreen = publicScreens.includes(currentScreen);

    // If trying to access protected screen without being logged in
    if (isProtectedScreen && !user) {
      console.log('Auth guard: Redirecting to login - no user');
      setCurrentScreen('login');
      return;
    }

    // If logged in but profile shows pending status, redirect to pending screen
    if (isProtectedScreen && user && userProfile) {
      if (userProfile.status === 'pending') {
        console.log('Auth guard: User pending approval');
        // Show a pending approval message instead of dashboard
        // We'll handle this in the screen rendering
      } else if (userProfile.status === 'suspended' || userProfile.status === 'terminated') {
        console.log('Auth guard: User suspended/terminated - logging out');
        signOut();
        setCurrentScreen('login');
        return;
      } else if (!userProfile.organization_id && currentScreen !== 'signup') {
        console.log('Auth guard: No organization - redirecting to signup');
        // User has no organization, needs to join one
        setCurrentScreen('signup');
        return;
      }
    }
  }, [currentScreen, user, userProfile, loading]);

  // Helper function to check if user can access current screen
  const canAccessScreen = () => {
    if (publicScreens.includes(currentScreen)) return true;
    if (!user) return false;
    if (!userProfile) return false;
    if (userProfile.status === 'pending') return false;
    if (userProfile.status === 'suspended' || userProfile.status === 'terminated') return false;
    if (!userProfile.organization_id) return false;
    return true;
  };

  // Show loading screen while checking auth
  const LoadingScreen = () => (
    <div className="h-full flex items-center justify-center"
         style={{ background: 'linear-gradient(165deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white font-medium">Loading...</p>
      </div>
    </div>
  );

  // Pending approval screen for users awaiting approval
  const PendingApprovalScreen = () => (
    <div className="h-full flex flex-col items-center justify-center p-6"
         style={{ background: 'linear-gradient(165deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)' }}>
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <Clock size={40} className="text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Pending Approval</h1>
        <p className="text-gray-600 mb-6">
          Your account is awaiting approval from your organization administrator.
          You'll receive a notification once your account has been activated.
        </p>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <User size={20} className="text-teal-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">{userProfile?.full_name || 'User'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={async () => {
            await signOut();
            setUser(null);
            setUserProfile(null);
            setCurrentScreen('login');
          }}
          className="w-full py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-semibold
                     hover:bg-gray-200 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  // Suspended/Inactive account screen
  const AccountSuspendedScreen = () => (
    <div className="h-full flex flex-col items-center justify-center p-6"
         style={{ background: 'linear-gradient(165deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)' }}>
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Account Suspended</h1>
        <p className="text-gray-600 mb-6">
          Your account has been suspended. Please contact your organization administrator for assistance.
        </p>
        <button
          onClick={async () => {
            await signOut();
            setUser(null);
            setUserProfile(null);
            setCurrentScreen('login');
          }}
          className="w-full py-3 px-4 rounded-xl bg-red-600 text-white font-semibold
                     hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  // Responsive state - detect if we're on mobile
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive iPhone container - only visible on desktop
  const iphoneStyle = {
    width: 'min(440px, 95vw)',
    height: 'min(956px, 90vh)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: isMobileView ? '0' : '55px',
    padding: isMobileView ? '0' : '12px',
    boxShadow: isMobileView ? 'none' : '0 30px 60px rgba(0,0,0,0.3)',
    position: 'relative',
    margin: isMobileView ? '0' : '20px auto',
    maxWidth: '100%'
  };

  const screenStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: isMobileView ? '0' : '47px',
    overflow: 'hidden',
    position: 'relative'
  };

  // Dynamic Island - only visible on desktop mockup
  const dynamicIslandStyle = {
    width: '126px',
    height: '37px',
    backgroundColor: '#000',
    borderRadius: '20px',
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
    display: isMobileView ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const cameraStyle = {
    width: '12px',
    height: '12px',
    backgroundColor: '#1a1a1a',
    borderRadius: '50%',
    border: '2px solid #333',
    boxShadow: 'inset 0 0 3px rgba(255,255,255,0.1)'
  };

  // Bottom Navigation Component - Premium Design
  const BottomNavigation = ({ activeTab, setActiveTab }) => {
    const navItems = [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'schedule', label: 'Schedule', icon: Calendar, badge: '17' },
      { id: 'ai', label: 'AI Chat', icon: Zap, badge: null, special: true },
      { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '3' },
      { id: 'notifications', label: 'Alerts', icon: Bell, badge: '5' }
    ];

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 safe-area-bottom"
           style={{
             borderBottomLeftRadius: isMobileView ? '0' : '45px',
             borderBottomRightRadius: isMobileView ? '0' : '45px',
             boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
           }}>
        <div className="flex items-center justify-around py-1.5 sm:py-2 pb-3 sm:pb-5 px-1 sm:px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'ai') {
                    setCurrentScreen('employeeAIChat');
                  } else if (item.id === 'notifications') {
                    setCurrentScreen('notifications');
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex flex-col items-center p-1 sm:p-2 relative transition-all duration-300 min-w-[50px] sm:min-w-[60px]
                           ${isActive ? 'scale-105' : 'hover:scale-105'}`}
              >
                {/* Special AI Button */}
                {item.special ? (
                  <div className="relative -mt-4 sm:-mt-6 mb-0.5 sm:mb-1">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center
                                    transition-all duration-300 hover:-translate-y-0.5"
                         style={{
                           background: 'var(--gradient-primary)',
                           boxShadow: '0 4px 16px rgba(20, 184, 166, 0.4)'
                         }}>
                      <Icon size={20} className="text-white sm:hidden" />
                      <Icon size={24} className="text-white hidden sm:block" />
                    </div>
                    <span className="text-2xs sm:text-xs mt-1 sm:mt-2 font-semibold text-gray-600 block text-center">{item.label}</span>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300
                                      ${isActive ? 'bg-teal-100' : 'bg-transparent'}`}>
                        <Icon size={18} className={`transition-colors duration-300 sm:hidden ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                        <Icon size={22} className={`transition-colors duration-300 hidden sm:block ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                      </div>
                      {item.badge && (
                        <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 rounded-full flex items-center justify-center
                                        text-2xs sm:text-xs font-bold text-white"
                             style={{
                               background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                               boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                             }}>
                          {item.badge}
                        </div>
                      )}
                    </div>
                    <span className={`text-2xs sm:text-[10px] mt-0.5 sm:mt-1 font-semibold transition-colors duration-300
                                    ${isActive ? 'text-teal-600' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                  </>
                )}

                {/* Active Indicator */}
                {isActive && !item.special && (
                  <div className="absolute -bottom-1 sm:-bottom-2 w-1 h-1 rounded-full bg-teal-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Screens Components - World-Class Enterprise Design
  const SplashScreen = () => {
    const [showLanguages, setShowLanguages] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');

    const languages = [
      'English', 'Pidgin English', 'Español', 'Français', 'Deutsch', 'Italiano',
      'Português', '中文', '日本語', '한국어', 'العربية',
      'हिन्दी', 'বাংলা', 'Русский', 'Türkçe', 'Polski',
      'Nederlands', 'Svenska', 'Norsk', 'Dansk', 'Suomi',
      'Hausa', 'Yoruba', 'Igbo', 'Swahili', 'Amharic',
      'ไทย', 'Tiếng Việt', 'Bahasa Indonesia', 'Filipino', 'മലയാളം',
      'தமிழ்', 'తెలుగు', 'ಕನ್ನಡ', 'اردو', 'فارسی',
      'עברית', 'Ελληνικά', 'Čeština', 'Magyar', 'Română'
    ];

    const [time, setTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours() % 12;

    const secondAngle = (seconds * 6) - 90;
    const minuteAngle = (minutes * 6 + seconds * 0.1) - 90;
    const hourAngle = (hours * 30 + minutes * 0.5) - 90;

    return (
      <div className="h-full flex flex-col relative overflow-hidden"
           style={{ background: 'linear-gradient(165deg, #0d9488 0%, #0891b2 35%, #0284c7 65%, #1d4ed8 100%)' }}>

        {/* Animated Background Mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-30"
               style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)', transform: 'translate(-30%, -30%)' }} />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-25"
               style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 60%)', transform: 'translate(30%, 30%)' }} />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-15"
               style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%)', transform: 'translate(-50%, -50%)' }} />
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-5"
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>

        {/* Top Bar - Language Selector */}
        <div className="relative z-50 px-3 sm:px-5 pt-3 sm:pt-5 flex justify-end">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/25 backdrop-blur-md
                       border border-white/40 hover:bg-white/35 transition-all duration-300"
            style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span className="text-white text-xs sm:text-sm font-semibold">{selectedLanguage}</span>
            <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/90 transition-transform duration-300 ${showLanguages ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showLanguages && (
            <div className="absolute right-3 sm:right-5 top-12 sm:top-14 w-44 sm:w-52 bg-white rounded-xl sm:rounded-2xl overflow-hidden animate-fadeInUp z-50"
                 style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)' }}>
              <div className="max-h-56 sm:max-h-72 overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setSelectedLanguage(lang); setShowLanguages(false); }}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm transition-all duration-150 ${
                      selectedLanguage === lang
                        ? 'bg-teal-50 text-teal-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-16 sm:pb-20">
          {/* Clock Icon */}
          <div className="relative mb-6 sm:mb-8 animate-fadeInUp">
            <div className="w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/20
                            flex items-center justify-center"
                 style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.15)' }}>
              <svg width="100" height="100" viewBox="0 0 100 100" className="md:w-[120px] md:h-[120px]">
                <defs>
                  <linearGradient id="clockFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'rgba(255,255,255,0.3)'}} />
                    <stop offset="100%" style={{stopColor: 'rgba(255,255,255,0.1)'}} />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="url(#clockFaceGrad)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30 - 90) * Math.PI / 180;
                  const isMain = i % 3 === 0;
                  return (
                    <line key={i} x1={50 + (isMain ? 35 : 38) * Math.cos(angle)} y1={50 + (isMain ? 35 : 38) * Math.sin(angle)}
                          x2={50 + 43 * Math.cos(angle)} y2={50 + 43 * Math.sin(angle)}
                          stroke="white" strokeWidth={isMain ? 2.5 : 1} strokeLinecap="round" opacity={isMain ? 1 : 0.6} />
                  );
                })}
                <line x1="50" y1="50" x2={50 + 22 * Math.cos((hourAngle) * Math.PI / 180)} y2={50 + 22 * Math.sin((hourAngle) * Math.PI / 180)}
                      stroke="white" strokeWidth="4" strokeLinecap="round" />
                <line x1="50" y1="50" x2={50 + 32 * Math.cos((minuteAngle) * Math.PI / 180)} y2={50 + 32 * Math.sin((minuteAngle) * Math.PI / 180)}
                      stroke="white" strokeWidth="3" strokeLinecap="round" />
                <line x1="50" y1="50" x2={50 + 35 * Math.cos((secondAngle) * Math.PI / 180)} y2={50 + 35 * Math.sin((secondAngle) * Math.PI / 180)}
                      stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="50" cy="50" r="4" fill="white" />
                <circle cx="50" cy="50" r="2" fill="#0d9488" />
              </svg>
            </div>
            {/* Glow Ring */}
            <div className="absolute inset-0 rounded-[2.5rem] animate-pulse"
                 style={{ boxShadow: '0 0 60px 10px rgba(255,255,255,0.1)' }} />
          </div>

          {/* Brand Typography */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-3xl xs:text-4xl md:text-5xl font-black text-white tracking-tight mb-2 sm:mb-3"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
              ClockWise Pro
            </h1>
            <p className="text-sm xs:text-base md:text-lg text-white/80 font-medium tracking-wide mb-1">
              Enterprise Workforce Management
            </p>
            <p className="text-xs sm:text-sm text-white/50 font-medium">Your Organization</p>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setCurrentScreen('login')}
            className="group relative px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base
                       transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-fadeInUp"
            style={{
              color: '#0d9488',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
              animationDelay: '0.2s'
            }}
          >
            <span className="flex items-center gap-2">
              Get Started
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>

          {/* Feature Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 px-4 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: Shield, label: 'Secure' },
              { icon: MapPin, label: 'GPS-Enabled' },
              { icon: Zap, label: 'AI-Powered' },
              { icon: WifiOff, label: 'Offline First' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <span key={item.label}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs text-white font-semibold
                                 bg-white/25 backdrop-blur-md border border-white/30"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Icon size={14} className="opacity-90" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-white/40 text-xs font-medium tracking-wide">
            © 2025 MylesTech Solutions. All rights reserved.
          </p>
        </div>
      </div>
    );
  };

  const LoginScreen = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const handleEmployeeLogin = async () => {
      // Validate inputs
      if (!email.trim()) {
        setLoginError('Please enter your email or employee ID');
        return;
      }
      if (!password) {
        setLoginError('Please enter your password');
        return;
      }

      setLoginError('');
      setLoginLoading(true);

      try {
        // Sign in with Supabase
        const { data, error: signInError } = await signIn(email, password);

        if (signInError) {
          setLoginError(signInError.message || 'Invalid email or password');
          setLoginLoading(false);
          return;
        }

        // Get user profile to check status
        const { data: profile, error: profileError } = await getCurrentUserProfile();

        if (profileError || !profile) {
          // User authenticated but no profile - might be first login
          setUser(data.user);
          setActiveTab('home');
          setCurrentScreen('permissions');
          return;
        }

        // Check user role - redirect managers to manager login
        if (profile.role === 'manager' || profile.role === 'admin') {
          setLoginError('Please use Manager Login for manager/admin accounts');
          await signOut();
          setLoginLoading(false);
          return;
        }

        // Check if employee is approved
        if (profile.employee_status === 'pending') {
          setLoginError('Your account is pending approval. Please wait for your manager to approve your registration.');
          await signOut();
          setLoginLoading(false);
          return;
        }

        if (profile.employee_status === 'suspended') {
          setLoginError('Your account has been suspended. Please contact your administrator.');
          await signOut();
          setLoginLoading(false);
          return;
        }

        if (!profile.is_active) {
          setLoginError('Your account is inactive. Please contact your administrator.');
          await signOut();
          setLoginLoading(false);
          return;
        }

        // Login successful!
        setUser(data.user);
        setUserProfile(profile);
        setActiveTab('home');
        setCurrentScreen('permissions');
      } catch (err) {
        console.error('Login error:', err);
        setLoginError('An unexpected error occurred. Please try again.');
      } finally {
        setLoginLoading(false);
      }
    };

    return (
      <div className="h-full overflow-auto relative"
           style={{ background: 'linear-gradient(165deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)' }}>

        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-30"
               style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)' }} />
          <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full opacity-10 -translate-x-1/2"
               style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.1) 0%, transparent 60%)' }} />
          {/* Subtle Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
               style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Back Button */}
        <div className="relative z-10 px-3 sm:px-5 pt-3 sm:pt-5">
          <button
            onClick={() => setCurrentScreen('splash')}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/60 backdrop-blur-sm
                       border border-gray-200/50 hover:bg-white/80 transition-all duration-300 group"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <ChevronLeft size={16} className="text-gray-600 group-hover:-translate-x-0.5 transition-transform sm:hidden" />
            <ChevronLeft size={18} className="text-gray-600 group-hover:-translate-x-0.5 transition-transform hidden sm:block" />
            <span className="text-xs sm:text-sm font-medium text-gray-600">Back</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-10">
          {/* Premium Header */}
          <div className="flex flex-col items-center mb-6 sm:mb-8 md:mb-10 animate-fadeInUp">
            {/* Logo with Glow */}
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-0 rounded-[1.25rem] sm:rounded-[1.75rem] blur-2xl opacity-40"
                   style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)' }} />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[1.25rem] sm:rounded-[1.75rem] flex items-center justify-center"
                   style={{
                     background: 'linear-gradient(165deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
                     boxShadow: '0 8px 24px rgba(13,148,136,0.35), inset 0 1px 1px rgba(255,255,255,0.2)'
                   }}>
                <Clock size={32} className="text-white sm:hidden" />
                <Clock size={40} className="text-white hidden sm:block md:hidden" />
                <Clock size={48} className="text-white hidden md:block" />
              </div>
            </div>

            {/* Welcome Text */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 text-center mb-1.5 sm:mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-center text-sm sm:text-base md:text-lg font-medium">
              Sign in to clock in/out
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl flex items-start gap-2 sm:gap-3 animate-fadeInUp">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5 sm:hidden" />
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5 hidden sm:block" />
              <p className="text-red-700 text-xs sm:text-sm font-medium">{loginError}</p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 animate-fadeInUp"
               style={{
                 animationDelay: '0.1s',
                 boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)'
               }}>
            <div className="space-y-4 sm:space-y-5">
              {/* Email Input */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2.5 block tracking-wide">
                  Employee ID / Email
                </label>
                <div className={`relative transition-all duration-300 ${focusedInput === 'email' ? 'scale-[1.01]' : ''}`}>
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User size={18} className={`transition-colors duration-300 sm:hidden ${focusedInput === 'email' ? 'text-teal-500' : 'text-gray-400'}`} />
                    <User size={20} className={`transition-colors duration-300 hidden sm:block ${focusedInput === 'email' ? 'text-teal-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your ID or email"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    disabled={loginLoading}
                    className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl
                               focus:border-teal-500 focus:outline-none focus:bg-white
                               transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium text-sm sm:text-base
                               disabled:bg-gray-50 disabled:cursor-not-allowed"
                    style={{ boxShadow: focusedInput === 'email' ? '0 4px 20px rgba(13,148,136,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2.5 block tracking-wide">
                  Password
                </label>
                <div className={`relative transition-all duration-300 ${focusedInput === 'password' ? 'scale-[1.01]' : ''}`}>
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock size={18} className={`transition-colors duration-300 sm:hidden ${focusedInput === 'password' ? 'text-teal-500' : 'text-gray-400'}`} />
                    <Lock size={20} className={`transition-colors duration-300 hidden sm:block ${focusedInput === 'password' ? 'text-teal-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    disabled={loginLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleEmployeeLogin()}
                    className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl
                               focus:border-teal-500 focus:outline-none focus:bg-white
                               transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium text-sm sm:text-base
                               disabled:bg-gray-50 disabled:cursor-not-allowed"
                    style={{ boxShadow: focusedInput === 'password' ? '0 4px 20px rgba(13,148,136,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400
                               hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                  >
                    {showPassword ? <EyeOff size={18} className="sm:hidden" /> : <Eye size={18} className="sm:hidden" />}
                    {showPassword ? <EyeOff size={20} className="hidden sm:block" /> : <Eye size={20} className="hidden sm:block" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password - Inside Card */}
              <div className="text-right">
                <button className="text-teal-600 text-xs sm:text-sm font-semibold hover:text-teal-700
                                   transition-colors duration-200 hover:underline underline-offset-4">
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>

          {/* Premium Action Buttons */}
          <div className="space-y-2.5 sm:space-y-3.5 mb-6 sm:mb-8">
            {/* Employee Login */}
            <button
              onClick={handleEmployeeLogin}
              disabled={loginLoading}
              className={`w-full text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base
                         transition-all duration-300 animate-fadeInUp group relative overflow-hidden
                         ${loginLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              style={{
                background: 'linear-gradient(165deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
                boxShadow: '0 4px 20px rgba(13,148,136,0.35), inset 0 1px 1px rgba(255,255,255,0.15)',
                animationDelay: '0.15s'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loginLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <User size={18} />
                    Employee Login
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>

            {/* Manager Login */}
            <button
              onClick={() => setCurrentScreen('managerLogin')}
              className="w-full text-white py-4 rounded-2xl font-bold text-base
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         animate-fadeInUp group relative overflow-hidden"
              style={{
                background: 'linear-gradient(165deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.35), inset 0 1px 1px rgba(255,255,255,0.15)',
                animationDelay: '0.2s'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Shield size={18} />
                Manager Login
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>

            {/* Create Account */}
            <button
              onClick={() => setCurrentScreen('signup')}
              className="w-full py-4 rounded-2xl font-bold text-base
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                         animate-fadeInUp group relative overflow-hidden bg-white border-2 border-gray-200
                         hover:border-teal-300 hover:bg-teal-50/50"
              style={{
                color: '#0d9488',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                animationDelay: '0.25s'
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus size={18} />
                Create New Account
              </span>
            </button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-3 justify-center flex-wrap animate-fadeInUp"
               style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full border border-emerald-200"
                 style={{ boxShadow: '0 2px 8px rgba(16,185,129,0.1)' }}>
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-xs text-emerald-700 font-semibold">System Online</span>
            </div>
            {isOffline && (
              <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-full border border-amber-200"
                   style={{ boxShadow: '0 2px 8px rgba(245,158,11,0.1)' }}>
                <WifiOff size={14} className="text-amber-600" />
                <span className="text-xs text-amber-700 font-semibold">Offline Mode</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-10 text-center animate-fadeInUp" style={{ animationDelay: '0.35s' }}>
            <p className="text-gray-400 text-xs font-medium tracking-wide">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    );
  };

  const PermissionsScreen = () => {
    const [localPermissions, setLocalPermissions] = useState(permissions);

    const handlePermission = (type) => {
      setLocalPermissions(prev => ({ ...prev, [type]: true }));
    };

    const allPermissionsGranted = Object.values(localPermissions).every(p => p === true);

    const handleContinue = () => {
      if (allPermissionsGranted) {
        setPermissions(localPermissions);
        setCurrentScreen('employeeDashboard');
      }
    };

    const permissionItems = [
      { key: 'location', icon: MapPin, title: 'Location Services', desc: 'For geofenced clock-in', color: 'red' },
      { key: 'camera', icon: Camera, title: 'Camera', desc: 'For face verification', color: 'gray' },
      { key: 'motion', icon: Activity, title: 'Motion & Fitness', desc: 'For idle detection', color: 'amber' },
      { key: 'notifications', icon: Bell, title: 'Notifications', desc: 'For shift reminders', color: 'amber' }
    ];

    return (
      <div className="h-full overflow-auto" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
        <div className="px-6 pt-14 pb-8">
          {/* Header */}
          <div className="text-center mb-10 animate-fadeInUp">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                 style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-button)' }}>
              <Shield size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Enable Permissions</h2>
            <p className="text-gray-500 text-base max-w-xs mx-auto">
              ClockWise Pro needs these permissions to work properly
            </p>
          </div>

          {/* Permission Cards */}
          <div className="space-y-4 mb-8">
            {permissionItems.map((item, index) => {
              const Icon = item.icon;
              const isGranted = localPermissions[item.key];

              return (
                <div key={item.key}
                     className="bg-white rounded-2xl p-5 transition-all duration-300 animate-fadeInUp"
                     style={{
                       boxShadow: isGranted ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
                       animationDelay: `${index * 0.1}s`,
                       border: isGranted ? '2px solid #10b981' : '2px solid transparent'
                     }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isGranted
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                          : item.color === 'red' ? 'bg-red-100' : item.color === 'amber' ? 'bg-amber-100' : 'bg-gray-100'
                      }`}
                           style={isGranted ? { boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' } : {}}>
                        <Icon size={26} className={isGranted ? 'text-white' : item.color === 'red' ? 'text-red-500' : item.color === 'amber' ? 'text-amber-600' : 'text-gray-600'} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    {!isGranted ? (
                      <button
                        onClick={() => handlePermission(item.key)}
                        className="px-5 py-2.5 rounded-xl font-bold text-sm text-white
                                   transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                        style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-button)' }}
                      >
                        Allow
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="text-emerald-600" size={24} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className={`w-full py-4.5 rounded-2xl font-bold text-base transition-all duration-300
                       ${allPermissionsGranted
                         ? 'text-white hover:-translate-y-0.5 active:translate-y-0'
                         : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            style={allPermissionsGranted ? {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            } : {}}
            disabled={!allPermissionsGranted}
          >
            <span className="flex items-center justify-center gap-2">
              {allPermissionsGranted ? (
                <>
                  All Set! Continue
                  <ChevronRight size={20} />
                </>
              ) : (
                'Grant All Permissions to Continue'
              )}
            </span>
          </button>

          {/* Back Button */}
          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full mt-4 text-gray-500 py-3 font-semibold hover:text-gray-700 transition-colors duration-200"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  };

  const EmployeeDashboard = () => {
    // Live time state
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Update time every second
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }, []);
    
    // Format time
    const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      });
    };

    // Home Tab Content
    const HomeTab = () => (
      <>
        {/* Premium Header Section - Responsive */}
        <div className="flex flex-col xs:flex-row justify-between items-start gap-4 xs:gap-0 mb-4 sm:mb-6 mt-2 sm:mt-4 animate-fadeInUp">
          <div className="w-full xs:w-auto">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Hello, Brine!</h3>
            <p className="text-gray-500 font-medium text-sm sm:text-base">Sales Department</p>
            <div className="flex items-center gap-2 mt-2 bg-teal-50 px-3 py-1.5 rounded-full w-fit border border-teal-200">
              <Clock size={14} className="text-teal-600" />
              <span className="text-xs sm:text-sm text-teal-700 font-bold tabular-nums">{formatTime(currentTime)}</span>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 self-end xs:self-auto">
            <button
              onClick={() => setIsOffline(!isOffline)}
              className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:-translate-y-0.5 group"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <WifiOff size={18} className={`sm:w-5 sm:h-5 transition-colors ${isOffline ? 'text-amber-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
            </button>
            <button
              onClick={() => setCurrentScreen('settings')}
              className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:-translate-y-0.5 group"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <Settings size={18} className="sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Premium Status Card - Responsive */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fadeInUp relative overflow-hidden"
             style={{
               background: 'var(--gradient-primary)',
               boxShadow: '0 8px 32px rgba(20, 184, 166, 0.35)',
               animationDelay: '0.1s'
             }}>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />

          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <p className="text-white/70 text-xs sm:text-sm font-medium mb-1">Current Status</p>
              <p className="text-white text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
                {isClocked ? 'Clocked In' : 'Not Clocked In'}
              </p>
            </div>
            <div className="glass-dark px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/20">
              <Clock className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {isClocked ? (
            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 border border-white/10">
              <p className="text-white/70 text-xs sm:text-sm font-medium mb-1">Shift Duration</p>
              <p className="text-white text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tight">04:32:15</p>
              <p className="text-white/60 text-xs sm:text-sm mt-2">Started at 8:00 AM</p>
            </div>
          ) : (
            <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 border border-white/10 text-center">
              <p className="text-white font-medium text-sm sm:text-base">Ready to start your shift?</p>
            </div>
          )}

          <button
            onClick={() => isClocked ? setCurrentScreen('clockOut') : setCurrentScreen('clockIn')}
            className="w-full bg-white text-teal-600 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base
                       transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 group"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            <span className="flex items-center justify-center gap-2">
              {isClocked ? 'Clock Out' : 'Clock In Now'}
              <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </div>

        {/* Premium Quick Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {[
            { id: 'mySchedule', icon: Calendar, color: 'purple', title: 'My Schedule', subtitle: '5 shifts this week' },
            { id: 'takeBreak', icon: Coffee, color: 'orange', title: 'Take Break', subtitle: '30 min remaining' },
            { id: 'myClients', icon: Heart, color: 'rose', title: 'Clients', subtitle: '8 assigned today' },
            { id: 'equipmentCheck', icon: Activity, color: 'blue', title: 'Resources', subtitle: 'Check in/out' }
          ].map((item, index) => {
            const Icon = item.icon;
            const colorMap = {
              purple: { bg: 'bg-purple-100', icon: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
              orange: { bg: 'bg-orange-100', icon: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
              rose: { bg: 'bg-rose-100', icon: 'text-rose-600', gradient: 'from-rose-500 to-rose-600' },
              blue: { bg: 'bg-blue-100', icon: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' }
            };
            const colors = colorMap[item.color];

            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className="bg-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:-translate-y-1
                           active:translate-y-0 text-left group animate-fadeInUp min-h-[100px] sm:min-h-[120px]"
                style={{ boxShadow: 'var(--shadow-card)', animationDelay: `${0.15 + index * 0.05}s` }}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${colors.bg} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4
                                 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={colors.icon} size={20} />
                </div>
                <p className="font-bold text-gray-900 text-sm sm:text-base">{item.title}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-1">{item.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Premium Overtime Request Button */}
        <button
          onClick={() => setCurrentScreen('overtimeRequest')}
          className="w-full p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 flex items-center justify-between group
                     transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 animate-fadeInUp"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)',
            animationDelay: '0.35s'
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="glass-dark p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/20">
              <Clock className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-white text-base sm:text-lg">Request Overtime</p>
              <p className="text-white/70 text-xs sm:text-sm">Submit additional hours request</p>
            </div>
          </div>
          <ChevronRight className="text-white/60 group-hover:translate-x-1 transition-transform duration-300 w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </>
    );

    // Schedule Tab Content - Premium Design
    const ScheduleTab = () => (
      <>
        <div className="mb-4 sm:mb-6 mt-2 sm:mt-4 animate-fadeInUp">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-1">My Schedule</h3>
          <p className="text-gray-500 text-sm sm:text-base">Upcoming shifts and appointments</p>
        </div>

        {/* Premium Calendar Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-5 animate-fadeInUp"
             style={{ boxShadow: 'var(--shadow-card)', animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-3 sm:mb-5">
            <h4 className="font-bold text-gray-900 text-base sm:text-lg">January 2025</h4>
            <div className="flex gap-1.5 sm:gap-2">
              <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                                 text-gray-600 transition-all duration-200 hover:-translate-y-0.5 text-sm">
                ←
              </button>
              <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                                 text-gray-600 transition-all duration-200 hover:-translate-y-0.5 text-sm">
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-2xs sm:text-xs mb-2 sm:mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="font-bold text-gray-400 p-1 sm:p-2 uppercase tracking-wider">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-xs sm:text-sm">
            {[...Array(31)].map((_, i) => {
              const isToday = i === 16;
              const hasShift = [3, 10, 16, 17, 24].includes(i);
              return (
                <div key={i}
                     className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl font-medium transition-all duration-200 cursor-pointer
                                ${isToday
                                  ? 'text-white font-bold'
                                  : hasShift
                                    ? 'text-teal-600 bg-teal-50 hover:bg-teal-100'
                                    : 'text-gray-700 hover:bg-gray-100'}`}
                     style={isToday ? {
                       background: 'var(--gradient-primary)',
                       boxShadow: '0 2px 8px rgba(20, 184, 166, 0.3)'
                     } : {}}>
                  {i + 1}
                  {hasShift && !isToday && (
                    <div className="w-1 h-1 rounded-full bg-teal-500 mx-auto mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium Shift Cards */}
        <div className="space-y-2 sm:space-y-3">
          {[
            { title: 'Morning Shift', time: '8:00 AM - 4:00 PM', location: 'Sales Floor', badge: 'Today', color: 'teal' },
            { title: 'Team Meeting', time: '2:00 PM - 3:00 PM', location: 'Conference Room A', badge: 'Today', color: 'purple' },
            { title: 'Night Shift', time: '8:00 PM - 6:00 AM', location: 'Support Department', badge: 'Tomorrow', color: 'blue' }
          ].map((shift, index) => {
            const colorMap = {
              teal: { border: '#14b8a6', bg: 'bg-teal-50', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700' },
              purple: { border: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
              blue: { border: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' }
            };
            const colors = colorMap[shift.color];

            return (
              <div key={index}
                   className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 transition-all duration-300 hover:-translate-y-0.5
                              animate-fadeInUp group cursor-pointer"
                   style={{
                     boxShadow: 'var(--shadow-card)',
                     borderLeft: `4px solid ${colors.border}`,
                     animationDelay: `${0.15 + index * 0.05}s`
                   }}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-teal-600 transition-colors truncate">
                      {shift.title}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">{shift.time}</p>
                    <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
                      <MapPin size={10} className="text-gray-400 flex-shrink-0 sm:hidden" />
                      <MapPin size={12} className="text-gray-400 flex-shrink-0 hidden sm:block" />
                      <p className="text-2xs sm:text-xs text-gray-500 truncate">{shift.location}</p>
                    </div>
                  </div>
                  <span className={`${colors.badge} text-2xs sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold flex-shrink-0`}>
                    {shift.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );

    // History Tab Content - Premium Design
    const HistoryTab = () => (
      <>
        <div className="mb-4 sm:mb-6 mt-2 sm:mt-4 animate-fadeInUp">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-1">Time History</h3>
          <p className="text-gray-500 text-sm sm:text-base">Your attendance records</p>
        </div>

        {/* Weekly Records Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-5 animate-fadeInUp"
             style={{ boxShadow: 'var(--shadow-card)', animationDelay: '0.1s' }}>
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-3 sm:mb-4">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base">This Week</h4>
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-teal-50 border border-teal-200">
              <span className="text-xs sm:text-sm font-bold text-teal-700">Total: 32.5 hrs</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-2.5">
            {[
              { day: 'Monday', in: '8:00 AM', out: '4:30 PM', hours: '8.5' },
              { day: 'Tuesday', in: '8:15 AM', out: '4:45 PM', hours: '8.5' },
              { day: 'Wednesday', in: '8:00 AM', out: '4:00 PM', hours: '8.0' },
              { day: 'Thursday', in: '7:45 AM', out: '4:15 PM', hours: '8.5' },
              { day: 'Friday', in: 'Today', out: '-', hours: 'In Progress' }
            ].map((record, idx) => {
              const isInProgress = record.hours === 'In Progress';
              return (
                <div key={idx}
                     className={`flex justify-between items-center p-2.5 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-200
                                ${isInProgress ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{record.day}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{record.in} - {record.out}</p>
                  </div>
                  <span className={`font-bold text-sm sm:text-base tabular-nums flex-shrink-0
                                   ${isInProgress ? 'text-teal-600' : 'text-gray-900'}`}>
                    {isInProgress ? (
                      <span className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full animate-pulse" />
                        <span className="text-xs sm:text-base">Active</span>
                      </span>
                    ) : (
                      <>{record.hours} hrs</>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium Monthly Summary Card */}
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-4 animate-fadeInUp relative overflow-hidden"
             style={{
               background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)',
               boxShadow: '0 8px 32px rgba(139, 92, 246, 0.35)',
               animationDelay: '0.2s'
             }}>
          {/* Decorative Element */}
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

          <h4 className="font-bold text-white text-base sm:text-lg mb-3 sm:mb-4">Monthly Summary</h4>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            {[
              { label: 'Regular Hours', value: '152.5', suffix: 'hrs' },
              { label: 'Overtime', value: '12.5', suffix: 'hrs' },
              { label: 'Attendance', value: '98', suffix: '%' },
              { label: 'Late Clock-ins', value: '2', suffix: '' }
            ].map((stat, index) => (
              <div key={index} className="glass-dark p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-white/10">
                <p className="text-white/60 text-2xs sm:text-xs font-medium mb-0.5 sm:mb-1">{stat.label}</p>
                <p className="text-white text-lg sm:text-xl md:text-2xl font-black tabular-nums">
                  {stat.value}<span className="text-sm sm:text-base md:text-lg">{stat.suffix}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </>
    );

    // Messages Tab Content - Premium Design
    const MessagesTab = () => {
      const messages = [
        { initials: 'HR', name: 'HR Department', time: '2m ago', preview: 'New policy updates available...', color: 'purple', unread: true },
        { initials: 'JD', name: 'Jane Doe', time: '1h ago', preview: 'Client request needs attention...', color: 'teal', unread: true },
        { initials: 'TS', name: 'Team Support', time: '3h ago', preview: 'Shift change meeting at 3 PM', color: 'orange', unread: true },
        { initials: 'NM', name: 'Nanga Martin', time: 'Yesterday', preview: 'Thanks for covering my shift!', color: 'blue', unread: false }
      ];

      const colorMap = {
        purple: 'bg-purple-100 text-purple-600',
        teal: 'bg-teal-100 text-teal-600',
        orange: 'bg-orange-100 text-orange-600',
        blue: 'bg-blue-100 text-blue-600'
      };

      return (
        <>
          <div className="mb-4 sm:mb-6 mt-2 sm:mt-4 animate-fadeInUp">
            <div className="flex justify-between items-center">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Messages</h3>
              <button className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-white
                                 transition-all duration-300 hover:-translate-y-0.5"
                      style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-button)' }}>
                <Edit2 size={16} className="sm:hidden" />
                <Edit2 size={18} className="hidden sm:block" />
              </button>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">Team communications</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl mb-4 animate-fadeInUp"
               style={{ boxShadow: 'var(--shadow-card)', animationDelay: '0.1s' }}>
            {/* Search Bar */}
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 sm:hidden" />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hidden sm:block" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-100 rounded-lg sm:rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white
                             transition-all duration-200 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Message List */}
            <div className="divide-y divide-gray-100">
              {messages.map((msg, index) => (
                <button key={index}
                        className="w-full p-3 sm:p-4 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2.5 sm:gap-4 group">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${colorMap[msg.color]} rounded-xl sm:rounded-2xl flex items-center justify-center
                                  transition-transform duration-300 group-hover:scale-105 flex-shrink-0`}>
                    <span className="font-bold text-xs sm:text-sm">{msg.initials}</span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-0.5 gap-2">
                      <p className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors text-sm sm:text-base truncate">{msg.name}</p>
                      <span className="text-2xs sm:text-xs text-gray-400 font-medium flex-shrink-0">{msg.time}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{msg.preview}</p>
                  </div>
                  {msg.unread && (
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0"
                         style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      );
    };

    // Profile Tab Content - Premium Design
    const ProfileTab = () => {
      const menuItems = [
        { icon: Settings, label: 'Account Settings', color: 'gray' },
        { icon: Bell, label: 'Notifications', color: 'gray' },
        { icon: Shield, label: 'Privacy & Security', color: 'gray' }
      ];

      return (
        <>
          <div className="mb-4 sm:mb-6 mt-2 sm:mt-4 animate-fadeInUp">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-1">My Profile</h3>
            <p className="text-gray-500 text-sm sm:text-base">Personal information and settings</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 animate-fadeInUp"
               style={{ boxShadow: 'var(--shadow-card)', animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-black"
                     style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-button-hover)' }}>
                  BK
                </div>
                <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-md sm:rounded-lg border-2 border-white
                                flex items-center justify-center">
                  <CheckCircle size={10} className="text-white sm:hidden" />
                  <CheckCircle size={12} className="text-white hidden sm:block" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Brine Ketum</h4>
                <p className="text-gray-500 font-medium text-sm sm:text-base">Team Lead</p>
                <div className="mt-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-teal-50 rounded-md sm:rounded-lg inline-block border border-teal-200">
                  <p className="text-2xs sm:text-xs text-teal-700 font-semibold">#EMP2024001</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              {[
                { label: 'Department', value: 'Sales' },
                { label: 'Email', value: 'brine.ketum@company.com' },
                { label: 'Phone', value: '+1 (555) 123-4567' },
                { label: 'Joined', value: 'January 15, 2024' }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-3.5">
                  <p className="text-2xs sm:text-xs text-gray-400 font-medium mb-0.5 sm:mb-1">{item.label}</p>
                  <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2 sm:space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button key={index}
                        className="w-full bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between
                                   transition-all duration-300 hover:-translate-y-0.5 group animate-fadeInUp"
                        style={{ boxShadow: 'var(--shadow-card)', animationDelay: `${0.15 + index * 0.05}s` }}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center
                                    group-hover:bg-teal-100 transition-colors duration-300">
                      <Icon size={18} className="text-gray-500 group-hover:text-teal-600 transition-colors duration-300 sm:hidden" />
                      <Icon size={20} className="text-gray-500 group-hover:text-teal-600 transition-colors duration-300 hidden sm:block" />
                    </div>
                    <span className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors duration-300 text-sm sm:text-base">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1
                                                     transition-all duration-300 sm:hidden" />
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1
                                                     transition-all duration-300 hidden sm:block" />
                </button>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={() => setCurrentScreen('login')}
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3
                         transition-all duration-300 hover:-translate-y-0.5 animate-fadeInUp"
              style={{
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)',
                animationDelay: '0.3s'
              }}
            >
              <LogOut size={18} className="text-red-500 sm:hidden" />
              <LogOut size={20} className="text-red-500 hidden sm:block" />
              <span className="font-bold text-red-600 text-sm sm:text-base">Log Out</span>
            </button>
          </div>
        </>
      );
    };

    return (
      <div className="h-full relative" style={{ background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)' }}>
        {/* Premium Offline Banner */}
        {isOffline && (
          <div className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 sm:gap-2.5"
               style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <WifiOff size={14} className="text-white sm:hidden" />
            <WifiOff size={16} className="text-white hidden sm:block" />
            <span className="text-xs sm:text-sm font-semibold text-white">Offline Mode - Data will sync when online</span>
          </div>
        )}

        <div className="p-4 sm:p-5 md:p-6 pb-20 sm:pb-24 overflow-auto h-full">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'messages' && <MessagesTab />}
        </div>

        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    );
  };

  const ClockInScreen = () => (
    <div className="h-full overflow-auto" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
      <div className="p-6">
        {/* Premium Back Button */}
        <button
          onClick={() => setCurrentScreen('employeeDashboard')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-6
                     bg-teal-50 text-teal-700 font-semibold transition-all duration-300
                     hover:bg-teal-100 hover:-translate-x-0.5 animate-fadeInUp"
        >
          <ChevronRight className="rotate-180" size={18} />
          Back
        </button>

        <div className="animate-fadeInUp" style={{ animationDelay: '0.05s' }}>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Clock In</h2>
          <p className="text-gray-500 mb-6">Dual-factor authentication required</p>
        </div>

        <div className="space-y-4 mb-6">
          {/* GPS Verification Card */}
          <div className="bg-white rounded-2xl p-5 border-2 border-emerald-400 animate-fadeInUp"
               style={{ boxShadow: 'var(--shadow-card)', animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl
                                flex items-center justify-center"
                     style={{ boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                  <MapPin className="text-white" size={22} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">GPS Location</p>
                  <p className="text-sm text-emerald-600 font-semibold">Verified</p>
                </div>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
              <p className="text-sm text-emerald-800 font-medium">Your Workplace - Main Location</p>
              <p className="text-xs text-emerald-600">You are within the geofence boundary</p>
            </div>
          </div>

          {/* Face Recognition Card */}
          <div className="rounded-2xl p-6 animate-fadeInUp relative overflow-hidden"
               style={{
                 background: 'var(--gradient-primary)',
                 boxShadow: '0 8px 32px rgba(20, 184, 166, 0.35)',
                 animationDelay: '0.15s'
               }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                 style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="glass-dark p-3 rounded-xl border border-white/20">
                  <Camera className="text-white" size={22} />
                </div>
                <div>
                  <p className="font-bold text-white">Facial Recognition</p>
                  <p className="text-sm text-white/70">Required</p>
                </div>
              </div>
              <Clock className="text-white/40" size={28} />
            </div>

            <div className="glass-dark rounded-2xl p-8 mb-5 text-center border border-white/10">
              <Camera size={56} className="text-white mx-auto mb-3" />
              <p className="text-white font-semibold">Position your face</p>
            </div>

            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const location = await getCurrentLocation();
                  const deviceInfo = getDeviceInfo();

                  const { data, error } = await clockIn({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    notes: '',
                    deviceInfo: JSON.stringify(deviceInfo),
                    photoUrl: null
                  });

                  if (error) {
                    alert('Clock in failed: ' + error.message);
                  } else {
                    setIsClocked(true);
                    setCurrentScreen('clockInSuccess');
                  }
                } catch (err) {
                  alert('Error: ' + err.message);
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full bg-white text-teal-600 py-4 rounded-2xl font-bold text-base
                         transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              disabled={loading}
            >
              {loading ? 'Clocking In...' : 'Start Face Scan'}
            </button>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 animate-fadeInUp"
             style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="font-bold text-blue-900 mb-1">Enhanced Security</p>
              <p className="text-sm text-blue-700 leading-relaxed">
                This app uses GPS and facial recognition to ensure you're authorized and in the right location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ClockInSuccessScreen = () => (
    <div className="h-full flex items-center justify-center relative overflow-hidden"
         style={{ background: 'var(--gradient-primary)' }}>
      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
      </div>

      <div className="text-center p-6 relative z-10">
        {/* Success Icon with Animation */}
        <div className="glass-dark p-8 rounded-3xl inline-block mb-8 border border-white/20 animate-fadeInUp"
             style={{ animation: 'fadeInUp 0.6s ease-out, heartbeat 2s ease-in-out infinite 0.6s' }}>
          <CheckCircle size={72} className="text-white" />
        </div>

        <h2 className="text-3xl font-black text-white mb-3 tracking-tight animate-fadeInUp"
            style={{ animationDelay: '0.1s' }}>
          Successfully Clocked In!
        </h2>
        <p className="text-xl text-white/95 font-semibold mb-1 animate-fadeInUp"
           style={{ animationDelay: '0.15s' }}>Brine Ketum</p>
        <p className="text-white/70 mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>Sales Department</p>

        {/* Time Card */}
        <div className="glass-dark rounded-2xl p-6 mb-8 border border-white/10 animate-fadeInUp"
             style={{ animationDelay: '0.25s' }}>
          <p className="text-white/60 text-sm font-medium mb-2">Clock In Time</p>
          <p className="text-white text-4xl font-black tabular-nums mb-4">12:32 PM</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/80 text-sm font-medium">Location Tracking Active</span>
          </div>
        </div>

        <button
          onClick={() => setCurrentScreen('employeeDashboard')}
          className="bg-white text-teal-600 px-10 py-4 rounded-2xl text-base font-bold
                     transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0
                     animate-fadeInUp group"
          style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.15)', animationDelay: '0.3s' }}
        >
          <span className="flex items-center gap-2">
            Continue to Dashboard
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </button>
      </div>
    </div>
  );

  const ClockOutScreen = () => (
    <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => setCurrentScreen('employeeDashboard')} 
            className="bg-teal-100 hover:bg-teal-200 text-teal-700 p-2 rounded-lg transition-all flex items-center gap-2 font-medium"
          >
            <ChevronRight className="rotate-180" size={20} />
            Back
          </button>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Clock Out</h2>
        <p className="text-gray-600 mb-6">Review your shift before clocking out</p>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 mb-6">
          <p className="text-white/80 text-sm mb-1">Total Shift Duration</p>
          <p className="text-white text-4xl font-bold mb-4">8:32:47</p>
          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4">
            <div className="flex justify-between text-white mb-2">
              <span>Clock In:</span>
              <span className="font-bold">8:00:15 AM</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Clock Out:</span>
              <span className="font-bold">4:33:02 PM</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <h4 className="font-bold text-gray-800 mb-4">Shift Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Regular Hours</span>
              <span className="font-bold text-gray-800">8.0 hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overtime</span>
              <span className="font-bold text-gray-800">0.5 hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Break Time</span>
              <span className="font-bold text-gray-800">0.5 hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clients Served</span>
              <span className="font-bold text-gray-800">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location Verified</span>
              <span className="font-bold text-green-600">✓ Yes</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <AlertCircle className="inline mr-2" size={16} />
            Please ensure all records are updated before clocking out
          </p>
        </div>

        <button
          onClick={async () => {
            setLoading(true);
            try {
              const location = await getCurrentLocation();
              const deviceInfo = getDeviceInfo();

              const { data, error } = await clockOut({
                latitude: location.latitude,
                longitude: location.longitude,
                notes: '',
                deviceInfo: JSON.stringify(deviceInfo),
                photoUrl: null
              });

              if (error) {
                alert('Clock out failed: ' + error.message);
              } else {
                setIsClocked(false);
                setCurrentScreen('clockOutSuccess');
              }
            } catch (err) {
              alert('Error: ' + err.message);
            } finally {
              setLoading(false);
            }
          }}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all"
          disabled={loading}
        >
          {loading ? 'Clocking Out...' : 'Confirm Clock Out'}
        </button>
        <button 
          onClick={() => setCurrentScreen('employeeDashboard')}
          className="w-full mt-3 text-gray-600 py-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const ClockOutSuccessScreen = () => (
    <div className="h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
      <div className="text-center p-6">
        <div className="bg-white/20 backdrop-blur-lg p-8 rounded-full inline-block mb-6">
          <Moon size={80} className="text-white" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Great Work Today!</h2>
        <p className="text-xl text-white/90 mb-8">You've been clocked out</p>
        
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <p className="text-white text-2xl font-bold mb-4">8 hours 32 minutes</p>
          <p className="text-white/80 text-sm">12 clients served today</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-8">
          <p className="text-white/90 text-sm mb-2">Tomorrow's Shift</p>
          <p className="text-white font-bold">8:00 AM - 4:00 PM</p>
        </div>

        <button 
          onClick={() => {
            setActiveTab('home');
            setCurrentScreen('employeeDashboard');
          }}
          className="bg-white text-purple-600 px-12 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  const SignupScreen = () => {
    const [selectedRole, setSelectedRole] = useState('');
    const [hoveredRole, setHoveredRole] = useState('');

    // If a role is selected, show the comprehensive registration form
    if (selectedRole === 'organization') {
      return (
        <div className="h-full overflow-auto relative"
             style={{ background: 'linear-gradient(165deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)' }}>
          <OrganizationRegistrationForm
            onSuccess={() => setCurrentScreen('employeeDashboard')}
            onBack={() => setSelectedRole('')}
          />
        </div>
      );
    }

    if (selectedRole === 'manager') {
      return (
        <div className="h-full overflow-auto relative"
             style={{ background: 'linear-gradient(165deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)' }}>
          <EnhancedManagerRegistrationForm
            onSuccess={() => setCurrentScreen('login')}
            onBack={() => setSelectedRole('')}
          />
        </div>
      );
    }

    if (selectedRole === 'employee') {
      return (
        <div className="h-full overflow-auto relative"
             style={{ background: 'linear-gradient(165deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)' }}>
          <EnhancedEmployeeRegistrationForm
            onSuccess={() => setCurrentScreen('login')}
            onBack={() => setSelectedRole('')}
          />
        </div>
      );
    }

    const accountTypes = [
      {
        id: 'organization',
        icon: Building2,
        title: 'Organization',
        subtitle: 'Register a new company',
        description: 'Set up your organization with full admin access, manage employees, and configure settings.',
        gradient: 'linear-gradient(145deg, #0d9488 0%, #0891b2 60%, #0284c7 100%)',
        shadowColor: 'rgba(13,148,136,0.28)',
        features: ['Admin dashboard', 'Employee management', 'Custom settings']
      },
      {
        id: 'manager',
        icon: Shield,
        title: 'Manager',
        subtitle: 'Join as administrator',
        description: 'Request manager access to an existing organization or create a new one.',
        gradient: 'linear-gradient(145deg, #7c3aed 0%, #6366f1 60%, #4f46e5 100%)',
        shadowColor: 'rgba(124,58,237,0.28)',
        features: ['Team oversight', 'Approval workflows', 'Reports access']
      },
      {
        id: 'employee',
        icon: Users,
        title: 'Employee',
        subtitle: 'Join as staff member',
        description: 'Join your organization to clock in/out, view schedules, and track your time.',
        gradient: 'linear-gradient(145deg, #059669 0%, #10b981 60%, #34d399 100%)',
        shadowColor: 'rgba(5,150,105,0.28)',
        features: ['Clock in/out', 'View schedules', 'Track hours']
      }
    ];

    // Default: Show role selection
    return (
      <div className="h-full overflow-auto relative"
           style={{ background: 'linear-gradient(168deg, #fafbfc 0%, #f1f5f9 35%, #e8eef5 70%, #f4f7fa 100%)' }}>

        {/* Refined Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 65%)' }} />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 65%)' }} />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.05) 0%, transparent 55%)' }} />
          <div className="absolute inset-0 opacity-[0.015]"
               style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        {/* Back Button */}
        <div className="relative z-10 px-5 pt-5">
          <button
            onClick={() => setCurrentScreen('login')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white
                       border border-gray-200 hover:bg-gray-50 hover:border-gray-300
                       transition-all duration-200 ease-out group"
            style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} className="text-gray-600 group-hover:text-gray-800 group-hover:-translate-x-0.5 transition-all duration-200" />
            <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800">Back</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-6 pt-5 pb-10">
          {/* Header */}
          <div className="text-center mb-7 animate-fadeInUp">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                 style={{
                   background: 'linear-gradient(145deg, #0d9488 0%, #0891b2 60%, #0284c7 100%)',
                   boxShadow: '0 4px 14px rgba(13,148,136,0.25), 0 2px 6px rgba(13,148,136,0.15)'
                 }}>
              <UserPlus size={30} strokeWidth={2} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-base md:text-lg font-medium">
              Choose how you want to join ClockWise Pro
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="space-y-3 mb-7">
            {accountTypes.map((type, index) => {
              const Icon = type.icon;
              const isHovered = hoveredRole === type.id;
              const primaryColor = type.gradient.includes('0d9488') ? '#0d9488' : type.gradient.includes('7c3aed') ? '#7c3aed' : '#059669';

              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedRole(type.id)}
                  onMouseEnter={() => setHoveredRole(type.id)}
                  onMouseLeave={() => setHoveredRole('')}
                  className="w-full text-left bg-white rounded-2xl p-5
                             border border-gray-100
                             transition-all duration-200 ease-out animate-fadeInUp group relative overflow-hidden"
                  style={{
                    animationDelay: `${index * 0.08}s`,
                    boxShadow: isHovered
                      ? `0 6px 20px ${type.shadowColor.replace('0.28', '0.18')}, 0 2px 8px rgba(0,0,0,0.04)`
                      : '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)',
                    borderColor: isHovered ? type.shadowColor.replace('0.28', '0.22') : 'rgba(0,0,0,0.04)',
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
                  }}
                >
                  {/* Subtle gradient overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${type.shadowColor.replace('0.28', '0.04')} 0%, transparent 60%)` }}
                  />

                  <div className="flex items-start gap-3.5 relative">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ease-out"
                         style={{
                           background: isHovered ? type.gradient : 'linear-gradient(145deg, #f8f9fa 0%, #eef0f2 100%)',
                           boxShadow: isHovered
                             ? `0 3px 10px ${type.shadowColor.replace('0.28', '0.20')}`
                             : 'inset 0 1px 2px rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.04)'
                         }}>
                      <Icon size={22} strokeWidth={2} className={`transition-all duration-200 ${isHovered ? 'text-white' : 'text-gray-400'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 leading-tight">{type.title}</h3>
                          <p className="text-sm font-semibold text-gray-500 mt-0.5">{type.subtitle}</p>
                        </div>
                        {/* Unified Arrow Placement - vertically centered with title area */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                             style={{
                               background: isHovered ? type.shadowColor.replace('0.28', '0.12') : 'rgba(0,0,0,0.04)'
                             }}>
                          <ChevronRight
                            size={18}
                            strokeWidth={2.5}
                            className={`transition-all duration-200 ${isHovered ? 'translate-x-0.5' : ''}`}
                            style={{ color: isHovered ? primaryColor : '#6b7280' }}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2 pr-6">{type.description}</p>

                      {/* Feature Pills */}
                      <div className="flex flex-wrap gap-2">
                        {type.features.map((feature, i) => (
                          <span key={i}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200"
                                style={{
                                  background: isHovered ? type.shadowColor.replace('0.28', '0.10') : 'rgba(0,0,0,0.04)',
                                  color: isHovered ? primaryColor : '#374151'
                                }}>
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Banner */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 animate-fadeInUp"
               style={{ animationDelay: '0.25s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg
                              flex items-center justify-center"
                   style={{
                     background: 'linear-gradient(145deg, #f0fdfa 0%, #ccfbf1 100%)',
                     boxShadow: '0 2px 4px rgba(13,148,136,0.1)'
                   }}>
                <Shield size={20} strokeWidth={2} className="text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 mb-0.5">Secure Registration</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Enterprise-grade encryption protects your data.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <p className="text-gray-600 text-sm font-medium">
              Already have an account?{' '}
              <button
                onClick={() => setCurrentScreen('login')}
                className="text-teal-600 font-bold hover:text-teal-700 transition-colors duration-200"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const ManagerLoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);

    const handleManagerLogin = async () => {
      // Validate inputs
      if (!email.trim()) {
        setLoginError('Please enter your email');
        return;
      }
      if (!password) {
        setLoginError('Please enter your password');
        return;
      }

      setLoginError('');
      setLoginLoading(true);

      try {
        // Sign in with Supabase
        const { data, error: signInError } = await signIn(email, password);

        if (signInError) {
          setLoginError(signInError.message || 'Invalid email or password');
          setLoginLoading(false);
          return;
        }

        // Get user profile to check role and status
        const { data: profile, error: profileError } = await getCurrentUserProfile();

        if (profileError || !profile) {
          setLoginError('Unable to retrieve profile. Please try again.');
          await signOut();
          setLoginLoading(false);
          return;
        }

        // Verify this is a manager or admin account
        if (profile.role !== 'manager' && profile.role !== 'admin') {
          setLoginError('This login is for managers only. Please use Employee Login.');
          await signOut();
          setLoginLoading(false);
          return;
        }

        // Check if account is approved and active
        if (profile.employee_status === 'pending') {
          setLoginError('Your manager account is pending approval. Please wait for administrator approval.');
          await signOut();
          setLoginLoading(false);
          return;
        }

        if (profile.employee_status === 'suspended') {
          setLoginError('Your account has been suspended. Please contact the system administrator.');
          await signOut();
          setLoginLoading(false);
          return;
        }

        if (!profile.is_active) {
          setLoginError('Your account is inactive. Please contact the system administrator.');
          await signOut();
          setLoginLoading(false);
          return;
        }

        // Login successful!
        setUser(data.user);
        setUserProfile(profile);
        setCurrentScreen('managerDashboard');
      } catch (err) {
        console.error('Manager login error:', err);
        setLoginError('An unexpected error occurred. Please try again.');
      } finally {
        setLoginLoading(false);
      }
    };

    return (
      <div className="h-full overflow-auto relative"
           style={{ background: 'linear-gradient(165deg, #f8fafc 0%, #ede9fe 50%, #f1f5f9 100%)' }}>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-30"
               style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        </div>

        {/* Back Button */}
        <div className="relative z-10 px-5 pt-5">
          <button
            onClick={() => setCurrentScreen('login')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 backdrop-blur-sm
                       border border-gray-200/50 hover:bg-white/80 transition-all duration-300 group"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <ChevronLeft size={18} className="text-gray-600 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium text-gray-600">Back</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-6 pt-8 pb-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-10 animate-fadeInUp">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-[1.75rem] blur-2xl opacity-40"
                   style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' }} />
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-[1.75rem] flex items-center justify-center"
                   style={{
                     background: 'linear-gradient(165deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%)',
                     boxShadow: '0 8px 24px rgba(124,58,237,0.35), inset 0 1px 1px rgba(255,255,255,0.2)'
                   }}>
                <Shield size={40} className="text-white md:w-12 md:h-12" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 text-center mb-2 tracking-tight">
              Manager Access
            </h1>
            <p className="text-gray-500 text-center text-base md:text-lg font-medium">
              Administrative Dashboard Login
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-fadeInUp">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{loginError}</p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-6 animate-fadeInUp"
               style={{
                 animationDelay: '0.1s',
                 boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)'
               }}>
            <div className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2.5 block tracking-wide">
                  Manager Email
                </label>
                <div className={`relative transition-all duration-300 ${focusedInput === 'email' ? 'scale-[1.01]' : ''}`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail size={20} className={`transition-colors duration-300 ${focusedInput === 'email' ? 'text-purple-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    disabled={loginLoading}
                    className="w-full pl-12 pr-5 py-4 bg-white border-2 border-gray-100 rounded-2xl
                               focus:border-purple-500 focus:outline-none focus:bg-white
                               transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium
                               disabled:bg-gray-50 disabled:cursor-not-allowed"
                    style={{ boxShadow: focusedInput === 'email' ? '0 4px 20px rgba(124,58,237,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2.5 block tracking-wide">
                  Password
                </label>
                <div className={`relative transition-all duration-300 ${focusedInput === 'password' ? 'scale-[1.01]' : ''}`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock size={20} className={`transition-colors duration-300 ${focusedInput === 'password' ? 'text-purple-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    disabled={loginLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleManagerLogin()}
                    className="w-full pl-12 pr-14 py-4 bg-white border-2 border-gray-100 rounded-2xl
                               focus:border-purple-500 focus:outline-none focus:bg-white
                               transition-all duration-300 text-gray-800 placeholder-gray-400 font-medium
                               disabled:bg-gray-50 disabled:cursor-not-allowed"
                    style={{ boxShadow: focusedInput === 'password' ? '0 4px 20px rgba(124,58,237,0.12)' : '0 2px 8px rgba(0,0,0,0.04)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400
                               hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button className="text-purple-600 text-sm font-semibold hover:text-purple-700
                                   transition-colors duration-200 hover:underline underline-offset-4">
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-purple-50/80 backdrop-blur-sm border border-purple-200 rounded-2xl p-4 mb-6 animate-fadeInUp"
               style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-purple-600 flex-shrink-0" />
              <p className="text-sm text-purple-800 font-medium">
                Enhanced security: Manager accounts have elevated permissions
              </p>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleManagerLogin}
            disabled={loginLoading}
            className={`w-full text-white py-4 rounded-2xl font-bold text-base
                       transition-all duration-300 animate-fadeInUp group relative overflow-hidden
                       ${loginLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            style={{
              background: 'linear-gradient(165deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35), inset 0 1px 1px rgba(255,255,255,0.15)',
              animationDelay: '0.2s'
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loginLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Manager Login
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>

          {/* Register Link */}
          <div className="mt-6 text-center animate-fadeInUp" style={{ animationDelay: '0.25s' }}>
            <p className="text-gray-600 text-sm font-medium">
              Need manager access?{' '}
              <button
                onClick={() => setCurrentScreen('signup')}
                className="text-purple-600 font-bold hover:text-purple-700 transition-colors duration-200"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const ManagerDashboardScreen = () => {
    const [activeManagerTab, setActiveManagerTab] = useState('dashboard');
    const [dashboardStats, setDashboardStats] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState('');
    const [employees, setEmployees] = useState([]);
    const [pendingEmployees, setPendingEmployees] = useState([]);

    // Load dashboard stats on mount
    useEffect(() => {
      const loadDashboardData = async () => {
        try {
          setDashboardLoading(true);
          setDashboardError('');

          // Fetch dashboard stats
          const { data: statsData, error: statsError } = await getOrganizationDashboardStats();
          if (statsError) {
            console.error('Dashboard stats error:', statsError);
            // Set default stats if RPC not available
            setDashboardStats({
              total_employees: 0,
              clocked_in_count: 0,
              on_break_count: 0,
              pending_approvals: 0,
              attendance_rate: 0,
              total_hours_today: 0
            });
          } else {
            setDashboardStats(statsData || {
              total_employees: 0,
              clocked_in_count: 0,
              on_break_count: 0,
              pending_approvals: 0,
              attendance_rate: 0,
              total_hours_today: 0
            });
          }

          // Fetch employees list
          const { data: empData, error: empError } = await searchEmployees({
            status: 'active',
            limit: 100
          });
          if (!empError && empData) {
            setEmployees(empData);
          }

          // Fetch pending employees
          const { data: pendingData, error: pendingError } = await searchEmployees({
            status: 'pending',
            limit: 50
          });
          if (!pendingError && pendingData) {
            setPendingEmployees(pendingData);
          }

        } catch (err) {
          console.error('Dashboard load error:', err);
          setDashboardError('Failed to load dashboard data');
        } finally {
          setDashboardLoading(false);
        }
      };

      loadDashboardData();
    }, []);
    
    // Manager Bottom Navigation Component
    const ManagerBottomNav = () => {
      const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: null },
        { id: 'staff', label: 'Staff', icon: Users, badge: employees.length > 0 ? String(employees.length) : null },
        { id: 'approvals', label: 'Approvals', icon: UserCheck, badge: pendingEmployees.length > 0 ? String(pendingEmployees.length) : null },
        { id: 'alerts', label: 'Alerts', icon: AlertCircle, badge: dashboardStats?.pending_approvals > 0 ? String(dashboardStats.pending_approvals) : null },
        { id: 'ai', label: 'AI Chat', icon: Zap, badge: 'AI' }
      ];

      return (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200" style={{borderBottomLeftRadius: '47px', borderBottomRightRadius: '47px'}}>
          <div className="flex items-center justify-around py-2 pb-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'ai') {
                      setCurrentScreen('managerAIChat');
                    } else {
                      setActiveManagerTab(item.id);
                    }
                  }}
                  className={`flex flex-col items-center p-2 relative transition-all ${
                    activeManagerTab === item.id ? 'text-purple-600' : 'text-gray-500'
                  }`}
                >
                  <div className="relative">
                    <Icon size={24} />
                    {item.badge && (
                      <div className={`absolute -top-2 -right-2 ${
                        item.badge === 'AI' 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-xs px-1.5'
                          : parseInt(item.badge) > 10 
                            ? 'bg-red-500'
                            : 'bg-orange-500'
                      } text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center font-bold`}>
                        {item.badge}
                      </div>
                    )}
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    };
    
    // Dashboard Tab Content
    const DashboardContent = () => {
      // Show loading state
      if (dashboardLoading) {
        return (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        );
      }

      // Show error state
      if (dashboardError) {
        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-4">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <AlertCircle size={24} />
              <p className="font-semibold">Error Loading Dashboard</p>
            </div>
            <p className="text-red-500 text-sm">{dashboardError}</p>
          </div>
        );
      }

      const stats = dashboardStats || {};

      return (
      <>
        <div className="flex justify-between items-center mb-6 mt-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Manager Dashboard</h3>
            <p className="text-gray-600">{userProfile?.organization_name || 'Organization'} • ID: {userProfile?.employee_number || 'MGR'}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentScreen('aiAnalytics')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-full shadow-md"
            >
              <BarChart3 size={20} className="text-white" />
            </button>
            <button onClick={() => signOut()} className="bg-white p-3 rounded-full shadow-md">
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setCurrentScreen('currentlyClocked')}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white hover:shadow-lg transition-all"
          >
            <Users size={28} className="mb-2" />
            <p className="text-3xl font-bold mb-1">{stats.clocked_in_count || 0}</p>
            <p className="text-sm opacity-90">Currently Clocked In</p>
          </button>
          <button
            onClick={() => setCurrentScreen('staffToday')}
            className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-5 text-white hover:shadow-lg transition-all"
          >
            <Activity size={28} className="mb-2" />
            <p className="text-3xl font-bold mb-1">{stats.total_employees || 0}</p>
            <p className="text-sm opacity-90">Total Staff</p>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <h4 className="font-bold text-gray-800 mb-4">Department Overview</h4>
          <div className="space-y-3">
            <button 
              onClick={() => setCurrentScreen('departmentDetail')}
              className="w-full flex justify-between items-center hover:bg-gray-50 p-2 rounded transition-all"
            >
              <span className="text-gray-600">Sales</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">6/8</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-3/4 h-full bg-green-500 rounded-full"></div>
                </div>
              </div>
            </button>
            <button 
              onClick={() => setCurrentScreen('departmentDetail')}
              className="w-full flex justify-between items-center hover:bg-gray-50 p-2 rounded transition-all"
            >
              <span className="text-gray-600">Support</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">8/8</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-full h-full bg-green-500 rounded-full"></div>
                </div>
              </div>
            </button>
            <button 
              onClick={() => setCurrentScreen('departmentDetail')}
              className="w-full flex justify-between items-center hover:bg-gray-50 p-2 rounded transition-all"
            >
              <span className="text-gray-600">HR</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">5/7</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-4/5 h-full bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </button>
            <button 
              onClick={() => setCurrentScreen('departmentDetail')}
              className="w-full flex justify-between items-center hover:bg-gray-50 p-2 rounded transition-all"
            >
              <span className="text-gray-600">Operations</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">5/6</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-5/6 h-full bg-green-500 rounded-full"></div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Manual Clock In/Out Button */}
        <button 
          onClick={() => setCurrentScreen('managerClockInOut')}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={28} />
              <div className="text-left">
                <p className="font-bold text-lg">Manual Clock In/Out</p>
                <p className="text-white/80 text-sm">Clock employees in or out manually</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-white/60" />
          </div>
        </button>

        {/* Shift Management Button */}
        <button 
          onClick={() => setCurrentScreen('shiftManagement')}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={28} />
              <div className="text-left">
                <p className="font-bold text-lg">Shift Management</p>
                <p className="text-white/80 text-sm">Assign & manage employee schedules</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-white/60" />
          </div>
        </button>

        {(pendingEmployees.length > 0 || stats.pending_approvals > 0) && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white mb-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle size={24} />
              <p className="font-bold">{pendingEmployees.length + (stats.pending_approvals || 0)} Items Require Attention</p>
            </div>
            {pendingEmployees.length > 0 && (
              <p className="text-sm opacity-90">• {pendingEmployees.length} employee{pendingEmployees.length !== 1 ? 's' : ''} pending approval</p>
            )}
            {stats.on_break_count > 0 && (
              <p className="text-sm opacity-90">• {stats.on_break_count} employee{stats.on_break_count !== 1 ? 's' : ''} currently on break</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <p className="text-2xl font-bold text-green-600">{stats.attendance_rate ? `${stats.attendance_rate.toFixed(1)}%` : '0%'}</p>
            <p className="text-xs text-gray-600">Attendance Rate</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.total_hours_today || 0}</p>
            <p className="text-xs text-gray-600">Hours Today</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-md text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.on_break_count || 0}</p>
            <p className="text-xs text-gray-600">On Break</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h4 className="font-bold text-gray-800 mb-3">Recent Activities</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">John Doh clocked in</span>
              <span className="text-xs text-gray-400 ml-auto">2m ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Break alert: Sarah Zoa</span>
              <span className="text-xs text-gray-400 ml-auto">15m ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Shift swap request pending</span>
              <span className="text-xs text-gray-400 ml-auto">1h ago</span>
            </div>
          </div>
        </div>
      </>
      );
    };

    // Staff Tab Content
    const StaffContent = () => (
      <>
        <div className="mb-6 mt-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Staff Management</h3>
          <p className="text-gray-600">{employees.length} employee{employees.length !== 1 ? 's' : ''} currently active</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
            <Users size={24} className="mb-2" />
            <p className="text-2xl font-bold">{dashboardStats?.clocked_in_count || 0}/{dashboardStats?.total_employees || 0}</p>
            <p className="text-sm opacity-90">Staff Present</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
            <Clock size={24} className="mb-2 clock-spin-slow" />
            <p className="text-2xl font-bold">{dashboardStats?.total_hours_today || 0}</p>
            <p className="text-sm opacity-90">Total Hours Today</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
          <h4 className="font-bold text-gray-800 mb-3">Active Staff</h4>
          <div className="space-y-3">
            {[
              { name: 'John Doh', dept: 'Sales', status: 'On Duty', time: '4h 32m' },
              { name: 'Brine Ketum', dept: 'Sales', status: 'On Duty', time: '3h 15m' },
              { name: 'Mike Ondoa', dept: 'HR', status: 'On Break', time: '5h 45m' },
              { name: 'Sarah Zoa', dept: 'Operations', status: 'On Duty', time: '2h 10m' },
              { name: 'Tom Evina', dept: 'IT Support', status: 'On Duty', time: '6h 20m' }
            ].map((staff, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{staff.name}</p>
                  <p className="text-xs text-gray-600">{staff.dept}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    staff.status === 'On Duty' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {staff.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{staff.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
    
    // Approvals Tab Content
    const ApprovalsContent = () => {
      const [approvingId, setApprovingId] = useState(null);

      const handleApproveEmployee = async (employee) => {
        if (approvingId) return;
        setApprovingId(employee.user_id);
        try {
          // Generate employee number: EMP + current year + random 4 digits
          const empNumber = `EMP${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
          const { error } = await approveEmployee(employee.user_id, empNumber, new Date().toISOString().split('T')[0]);
          if (error) {
            console.error('Approval error:', error);
            alert('Failed to approve employee: ' + (error.message || 'Unknown error'));
          } else {
            // Remove from pending list
            setPendingEmployees(prev => prev.filter(e => e.user_id !== employee.user_id));
          }
        } catch (err) {
          console.error('Approval exception:', err);
          alert('An error occurred while approving');
        } finally {
          setApprovingId(null);
        }
      };

      return (
      <>
        <div className="mb-6 mt-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Pending Approvals</h3>
          <p className="text-gray-600">{pendingEmployees.length} employee{pendingEmployees.length !== 1 ? 's' : ''} need{pendingEmployees.length === 1 ? 's' : ''} your attention</p>
        </div>

        {pendingEmployees.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">All Caught Up!</h4>
            <p className="text-gray-600">No pending employee approvals at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingEmployees.map((employee) => (
              <div key={employee.user_id} className="bg-white rounded-xl p-4 shadow-md border-l-4 border-amber-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                      New Employee
                    </span>
                    <p className="font-semibold text-gray-800 mt-2">
                      {employee.first_name} {employee.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                    {employee.department_name && (
                      <p className="text-xs text-gray-500 mt-1">Department: {employee.department_name}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Applied: {new Date(employee.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-amber-600 font-bold">PENDING</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApproveEmployee(employee)}
                    disabled={approvingId === employee.user_id}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approvingId === employee.user_id ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    disabled={approvingId === employee.user_id}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
      );
    };
    
    // Alerts Tab Content
    const AlertsContent = () => (
      <>
        <div className="mb-6 mt-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">System Alerts</h3>
          <p className="text-gray-600">12 active alerts</p>
        </div>
        
        <div className="space-y-3">
          {[
            { level: 'critical', message: 'Employee timeout detected - Room 302', time: '2m ago' },
            { level: 'warning', message: 'Unusual clock-in location: David Park', time: '15m ago' },
            { level: 'critical', message: 'Equipment not returned: ECG-045', time: '30m ago' },
            { level: 'info', message: 'Shift change reminder - 3:00 PM', time: '1h ago' },
            { level: 'warning', message: 'Low staff coverage - HR (5/7)', time: '2h ago' },
            { level: 'critical', message: 'Overtime threshold exceeded - Lisa Chen', time: '3h ago' },
            { level: 'info', message: 'System maintenance scheduled tonight', time: '4h ago' }
          ].map((alert, idx) => (
            <div key={idx} className={`bg-white rounded-xl p-4 shadow-md border-l-4 ${
              alert.level === 'critical' ? 'border-red-500' :
              alert.level === 'warning' ? 'border-orange-500' :
              'border-blue-500'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <AlertCircle className={`flex-shrink-0 ${
                    alert.level === 'critical' ? 'text-red-500' :
                    alert.level === 'warning' ? 'text-orange-500' :
                    'text-blue-500'
                  }`} size={20} />
                  <div>
                    <p className="font-medium text-gray-800">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
                <button className="text-xs text-gray-500 hover:text-gray-700">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
    
    // Reports Tab Content
    const ReportsContent = () => (
      <>
        <div className="mb-6 mt-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Reports & Analytics</h3>
          <p className="text-gray-600">Performance insights and trends</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp size={24} />
            <h3 className="text-lg font-bold">Weekly Performance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/80 text-sm">Efficiency</p>
              <p className="text-2xl font-bold">↑ 12.5%</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Client Satisfaction</p>
              <p className="text-2xl font-bold">4.8/5.0</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
            <BarChart3 className="text-purple-500 mb-2" size={24} />
            <p className="font-semibold text-gray-800">Staff Report</p>
            <p className="text-xs text-gray-600">Weekly summary</p>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
            <Activity className="text-blue-500 mb-2" size={24} />
            <p className="font-semibold text-gray-800">Attendance</p>
            <p className="text-xs text-gray-600">Monthly report</p>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
            <Clock className="text-green-500 mb-2" size={24} />
            <p className="font-semibold text-gray-800">Overtime</p>
            <p className="text-xs text-gray-600">Detailed analysis</p>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all">
            <Heart className="text-red-500 mb-2" size={24} />
            <p className="font-semibold text-gray-800">Service Quality</p>
            <p className="text-xs text-gray-600">Quality metrics</p>
          </button>
        </div>
        
        <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold">
          Generate Custom Report
        </button>
      </>
    );
    
    return (
      <div className="h-full bg-gradient-to-b from-purple-50 to-white relative">
        <div className="h-full overflow-auto pb-20">
          <div className="p-6">
            {activeManagerTab === 'dashboard' && <DashboardContent />}
            {activeManagerTab === 'staff' && <StaffContent />}
            {activeManagerTab === 'approvals' && <ApprovalsContent />}
            {activeManagerTab === 'alerts' && <AlertsContent />}
          </div>
        </div>
        
        <ManagerBottomNav />
      </div>
    );
  };

  // AI Analytics Screen for Managers
  const AIAnalyticsScreen = () => {
    const [activeAnalysis, setActiveAnalysis] = useState('overview');
    
    return (
      <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => setCurrentScreen('managerDashboard')} 
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-all flex items-center gap-2 font-medium"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl">
              <Zap size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">AI Analytics Center</h2>
              <p className="text-gray-600">Powered by ClockWise Intelligence™</p>
            </div>
          </div>

          {/* Analysis Tabs */}
          <div className="bg-white rounded-xl p-1 shadow-md mb-6">
            <div className="flex gap-1">
              {['overview', 'predictions', 'optimization', 'insights'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveAnalysis(tab)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all capitalize ${
                    activeAnalysis === tab 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeAnalysis === 'overview' && (
            <>
              {/* AI Score Card */}
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white mb-6">
                <h3 className="text-lg font-bold mb-4">AI Performance Score</h3>
                <div className="text-5xl font-bold mb-2">94.2%</div>
                <p className="text-white/80 mb-4">Overall Efficiency Rating</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                    <p className="text-white/80 text-sm">Staff Utilization</p>
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-xs text-white/60 mt-1">↑ 5% from last week</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                    <p className="text-white/80 text-sm">Cost Efficiency</p>
                    <p className="text-2xl font-bold">$1.2K</p>
                    <p className="text-xs text-white/60 mt-1">Saved this week</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                    <p className="text-white/80 text-sm">Client Satisfaction</p>
                    <p className="text-2xl font-bold">4.8/5</p>
                    <p className="text-xs text-white/60 mt-1">Based on 127 reviews</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                    <p className="text-white/80 text-sm">Schedule Accuracy</p>
                    <p className="text-2xl font-bold">96%</p>
                    <p className="text-xs text-white/60 mt-1">Prediction success</p>
                  </div>
                </div>
              </div>

              {/* Real-time Metrics */}
              <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
                <h4 className="font-bold text-gray-800 mb-4">Live AI Monitoring</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Optimal Staffing Level</span>
                    </div>
                    <span className="text-green-700 font-bold">All departments covered</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Predicted Rush Hour</span>
                    </div>
                    <span className="text-yellow-700 font-bold">2:00 PM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Automated Scheduling</span>
                    </div>
                    <span className="text-blue-700 font-bold">3 shifts optimized today</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Predictions Tab */}
          {activeAnalysis === 'predictions' && (
            <>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white mb-6">
                <h4 className="font-bold text-lg mb-3">AI Predictions for Next 7 Days</h4>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4">
                  <div className="space-y-2">
                    <p>🎯 <span className="font-bold">85% chance</span> of increased workload on Monday</p>
                    <p>⚠️ <span className="font-bold">High risk</span> of staff shortage in Operations (Wed)</p>
                    <p>📈 <span className="font-bold">Overtime likely</span> for Support Team (Weekend)</p>
                    <p>✅ <span className="font-bold">Optimal conditions</span> Tuesday & Thursday</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
                <h4 className="font-bold text-gray-800 mb-4">Staffing Predictions by Department</h4>
                <div className="space-y-3">
                  {[
                    { dept: 'Support', needed: 12, predicted: 10, risk: 'high' },
                    { dept: 'Sales', needed: 8, predicted: 8, risk: 'low' },
                    { dept: 'HR', needed: 6, predicted: 4, risk: 'critical' },
                    { dept: 'Operations', needed: 5, predicted: 6, risk: 'optimal' }
                  ].map((dept, idx) => (
                    <div key={idx} className="border-l-4 border-gray-200 pl-4 py-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{dept.dept}</p>
                          <p className="text-sm text-gray-600">Need: {dept.needed} | Predicted: {dept.predicted}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          dept.risk === 'critical' ? 'bg-red-100 text-red-700' :
                          dept.risk === 'high' ? 'bg-orange-100 text-orange-700' :
                          dept.risk === 'optimal' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {dept.risk.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all">
                Apply AI Recommendations to Schedule
              </button>
            </>
          )}

          {/* Optimization Tab */}
          {activeAnalysis === 'optimization' && (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
                <h4 className="font-bold text-gray-800 mb-4">AI Optimization Opportunities</h4>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <TrendingUp size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-purple-800">Shift Pattern Optimization</p>
                        <p className="text-sm text-gray-700 mt-1">
                          AI detected inefficient shift overlaps. Reorganizing can save 12 hours/week.
                        </p>
                        <button className="text-purple-600 text-sm font-medium mt-2">
                          View Suggested Schedule →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-800">Cross-Training Recommendation</p>
                        <p className="text-sm text-gray-700 mt-1">
                          Train 3 staff members in Support procedures to increase flexibility by 40%.
                        </p>
                        <button className="text-blue-600 text-sm font-medium mt-2">
                          Generate Training Plan →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Clock size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-green-800">Break Time Optimization</p>
                        <p className="text-sm text-gray-700 mt-1">
                          Staggering breaks can maintain 100% coverage and reduce wait times by 15%.
                        </p>
                        <button className="text-green-600 text-sm font-medium mt-2">
                          Implement Smart Breaks →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-5 text-white">
                <h4 className="font-bold mb-3">Potential Monthly Savings</h4>
                <p className="text-4xl font-bold mb-2">$18,450</p>
                <p className="text-white/80 text-sm">By implementing all AI recommendations</p>
              </div>
            </>
          )}

          {/* Insights Tab */}
          {activeAnalysis === 'insights' && (
            <>
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white mb-6">
                <h4 className="font-bold text-lg mb-4">AI-Generated Insights</h4>
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                    <p className="text-sm">💡 <span className="font-bold">Pattern Detected:</span> Employees who take regular breaks show 23% higher productivity</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                    <p className="text-sm">🔍 <span className="font-bold">Anomaly:</span> Thursday night shifts have 40% more overtime - consider adding 1 staff</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                    <p className="text-sm">📊 <span className="font-bold">Trend:</span> Client satisfaction correlates with staff-to-client ratio above 1:4</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                    <p className="text-sm">🎯 <span className="font-bold">Recommendation:</span> Implement 4-day work week pilot in Operations dept</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setCurrentScreen('managerAIChat')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Zap size={20} />
                Ask AI Assistant for Custom Analysis
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Notifications Screen
  const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(true);
    const [notifError, setNotifError] = useState('');
    const [filter, setFilter] = useState('all');
    const [markingRead, setMarkingRead] = useState(false);

    // Load notifications on mount
    useEffect(() => {
      const loadNotifications = async () => {
        try {
          setNotifLoading(true);
          setNotifError('');
          const { data, error } = await getMyNotifications(50);
          if (error) {
            setNotifError(error.message || 'Failed to load notifications');
          } else {
            setNotifications(data || []);
          }
        } catch (err) {
          setNotifError(err.message || 'An error occurred');
        } finally {
          setNotifLoading(false);
        }
      };
      loadNotifications();
    }, []);

    // Format time ago
    const formatTimeAgo = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    };

    // Get notification styling based on type/priority
    const getNotificationStyle = (notification) => {
      const type = notification.notification_type || notification.priority || 'info';
      switch (type) {
        case 'urgent':
        case 'high':
        case 'warning':
          return { color: 'bg-red-50 border-red-200', iconColor: 'text-red-600', Icon: AlertCircle };
        case 'success':
        case 'approval':
          return { color: 'bg-green-50 border-green-200', iconColor: 'text-green-600', Icon: CheckCircle };
        case 'schedule':
        case 'shift':
          return { color: 'bg-purple-50 border-purple-200', iconColor: 'text-purple-600', Icon: Calendar };
        case 'break':
          return { color: 'bg-orange-50 border-orange-200', iconColor: 'text-orange-600', Icon: Coffee };
        case 'system':
          return { color: 'bg-gray-50 border-gray-200', iconColor: 'text-gray-600', Icon: Shield };
        default:
          return { color: 'bg-blue-50 border-blue-200', iconColor: 'text-blue-600', Icon: Bell };
      }
    };

    // Handle mark single as read
    const handleMarkAsRead = async (notificationId) => {
      try {
        const { error } = await markNotificationAsRead(notificationId);
        if (!error) {
          setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          ));
        }
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
      setMarkingRead(true);
      try {
        const { error } = await markAllNotificationsAsRead();
        if (!error) {
          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
      } catch (err) {
        console.error('Error marking all as read:', err);
      } finally {
        setMarkingRead(false);
      }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !n.is_read;
      return (n.notification_type || '').toLowerCase().includes(filter) ||
             (n.priority || '').toLowerCase().includes(filter);
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
      <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setCurrentScreen('employeeDashboard')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-all flex items-center gap-2 font-medium"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back
            </button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-6">Stay updated with alerts</p>

          {/* Notification Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {['all', 'unread', 'urgent', 'schedule', 'system'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {notifLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading notifications...</span>
            </div>
          )}

          {/* Error State */}
          {notifError && !notifLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-red-700">{notifError}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!notifLoading && !notifError && filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium">No notifications</p>
              <p className="text-gray-400 text-sm">You're all caught up!</p>
            </div>
          )}

          {/* Notifications List */}
          {!notifLoading && !notifError && filteredNotifications.length > 0 && (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const style = getNotificationStyle(notification);
                const Icon = style.Icon;
                return (
                  <div
                    key={notification.id}
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                    className={`${style.color} border rounded-xl p-4 transition-all hover:shadow-md cursor-pointer
                               ${!notification.is_read ? 'border-l-4' : 'opacity-75'}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={20} className={`mt-1 ${style.iconColor}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-semibold text-gray-800 ${!notification.is_read ? '' : 'font-normal'}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500">{formatTimeAgo(notification.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message || notification.body}</p>
                        {!notification.is_read && (
                          <span className="inline-block mt-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mark All as Read Button */}
          {!notifLoading && notifications.length > 0 && (
            <div className="mt-6 space-y-3">
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingRead || unreadCount === 0}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {markingRead ? 'Marking...' : `Mark All as Read${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
              </button>
              <button className="w-full bg-white border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                Notification Settings
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Break Management Screen
  const BreakManagementScreen = () => {
    const [onBreak, setOnBreak] = useState(false);
    const [breakTimer, setBreakTimer] = useState(null);
    
    return (
      <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => setCurrentScreen('employeeDashboard')} 
              className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-2 rounded-lg transition-all flex items-center gap-2 font-medium"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back
            </button>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Break Management</h2>
          <p className="text-gray-600 mb-6">Mandatory wellness breaks</p>

          {/* Break Time Remaining Card */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Coffee size={32} className="text-white/90" />
              <p className="text-white/90 font-medium">Break Time Remaining</p>
            </div>
            <div className="text-5xl font-bold mb-1">30</div>
            <div className="text-2xl mb-4">minutes</div>
            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
              <p className="text-sm">System will auto-lock after 6 hours without break</p>
            </div>
          </div>

          {/* Today's Breaks */}
          <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Today's Breaks</h3>
            
            <div className="space-y-3">
              {/* Morning Break - Completed */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">Morning Break</p>
                    <p className="text-sm text-gray-600">10:30 AM - 10:45 AM</p>
                  </div>
                  <CheckCircle className="text-green-500" size={24} />
                </div>
              </div>

              {/* Lunch Break - Due Now */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">Lunch Break</p>
                    <p className="text-sm text-blue-600 font-medium">Due now</p>
                  </div>
                  {!onBreak ? (
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const { data, error } = await startBreak({
                            breakType: 'lunch',
                            notes: ''
                          });

                          if (error) {
                            alert('Failed to start break: ' + error.message);
                          } else {
                            setOnBreak(true);
                          }
                        } catch (err) {
                          alert('Error: ' + err.message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                      disabled={loading}
                    >
                      {loading ? 'Starting...' : 'Start Break'}
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const { data, error } = await endBreak({
                            notes: ''
                          });

                          if (error) {
                            alert('Failed to end break: ' + error.message);
                          } else {
                            setOnBreak(false);
                          }
                        } catch (err) {
                          alert('Error: ' + err.message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
                      disabled={loading}
                    >
                      {loading ? 'Ending...' : 'End Break'}
                    </button>
                  )}
                </div>
              </div>

              {/* Afternoon Break - Scheduled */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-75">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">Afternoon Break</p>
                    <p className="text-sm text-gray-600">Scheduled: 3:30 PM - 3:45 PM</p>
                  </div>
                  <Clock className="text-gray-400" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Hydration Reminder */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Droplet className="text-blue-600 mt-1" size={24} />
              <div>
                <p className="font-semibold text-blue-800">Hydration Reminder</p>
                <p className="text-sm text-blue-700">Remember to drink water!</p>
              </div>
            </div>
          </div>

          {/* Break Statistics */}
          <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Break Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-xs text-gray-600">Today's Total</p>
                <p className="text-2xl font-bold text-purple-700">45 min</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-gray-600">Weekly Average</p>
                <p className="text-2xl font-bold text-green-700">52 min/day</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="text-xs text-gray-600">Compliance</p>
                <p className="text-2xl font-bold text-orange-700">95%</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-gray-600">Wellness Score</p>
                <p className="text-2xl font-bold text-blue-700">4.7/5</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <button 
              onClick={() => alert('Requesting urgent break...')}
              className="w-full bg-white border-2 border-orange-500 text-orange-600 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all"
            >
              Request Urgent Break
            </button>
            <button 
              onClick={() => alert('Opening break preferences...')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Break Preferences
            </button>
          </div>

          {/* Health Tips */}
          <div className="mt-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-2">💡 Health Tip</h4>
            <p className="text-sm text-gray-700">
              Regular breaks improve productivity by 15% and reduce workplace injuries by 30%. 
              Stand up, stretch, and rest your eyes every hour!
            </p>
          </div>
        </div>
      </div>
    );
  };

  // AI Chat Screen (Full screen version for both employee and manager)
  const AIChatScreen = ({ role }) => {
    const [messages, setMessages] = useState([
      { 
        type: 'ai', 
        text: role === 'manager' 
          ? "Hello! I'm your AI assistant. I can help you analyze staffing patterns, predict scheduling needs, generate reports, and optimize workforce management. How can I assist you today?"
          : "Hi! I'm your AI assistant. I can help you manage your schedule, request time off, find shift swaps, track your hours, and more. What would you like help with?"
      }
    ]);
    const [inputText, setInputText] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(true);

    const managerSuggestions = [
      "Show me today's staffing analytics",
      "Predict next week's scheduling needs",
      "Find patterns in overtime usage",
      "Generate monthly performance report",
      "Identify attendance trends",
      "Optimize shift assignments"
    ];

    const employeeSuggestions = [
      "Show my upcoming shifts",
      "Request time off next week",
      "Find someone to swap shifts with",
      "Calculate my overtime hours",
      "Check my attendance score",
      "When is my next break due?"
    ];

    const suggestions = role === 'manager' ? managerSuggestions : employeeSuggestions;

    const handleSend = () => {
      if (inputText.trim()) {
        setMessages([...messages, 
          { type: 'user', text: inputText },
          { type: 'ai', text: getAIResponse(inputText, role) }
        ]);
        setInputText('');
        setShowSuggestions(false);
      }
    };

    const getAIResponse = (query, userRole) => {
      const lowerQuery = query.toLowerCase();
      
      if (userRole === 'manager') {
        if (lowerQuery.includes('analytics') || lowerQuery.includes('staffing')) {
          return "Based on current data:\n\n📊 Staffing Level: 85% optimal\n⏱️ Average Response Time: 4.2 minutes\n👥 Current Staff: 24/32 active\n📈 Efficiency Score: 92%\n\n🔍 Key Insights:\n• Sales is understaffed by 2 employees\n• Peak hours are 10 AM - 2 PM\n• Consider adding 1 float staff for flexibility\n\nWould you like me to generate a detailed report or create an optimized schedule?";
        }
        if (lowerQuery.includes('predict') || lowerQuery.includes('next week')) {
          return "📅 Predictive Analysis for Next Week:\n\n🔮 Predicted Needs:\n• Monday: 32 staff (high workload expected)\n• Tuesday-Thursday: 28 staff (normal flow)\n• Friday: 30 staff (end-of-week surge)\n\n⚠️ Risk Areas:\n• Operations dept may need 2 additional staff\n• Night shift coverage gap on Wednesday\n\n✅ Recommendations:\n1. Schedule 3 on-call staff for Monday\n2. Arrange shift swap for Wednesday night\n3. Pre-approve 8 hours overtime budget\n\nShall I automatically create shift assignments based on these predictions?";
        }
        if (lowerQuery.includes('overtime')) {
          return "💰 Overtime Analysis:\n\n📊 Current Month:\n• Total: 186 hours ($11,160)\n• Top User: David Park (28 hours)\n• Department: Support (45%)\n\n📈 Trend: +12% from last month\n\n💡 AI Recommendations:\n1. Redistribute Support shifts\n2. Hire 1 part-time staff member\n3. Implement rotating on-call system\n\nWould you like me to create an overtime optimization plan?";
        }
        return "I'll help you with that. Let me analyze the data and provide insights. Meanwhile, you can also try asking about staffing analytics, scheduling predictions, or performance metrics.";
      } else {
        if (lowerQuery.includes('shift') || lowerQuery.includes('schedule')) {
          return "📅 Your Upcoming Shifts:\n\n• Today: 8 AM - 4 PM (Sales Floor)\n• Tomorrow: OFF\n• Friday: 8 AM - 4 PM (Sales Floor)\n• Saturday: 12 PM - 8 PM (Support Desk)\n• Sunday: OFF\n\n💡 AI Tip: You have 2 consecutive days off! Perfect for rest and recovery.\n\nWould you like to request any changes or see available swap options?";
        }
        if (lowerQuery.includes('time off') || lowerQuery.includes('request')) {
          return "📝 I can help you request time off. Based on your schedule:\n\n✅ Best dates for time off:\n• Jan 25-27 (low staffing impact)\n• Feb 3-5 (already covered)\n\n⚠️ Avoid requesting:\n• Jan 30-31 (high demand period)\n\n🔄 I found 3 colleagues who could cover your shifts.\n\nWould you like me to submit a time-off request for specific dates?";
        }
        if (lowerQuery.includes('overtime') || lowerQuery.includes('hours')) {
          return "⏰ Your Hours Summary:\n\n• This Week: 32.5 hours\n• Overtime: 4.5 hours\n• Month Total: 152 regular + 12.5 OT\n• Earnings: +$750 overtime pay\n\n📊 You're in the top 20% for attendance!\n\n💡 Tip: You're eligible for 8 more OT hours this month.\n\nWant me to find available overtime shifts for you?";
        }
        return "I'm here to help! I can assist with scheduling, time-off requests, shift swaps, hours tracking, and more. What specific information do you need?";
      }
    };

    return (
      <div className="h-full bg-gradient-to-b from-purple-50 to-white flex flex-col">
        <div className="p-6 pb-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => setCurrentScreen(role === 'manager' ? 'managerDashboard' : 'employeeDashboard')} 
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-all flex items-center gap-2 font-medium"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back
            </button>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">AI Assistant</h3>
                <p className="text-xs text-gray-600">Powered by ClockWise AI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl p-3 ${
                msg.type === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {showSuggestions && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-lg text-sm transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={role === 'manager' ? "Ask about analytics, scheduling, reports..." : "Ask about shifts, time off, hours..."}
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              onClick={handleSend}
              className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-all"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Manager Clock In/Out Screen
  const ManagerClockInOutScreen = () => {
    const [selectedAction, setSelectedAction] = useState('clockIn'); // clockIn or clockOut
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [bulkMode, setBulkMode] = useState(false);
    const [manualData, setManualData] = useState({
      employee: '',
      time: new Date().toTimeString().slice(0, 5),
      date: new Date().toISOString().split('T')[0],
      location: 'Main Campus',
      department: '',
      reason: '',
      overrideGPS: false,
      overrideFacial: false,
      notes: ''
    });

    const availableEmployees = [
      { id: 1, name: 'Tom Evina', dept: 'IT Support', status: 'not-clocked' },
      { id: 2, name: 'Amy Williams', dept: 'HR', status: 'not-clocked' },
      { id: 3, name: 'Tom Johnson', dept: 'Operations', status: 'not-clocked' },
      { id: 4, name: 'Carlos Martinez', dept: 'Support', status: 'not-clocked' },
      { id: 5, name: 'Jane Taylor', dept: 'Admin', status: 'not-clocked' }
    ];

    const clockedInEmployees = [
      { id: 6, name: 'Brine Ketum', dept: 'Sales', clockedAt: '8:00 AM' },
      { id: 7, name: 'John Doh', dept: 'Sales', clockedAt: '7:45 AM' },
      { id: 8, name: 'Sarah Zoa', dept: 'Operations', clockedAt: '6:00 AM' },
      { id: 9, name: 'David Park', dept: 'Support', clockedAt: '12:00 AM' }
    ];

    const employeeList = selectedAction === 'clockIn' ? availableEmployees : clockedInEmployees;

    return (
      <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => setCurrentScreen('managerDashboard')} 
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-all flex items-center gap-2 font-medium"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back
            </button>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Manual Clock In/Out</h2>
          <p className="text-gray-600 mb-6">Manually clock employees in or out with manager override</p>

          {/* Action Selection */}
          <div className="bg-white rounded-xl p-4 shadow-md mb-6">
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedAction('clockIn')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  selectedAction === 'clockIn' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CheckCircle size={20} />
                Clock In
              </button>
              <button 
                onClick={() => setSelectedAction('clockOut')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  selectedAction === 'clockOut' 
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <LogOut size={20} />
                Clock Out
              </button>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="flex items-center gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={bulkMode}
                onChange={(e) => setBulkMode(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Bulk Mode (select multiple employees)</span>
            </label>
          </div>

          {/* Employee Selection */}
          <div className="bg-white rounded-xl p-5 shadow-md mb-6">
            <h3 className="font-bold text-gray-800 mb-4">
              {selectedAction === 'clockIn' 
                ? `Select Employee(s) to Clock In (${availableEmployees.length} available)`
                : `Select Employee(s) to Clock Out (${clockedInEmployees.length} clocked in)`
              }
            </h3>
            
            {!bulkMode ? (
              <select 
                value={manualData.employee}
                onChange={(e) => setManualData({...manualData, employee: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="">Select an employee...</option>
                {employeeList.map(emp => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} - {emp.dept} 
                    {emp.clockedAt && ` (Clocked in at ${emp.clockedAt})`}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {employeeList.map(emp => (
                  <label key={emp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmployees([...selectedEmployees, emp.id]);
                        } else {
                          setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                        }
                      }}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{emp.name}</p>
                      <p className="text-sm text-gray-600">
                        {emp.dept} {emp.clockedAt && `• Clocked in at ${emp.clockedAt}`}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Time and Location Settings */}
          <div className="bg-white rounded-xl p-5 shadow-md mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Time & Location Details</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
                <input 
                  type="date" 
                  value={manualData.date}
                  onChange={(e) => setManualData({...manualData, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Time</label>
                <input 
                  type="time" 
                  value={manualData.time}
                  onChange={(e) => setManualData({...manualData, time: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                <select 
                  value={manualData.location}
                  onChange={(e) => setManualData({...manualData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="Main Campus">Main Campus</option>
                  <option value="North Wing">North Wing</option>
                  <option value="South Wing">South Wing</option>
                  <option value="Support Building">Support Building</option>
                  <option value="Off-site">Off-site Location</option>
                  <option value="Remote">Remote/Home</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
                <select 
                  value={manualData.department}
                  onChange={(e) => setManualData({...manualData, department: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Auto-detect</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="Admin">Admin</option>
                  <option value="IT Support">IT Support</option>
                </select>
              </div>
            </div>
          </div>

          {/* Override Settings */}
          <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200 mb-6">
            <h3 className="font-bold text-yellow-800 mb-3">Security Overrides</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={manualData.overrideGPS}
                  onChange={(e) => setManualData({...manualData, overrideGPS: e.target.checked})}
                  className="w-4 h-4 text-yellow-600"
                />
                <div>
                  <p className="font-medium text-gray-800">Override GPS Verification</p>
                  <p className="text-xs text-gray-600">Allow clock in/out without location verification</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={manualData.overrideFacial}
                  onChange={(e) => setManualData({...manualData, overrideFacial: e.target.checked})}
                  className="w-4 h-4 text-yellow-600"
                />
                <div>
                  <p className="font-medium text-gray-800">Override Facial Recognition</p>
                  <p className="text-xs text-gray-600">Skip biometric verification requirement</p>
                </div>
              </label>
            </div>
          </div>

          {/* Reason for Manual Entry */}
          <div className="bg-white rounded-xl p-5 shadow-md mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Reason for Manual Entry *</h3>
            <select 
              value={manualData.reason}
              onChange={(e) => setManualData({...manualData, reason: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none mb-3"
              required
            >
              <option value="">Select a reason...</option>
              <option value="badge-lost">Badge lost/forgotten</option>
              <option value="system-failure">System failure/Technical issue</option>
              <option value="emergency">Urgent situation</option>
              <option value="offsite">Off-site work</option>
              <option value="remote">Remote work authorized</option>
              <option value="biometric-fail">Biometric scanner failure</option>
              <option value="group-entry">Group clock in (meeting/training)</option>
              <option value="correction">Time correction</option>
              <option value="other">Other (specify in notes)</option>
            </select>
            
            <textarea 
              value={manualData.notes}
              onChange={(e) => setManualData({...manualData, notes: e.target.value})}
              placeholder="Additional notes or context..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none h-20 resize-none"
            />
          </div>

          {/* Warning Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">Important Notice</p>
                <p className="text-sm text-blue-700">
                  Manual clock entries are logged with your manager ID and timestamp. This action will be included in audit reports 
                  and may require additional verification from HR or senior management.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={() => {
                const employeeCount = bulkMode ? selectedEmployees.length : (manualData.employee ? 1 : 0);
                if (employeeCount > 0 && manualData.reason) {
                  const actionText = selectedAction === 'clockIn' ? 'clocked in' : 'clocked out';
                  alert(`Successfully ${actionText} ${employeeCount} employee(s) at ${manualData.time}. Action logged and pending approval.`);
                  setCurrentScreen('managerDashboard');
                } else {
                  alert('Please select at least one employee and provide a reason.');
                }
              }}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                selectedAction === 'clockIn'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-lg'
              }`}
            >
              {selectedAction === 'clockIn' ? 'Clock In Employee(s)' : 'Clock Out Employee(s)'}
            </button>
            <button 
              onClick={() => setCurrentScreen('managerDashboard')}
              className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Currently Clocked In Screen
  const CurrentlyClockedScreen = () => {
    const [filterDept, setFilterDept] = useState('all');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editData, setEditData] = useState({
      clockIn: '',
      clockOut: '',
      breakDuration: '',
      reason: '',
      addNote: ''
    });
    
    const clockedInEmployees = [
      {
        id: 1,
        name: 'Brine Ketum',
        dept: 'Sales',
        clockIn: '8:00 AM',
        duration: '4h 32m',
        location: 'Building A - Room 302',
        status: 'active',
        breaksTaken: '1 of 2',
        lastActivity: '2 min ago',
        gpsVerified: true
      },
      {
        id: 2,
        name: 'John Doh',
        dept: 'Sales',
        clockIn: '7:45 AM',
        duration: '4h 47m',
        location: 'Conference Room 2',
        status: 'in-meeting',
        breaksTaken: '0 of 2',
        lastActivity: 'Active now',
        gpsVerified: true
      },
      {
        id: 3,
        name: 'Sarah Zoa',
        dept: 'Operations',
        clockIn: '6:00 AM',
        duration: '6h 32m',
        location: 'Break Room',
        status: 'on-break',
        breaksTaken: '2 of 2',
        lastActivity: 'Break started 5m ago',
        gpsVerified: true
      },
      {
        id: 4,
        name: 'Mike Ondoa',
        dept: 'IT Support',
        clockIn: '9:00 AM',
        duration: '3h 32m',
        location: 'IT Department',
        status: 'active',
        breaksTaken: '1 of 2',
        lastActivity: '15 min ago',
        gpsVerified: true
      },
      {
        id: 5,
        name: 'Lisa Chen',
        dept: 'Customer Service',
        clockIn: '8:30 AM',
        duration: '4h 02m',
        location: 'Service Desk 4',
        status: 'active',
        breaksTaken: '1 of 2',
        lastActivity: 'Active now',
        gpsVerified: true
      },
      {
        id: 6,
        name: 'David Park',
        dept: 'Customer Service',
        clockIn: '12:00 AM',
        duration: '12h 32m',
        location: 'Unknown - GPS Lost',
        status: 'idle',
        breaksTaken: '3 of 2',
        lastActivity: '45 min ago',
        gpsVerified: false,
        alert: true
      }
    ];

    const filteredEmployees = filterDept === 'all' 
      ? clockedInEmployees 
      : clockedInEmployees.filter(emp => emp.dept === filterDept);

    return (
      <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => setCurrentScreen('managerDashboard')} 
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-all flex items-center gap-2 font-medium"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back
            </button>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Currently Clocked In</h2>
          <p className="text-gray-600 mb-6">{clockedInEmployees.length} employees active now</p>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
              <p className="text-3xl font-bold">{clockedInEmployees.filter(e => e.status === 'active').length}</p>
              <p className="text-sm opacity-90">Active</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-4 text-white">
              <p className="text-3xl font-bold">{clockedInEmployees.filter(e => e.status === 'on-break').length}</p>
              <p className="text-sm opacity-90">On Break</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-4 text-white">
              <p className="text-3xl font-bold">{clockedInEmployees.filter(e => e.alert).length}</p>
              <p className="text-sm opacity-90">Alerts</p>
            </div>
          </div>

          {/* Department Filter */}
          <div className="bg-white rounded-xl p-4 shadow-md mb-6">
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => setFilterDept('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterDept === 'all' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({clockedInEmployees.length})
              </button>
              {['Sales', 'Support', 'HR', 'Operations'].map(dept => (
                <button 
                  key={dept}
                  onClick={() => setFilterDept(dept)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterDept === dept 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dept} ({clockedInEmployees.filter(e => e.dept === dept).length})
                </button>
              ))}
            </div>
          </div>

          {/* Employee Cards */}
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div 
                key={employee.id} 
                className={`bg-white rounded-xl p-5 shadow-md ${
                  employee.alert ? 'border-2 border-red-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-800 text-lg">{employee.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        employee.status === 'active' ? 'bg-green-100 text-green-700' :
                        employee.status === 'on-break' ? 'bg-yellow-100 text-yellow-700' :
                        employee.status === 'in-meeting' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {employee.status === 'in-meeting' ? 'In Meeting' :
                         employee.status === 'on-break' ? 'On Break' :
                         employee.status === 'idle' ? 'Idle - Alert!' :
                         'Active'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{employee.dept}</p>
                  </div>
                  {employee.alert && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      ALERT
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Clock In Time</p>
                    <p className="font-semibold text-gray-800">{employee.clockIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-800">{employee.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className={employee.gpsVerified ? 'text-green-500' : 'text-red-500'} />
                  <p className={`text-sm ${employee.gpsVerified ? 'text-gray-700' : 'text-red-600 font-medium'}`}>
                    {employee.location}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Coffee size={14} className="text-gray-500" />
                      <span className="text-gray-600">Breaks: {employee.breaksTaken}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity size={14} className="text-gray-500" />
                      <span className="text-gray-600">{employee.lastActivity}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setEditData({
                          clockIn: employee.clockIn,
                          clockOut: '',
                          breakDuration: '30',
                          reason: '',
                          addNote: ''
                        });
                        setShowEditModal(true);
                      }}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-200 transition-all"
                    >
                      Adjust Time
                    </button>
                    <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
              Send Broadcast Message
            </button>
            <button className="w-full bg-white border-2 border-purple-500 text-purple-600 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all">
              Export Attendance Report
            </button>
            <button 
              onClick={() => alert('Opening Time Adjustment History with audit trail of all changes made today')}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              View Adjustment History
            </button>
          </div>

          {/* Recent Adjustments Audit Trail */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-gray-600" />
              Recent Time Adjustments
            </h4>
            <div className="space-y-2 text-sm">
              <div className="bg-white rounded-lg p-3 border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">Tom Johnson - Clock in adjusted</p>
                    <p className="text-xs text-gray-600">Changed from 8:15 AM to 8:00 AM</p>
                    <p className="text-xs text-gray-500 mt-1">Reason: Forgot to clock in, was in meeting</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">10 min ago</p>
                    <p className="text-xs text-purple-600">by Manager Brine</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border-l-4 border-orange-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">Amy Williams - Manual clock out</p>
                    <p className="text-xs text-gray-600">Clocked out at 4:30 PM</p>
                    <p className="text-xs text-gray-500 mt-1">Reason: System error, badge reader malfunction</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">1 hour ago</p>
                    <p className="text-xs text-purple-600">by Manager Doh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Staff Today Screen
  const StaffTodayScreen = () => {
    const [viewMode, setViewMode] = useState('all'); // all, present, absent, scheduled
    
    const todayStaff = [
      {
        id: 1,
        name: 'Brine Ketum',
        dept: 'Sales',
        shift: 'Morning (8AM-4PM)',
        status: 'clocked-in',
        clockIn: '8:00 AM',
        scheduledIn: '8:00 AM',
        attendance: 'on-time',
        breaks: '1/2 taken',
        clients: 8
      },
      {
        id: 2,
        name: 'John Doh',
        dept: 'Sales',
        shift: 'Morning (8AM-4PM)',
        status: 'clocked-in',
        clockIn: '7:45 AM',
        scheduledIn: '8:00 AM',
        attendance: 'early',
        breaks: '0/2 taken',
        clients: 12
      },
      {
        id: 3,
        name: 'Sarah Zoa',
        dept: 'Operations',
        shift: 'Full Day (6AM-6PM)',
        status: 'clocked-in',
        clockIn: '6:00 AM',
        scheduledIn: '6:00 AM',
        attendance: 'on-time',
        breaks: '2/3 taken',
        clients: 15
      },
      {
        id: 4,
        name: 'Mike Evina',
        dept: 'IT Support',
        shift: 'Morning (8AM-4PM)',
        status: 'absent',
        clockIn: '-',
        scheduledIn: '8:00 AM',
        attendance: 'absent',
        breaks: '-',
        clients: 0,
        reason: 'Sick Leave'
      },
      {
        id: 5,
        name: 'David Park',
        dept: 'Customer Service',
        shift: 'Night (12AM-8AM)',
        status: 'clocked-out',
        clockIn: '12:00 AM',
        clockOut: '8:15 AM',
        scheduledIn: '12:00 AM',
        attendance: 'completed',
        breaks: '2/2 taken',
        clients: 23
      },
      {
        id: 6,
        name: 'Lisa Chen',
        dept: 'Customer Service',
        shift: 'Evening (4PM-12AM)',
        status: 'scheduled',
        clockIn: '-',
        scheduledIn: '4:00 PM',
        attendance: 'upcoming',
        breaks: '-',
        clients: 0
      },
      {
        id: 7,
        name: 'Tom Johnson',
        dept: 'Operations',
        shift: 'Morning (8AM-4PM)',
        status: 'clocked-in',
        clockIn: '8:15 AM',
        scheduledIn: '8:00 AM',
        attendance: 'late',
        breaks: '0/2 taken',
        clients: 5
      },
      {
        id: 8,
        name: 'Amy Williams',
        dept: 'HR',
        shift: 'Evening (4PM-12AM)',
        status: 'scheduled',
        clockIn: '-',
        scheduledIn: '4:00 PM',
        attendance: 'upcoming',
        breaks: '-',
        clients: 0
      }
    ];

    const getFilteredStaff = () => {
      switch(viewMode) {
        case 'present':
          return todayStaff.filter(s => s.status === 'clocked-in');
        case 'absent':
          return todayStaff.filter(s => s.status === 'absent');
        case 'scheduled':
          return todayStaff.filter(s => s.status === 'scheduled');
        default:
          return todayStaff;
      }
    };

    const filteredStaff = getFilteredStaff();

    return (
      <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => setCurrentScreen('managerDashboard')} 
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-all flex items-center gap-2 font-medium"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back
            </button>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Staff Today</h2>
          <p className="text-gray-600 mb-6">{todayStaff.length} total staff scheduled</p>

          {/* Summary Stats */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white mb-6">
            <h3 className="font-bold text-lg mb-4">Today's Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                <p className="text-3xl font-bold">{todayStaff.filter(s => s.status === 'clocked-in').length}/{todayStaff.length}</p>
                <p className="text-sm opacity-90">Present</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                <p className="text-3xl font-bold">{todayStaff.filter(s => s.attendance === 'late').length}</p>
                <p className="text-sm opacity-90">Late Arrivals</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                <p className="text-3xl font-bold">{todayStaff.filter(s => s.status === 'absent').length}</p>
                <p className="text-sm opacity-90">Absent</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                <p className="text-3xl font-bold">{todayStaff.filter(s => s.status === 'scheduled').length}</p>
                <p className="text-sm opacity-90">Upcoming</p>
              </div>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-md">
            {[
              { id: 'all', label: 'All Staff' },
              { id: 'present', label: 'Present' },
              { id: 'absent', label: 'Absent' },
              { id: 'scheduled', label: 'Scheduled' }
            ].map(mode => (
              <button 
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  viewMode === mode.id 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Staff List */}
          <div className="space-y-3">
            {filteredStaff.map((staff) => (
              <div key={staff.id} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-gray-800">{staff.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        staff.status === 'clocked-in' ? 'bg-green-100 text-green-700' :
                        staff.status === 'absent' ? 'bg-red-100 text-red-700' :
                        staff.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {staff.status === 'clocked-in' ? 'Present' :
                         staff.status === 'absent' ? `Absent${staff.reason ? ` - ${staff.reason}` : ''}` :
                         staff.status === 'scheduled' ? 'Scheduled' :
                         'Completed'}
                      </span>
                      {staff.attendance === 'late' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                          Late
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{staff.dept} • {staff.shift}</p>
                  </div>
                  {staff.clients > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{staff.clients}</p>
                      <p className="text-xs text-gray-500">Clients</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Scheduled</p>
                    <p className="font-medium">{staff.scheduledIn}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Actual</p>
                    <p className="font-medium">{staff.clockIn}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Breaks</p>
                    <p className="font-medium">{staff.breaks}</p>
                  </div>
                </div>

                {staff.status === 'clocked-in' && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <button className="text-sm text-purple-600 font-medium hover:text-purple-700">
                      View Live Location →
                    </button>
                    <button 
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-200 transition-all"
                      onClick={() => alert(`Opening time adjustment for ${staff.name}`)}
                    >
                      Adjust Time
                    </button>
                  </div>
                )}
                {staff.status === 'clocked-out' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500">Clock Out: </span>
                        <span className="font-medium">{staff.clockOut}</span>
                      </div>
                      <button 
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-200 transition-all"
                        onClick={() => alert(`Opening time adjustment for ${staff.name}'s completed shift`)}
                      >
                        Edit Shift
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-white text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all">
                Message All Present
              </button>
              <button className="bg-white text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all">
                Call Absent Staff
              </button>
              <button className="bg-white text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all">
                Find Replacement
              </button>
              <button className="bg-white text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Shift Management Screen
  const ShiftManagementScreen = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeView, setActiveView] = useState('schedule'); // schedule, assign, requests
    
    return (
      <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => setCurrentScreen('managerDashboard')} 
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-all flex items-center gap-2 font-medium"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back
            </button>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Shift Management</h2>
          <p className="text-gray-600 mb-6">Assign and manage employee schedules</p>

          {/* View Tabs */}
          <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-md">
            <button 
              onClick={() => setActiveView('schedule')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeView === 'schedule' 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Schedule View
            </button>
            <button 
              onClick={() => setActiveView('assign')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeView === 'assign' 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Assign Shifts
            </button>
            <button 
              onClick={() => setActiveView('requests')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all relative ${
                activeView === 'requests' 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Requests
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </button>
          </div>

          {/* Schedule View */}
          {activeView === 'schedule' && (
            <>
              {/* Date Selector */}
              <div className="bg-white rounded-xl p-4 shadow-md mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800">Select Date</h3>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Department Shift Overview */}
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white mb-6">
                <h4 className="font-bold text-lg mb-3">Shift Coverage - {selectedDate}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                    <p className="text-white/80 text-sm">Morning (8AM-4PM)</p>
                    <p className="text-2xl font-bold">18/20</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                    <p className="text-white/80 text-sm">Evening (4PM-12AM)</p>
                    <p className="text-2xl font-bold">12/15</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                    <p className="text-white/80 text-sm">Night (12AM-8AM)</p>
                    <p className="text-2xl font-bold">8/10</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                    <p className="text-white/80 text-sm">On Call</p>
                    <p className="text-2xl font-bold">4/5</p>
                  </div>
                </div>
              </div>

              {/* Shift Schedule Grid */}
              <div className="bg-white rounded-2xl p-5 shadow-md">
                <h4 className="font-bold text-gray-800 mb-4">Today's Schedule</h4>
                <div className="space-y-3">
                  {[
                    { dept: 'Sales', morning: '6/8', evening: '4/6', night: '2/3' },
                    { dept: 'Support', morning: '8/8', evening: '6/6', night: '4/4' },
                    { dept: 'HR', morning: '4/4', evening: '2/3', night: '1/2' },
                    { dept: 'Operations', morning: '0/2', evening: '0/2', night: '1/1', alert: true }
                  ].map((dept, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border-2 ${dept.alert ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">{dept.dept}</span>
                        {dept.alert && <span className="text-xs text-red-600 font-bold">UNDERSTAFFED</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600">Morning</p>
                          <p className={`font-bold ${dept.morning.startsWith('0') ? 'text-red-600' : 'text-green-600'}`}>
                            {dept.morning}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Evening</p>
                          <p className={`font-bold ${dept.evening.startsWith('0') ? 'text-red-600' : 'text-green-600'}`}>
                            {dept.evening}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Night</p>
                          <p className={`font-bold ${dept.night.startsWith('0') ? 'text-red-600' : dept.night.startsWith(dept.night.split('/')[1]) ? 'text-green-600' : 'text-yellow-600'}`}>
                            {dept.night}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Assign Shifts View */}
          {activeView === 'assign' && (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
                <h4 className="font-bold text-gray-800 mb-4">Quick Assign</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Select Employee</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none">
                      <option>Brine Ketum - Sales</option>
                      <option>John Doh - Sales</option>
                      <option>Mike Ondoa - HR</option>
                      <option>Sarah Zoa - Operations</option>
                      <option>Tom Evina - IT Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Shift Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-3 border-2 border-purple-500 bg-purple-50 rounded-lg">
                        <p className="font-semibold text-purple-700">Morning</p>
                        <p className="text-xs text-gray-600">8:00 AM - 4:00 PM</p>
                      </button>
                      <button className="p-3 border-2 border-gray-200 bg-white rounded-lg hover:border-purple-300">
                        <p className="font-semibold text-gray-700">Evening</p>
                        <p className="text-xs text-gray-600">4:00 PM - 12:00 AM</p>
                      </button>
                      <button className="p-3 border-2 border-gray-200 bg-white rounded-lg hover:border-purple-300">
                        <p className="font-semibold text-gray-700">Night</p>
                        <p className="text-xs text-gray-600">12:00 AM - 8:00 AM</p>
                      </button>
                      <button className="p-3 border-2 border-gray-200 bg-white rounded-lg hover:border-purple-300">
                        <p className="font-semibold text-gray-700">Custom</p>
                        <p className="text-xs text-gray-600">Set times</p>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                      <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                      <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none" />
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                    Assign Shift
                  </button>
                </div>
              </div>

              {/* Available Employees */}
              <div className="bg-white rounded-2xl p-5 shadow-md">
                <h4 className="font-bold text-gray-800 mb-3">Available for Assignment</h4>
                <div className="space-y-2">
                  {[
                    { name: 'David Park', dept: 'Support', hours: '32/40' },
                    { name: 'Lisa Chen', dept: 'Admin', hours: '36/40' },
                    { name: 'Tom Johnson', dept: 'Operations', hours: '24/40' },
                    { name: 'Amy Williams', dept: 'HR', hours: '28/40' }
                  ].map((emp, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                      <div>
                        <p className="font-medium text-gray-800">{emp.name}</p>
                        <p className="text-xs text-gray-600">{emp.dept}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Hours this week</p>
                        <p className="font-bold text-gray-800">{emp.hours}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Shift Requests View */}
          {activeView === 'requests' && (
            <>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-orange-800">
                  <AlertCircle className="inline mr-2" size={16} />
                  3 pending shift requests require your approval
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    type: 'Shift Swap',
                    from: 'Brine Ketum',
                    to: 'John Doh',
                    detail: 'Jan 20 Morning ↔ Jan 21 Evening',
                    reason: 'Family matter',
                    status: 'pending'
                  },
                  {
                    type: 'Extra Shift',
                    from: 'Sarah Zoa',
                    to: 'N/A',
                    detail: 'Requesting Jan 22 Night shift',
                    reason: 'Available for extra coverage',
                    status: 'pending'
                  },
                  {
                    type: 'Time Change',
                    from: 'Mike Ondoa',
                    to: 'N/A',
                    detail: 'Jan 19: 8AM-4PM → 10AM-6PM',
                    reason: 'Personal appointment',
                    status: 'pending'
                  }
                ].map((request, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 shadow-md">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                          {request.type}
                        </span>
                        <p className="font-semibold text-gray-800 mt-2">{request.from}</p>
                        {request.to !== 'N/A' && (
                          <p className="text-sm text-gray-600">Swap with: {request.to}</p>
                        )}
                        <p className="text-sm text-gray-700 mt-1">{request.detail}</p>
                        <p className="text-xs text-gray-500 mt-2">Reason: {request.reason}</p>
                      </div>
                      <span className="text-xs text-orange-600 font-bold">PENDING</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-all">
                        Approve
                      </button>
                      <button className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-all">
                        Decline
                      </button>
                      <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-all">
                        Modify
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Policy Reminder */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                <h4 className="font-semibold text-blue-800 mb-2">Shift Policy Reminders</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Minimum 12 hours between shifts required</li>
                  <li>• Maximum 60 hours per week allowed</li>
                  <li>• Shift swaps must be within same department</li>
                  <li>• 24-hour notice required for non-urgent changes</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Overtime Request Screen
  const OvertimeRequestScreen = () => {
    const [requestData, setRequestData] = useState({
      date: '',
      hours: '',
      reason: '',
      department: 'Sales',
      urgency: 'normal'
    });

    return (
      <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => setCurrentScreen('employeeDashboard')} 
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-all flex items-center gap-2 font-medium"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back
            </button>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Request Overtime</h2>
          <p className="text-gray-600 mb-6">Submit additional hours request for approval</p>

          {/* Current Overtime Stats */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/80 text-sm">This Month</p>
                <p className="text-3xl font-bold">12.5 hrs</p>
                <p className="text-white/80 text-sm mt-1">Overtime worked</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">Pending</p>
                <p className="text-2xl font-bold">2 hrs</p>
                <p className="text-white/80 text-sm mt-1">Awaiting approval</p>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
            <h3 className="font-bold text-gray-800 mb-4">New Overtime Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date for Overtime</label>
                <input 
                  type="date" 
                  value={requestData.date}
                  onChange={(e) => setRequestData({...requestData, date: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Number of Hours</label>
                <select 
                  value={requestData.hours}
                  onChange={(e) => setRequestData({...requestData, hours: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select hours</option>
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="5">5 hours</option>
                  <option value="6">6 hours</option>
                  <option value="8">8 hours (Full shift)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
                <select 
                  value={requestData.department}
                  onChange={(e) => setRequestData({...requestData, department: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="Sales">Sales</option>
                  <option value="Support">Support Department</option>
                  <option value="Admin">Admin</option>
                  <option value="Operations">Operations</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setRequestData({...requestData, urgency: 'low'})}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      requestData.urgency === 'low' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <p className="text-sm font-medium">Low</p>
                    <p className="text-xs text-gray-600">Flexible</p>
                  </button>
                  <button 
                    onClick={() => setRequestData({...requestData, urgency: 'normal'})}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      requestData.urgency === 'normal' 
                        ? 'border-yellow-500 bg-yellow-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <p className="text-sm font-medium">Normal</p>
                    <p className="text-xs text-gray-600">Standard</p>
                  </button>
                  <button 
                    onClick={() => setRequestData({...requestData, urgency: 'urgent'})}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      requestData.urgency === 'urgent' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <p className="text-sm font-medium">Urgent</p>
                    <p className="text-xs text-gray-600">Critical</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Reason for Overtime</label>
                <textarea 
                  value={requestData.reason}
                  onChange={(e) => setRequestData({...requestData, reason: e.target.value})}
                  placeholder="Please provide details about why overtime is needed..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none h-24 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Previous Requests */}
          <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Recent Requests</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Jan 10, 2025</p>
                  <p className="text-xs text-gray-600">4 hours • Support coverage</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Approved</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Jan 5, 2025</p>
                  <p className="text-xs text-gray-600">2 hours • Urgent coverage</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Pending</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Dec 28, 2024</p>
                  <p className="text-xs text-gray-600">6 hours • Holiday coverage</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Approved</span>
              </div>
            </div>
          </div>

          {/* Policy Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              Overtime Policy
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Maximum 20 overtime hours per month</li>
              <li>• Overtime rate: 1.5x regular hourly rate</li>
              <li>• Requests need manager approval</li>
              <li>• Urgent overtime auto-approved up to 4 hours</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button 
            onClick={() => {
              alert('Overtime request submitted for approval!');
              setCurrentScreen('employeeDashboard');
            }}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Submit Overtime Request
          </button>
        </div>
      </div>
    );
  };

  // My Schedule Screen - shows employee's upcoming shifts
  const MyScheduleScreen = () => {
    const [schedule, setSchedule] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [scheduleError, setScheduleError] = useState('');
    const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = next week

    useEffect(() => {
      const loadSchedule = async () => {
        try {
          setScheduleLoading(true);
          setScheduleError('');

          // Calculate date range for selected week
          const today = new Date();
          const dayOfWeek = today.getDay();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - dayOfWeek + (selectedWeek * 7));
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);

          const { data, error } = await getMySchedule(
            startOfWeek.toISOString().split('T')[0],
            endOfWeek.toISOString().split('T')[0]
          );

          if (error) {
            console.error('Schedule error:', error);
            setScheduleError(error.message || 'Failed to load schedule');
          } else {
            setSchedule(data || []);
          }
        } catch (err) {
          console.error('Schedule exception:', err);
          setScheduleError('An error occurred loading schedule');
        } finally {
          setScheduleLoading(false);
        }
      };

      loadSchedule();
    }, [selectedWeek]);

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (timeString) => {
      if (!timeString) return '';
      const [hours, minutes] = timeString.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    const getShiftColor = (shiftType) => {
      const colors = {
        morning: 'from-amber-500 to-orange-500',
        day: 'from-blue-500 to-cyan-500',
        evening: 'from-purple-500 to-indigo-500',
        night: 'from-gray-700 to-gray-900',
        default: 'from-teal-500 to-emerald-500'
      };
      return colors[shiftType?.toLowerCase()] || colors.default;
    };

    return (
      <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setCurrentScreen('employeeDashboard')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">My Schedule</h2>
              <p className="text-gray-600">View your upcoming shifts</p>
            </div>
          </div>

          {/* Week selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSelectedWeek(0)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                selectedWeek === 0
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedWeek(1)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                selectedWeek === 1
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Next Week
            </button>
          </div>

          {/* Loading state */}
          {scheduleLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600">Loading schedule...</p>
            </div>
          )}

          {/* Error state */}
          {!scheduleLoading && scheduleError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <AlertCircle size={24} />
                <p className="font-semibold">Error Loading Schedule</p>
              </div>
              <p className="text-red-500 text-sm">{scheduleError}</p>
            </div>
          )}

          {/* Empty state */}
          {!scheduleLoading && !scheduleError && schedule.length === 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-md text-center">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">No Shifts Scheduled</h4>
              <p className="text-gray-600">You don't have any shifts scheduled for {selectedWeek === 0 ? 'this' : 'next'} week.</p>
            </div>
          )}

          {/* Schedule list */}
          {!scheduleLoading && !scheduleError && schedule.length > 0 && (
            <div className="space-y-3">
              {schedule.map((shift, idx) => (
                <div
                  key={shift.id || idx}
                  className={`bg-gradient-to-r ${getShiftColor(shift.shift_type)} rounded-xl p-4 text-white shadow-md`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-lg">{formatDate(shift.shift_date || shift.date)}</p>
                      <p className="text-white/80 text-sm capitalize">{shift.shift_type || 'Regular'} Shift</p>
                    </div>
                    {shift.status === 'confirmed' && (
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">Confirmed</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-white/70" />
                      <span className="text-sm">
                        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                      </span>
                    </div>
                    {shift.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-white/70" />
                        <span className="text-sm">{shift.location}</span>
                      </div>
                    )}
                  </div>
                  {shift.notes && (
                    <p className="text-white/70 text-sm mt-2 italic">{shift.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {!scheduleLoading && schedule.length > 0 && (
            <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
              <h4 className="font-semibold text-gray-800 mb-2">Week Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-teal-600">{schedule.length}</p>
                  <p className="text-sm text-gray-600">Shifts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {schedule.reduce((acc, shift) => {
                      if (shift.start_time && shift.end_time) {
                        const start = shift.start_time.split(':').map(Number);
                        const end = shift.end_time.split(':').map(Number);
                        const hours = (end[0] + end[1]/60) - (start[0] + start[1]/60);
                        return acc + (hours > 0 ? hours : 0);
                      }
                      return acc;
                    }, 0).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Total Hours</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Simple placeholder screens for additional functionality
  const PlaceholderScreen = ({ title, subtitle, backTo = 'employeeDashboard' }) => (
    <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => setCurrentScreen(backTo)} 
            className={`${backTo === 'managerDashboard' ? 'bg-purple-100 hover:bg-purple-200 text-purple-700' : 'bg-teal-100 hover:bg-teal-200 text-teal-700'} p-2 rounded-lg transition-all flex items-center gap-2 font-medium`}
          >
            <ChevronRight className="rotate-180" size={20} />
            Back
          </button>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        
        <div className="bg-white rounded-2xl p-8 shadow-md text-center">
          <Activity size={48} className={`${backTo === 'managerDashboard' ? 'text-purple-500' : 'text-teal-500'} mx-auto mb-4`} />
          <p className="text-gray-600">Feature coming soon!</p>
        </div>
      </div>
    </div>
  );

  const screens = {
    splash: <SplashScreen />,
    login: <LoginScreen />,
    permissions: <PermissionsScreen />,
    signup: <SignupScreen />,
    managerLogin: <ManagerLoginScreen />,
    employeeDashboard: <EmployeeDashboard />,
    clockIn: <ClockInScreen />,
    clockInSuccess: <ClockInSuccessScreen />,
    clockOut: <ClockOutScreen />,
    clockOutSuccess: <ClockOutSuccessScreen />,
    managerDashboard: <ManagerDashboardScreen />,
    overtimeRequest: <OvertimeRequestScreen />,
    shiftManagement: <ShiftManagementScreen />,
    managerClockInOut: <ManagerClockInOutScreen />,
    currentlyClocked: <CurrentlyClockedScreen />,
    staffToday: <StaffTodayScreen />,
    aiAnalytics: <AIAnalyticsScreen />,
    employeeAIChat: <AIChatScreen role="employee" />,
    managerAIChat: <AIChatScreen role="manager" />,
    takeBreak: <BreakManagementScreen />,
    notifications: <NotificationsScreen />,
    // Employee placeholder screens
    mySchedule: <MyScheduleScreen />,
    myClients: <PlaceholderScreen title="My Clients" subtitle="View assigned clients" />,
    equipmentCheck: <PlaceholderScreen title="Resources" subtitle="Manage equipment & supplies" />,
    settings: <PlaceholderScreen title="Settings" subtitle="App preferences" />,
    // Manager placeholder screen
    departmentDetail: <PlaceholderScreen title="Department Details" subtitle="Department information" backTo="managerDashboard" />
  };

  return (
    <div className={`min-h-screen ${isMobileView ? 'bg-gray-50' : 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-2 sm:p-4 md:p-6 lg:p-8'} flex items-center justify-center`}>
        <style>
          {`
            @keyframes clockRotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes slowClockRotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .clock-spin {
              animation: clockRotate 2s linear infinite;
            }
            .clock-spin-slow {
              animation: slowClockRotate 4s linear infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            .clock-pulse {
              animation: pulse 2s ease-in-out infinite;
            }
          `}
        </style>
        <div className={`${isMobileView ? 'w-full h-screen' : 'text-center'}`}>
          {!isMobileView && <h2 className="text-white text-xl mb-4 font-light hidden lg:block">iPhone 16 Pro Max</h2>}
          <div style={iphoneStyle} className={isMobileView ? 'w-full h-full' : ''}>
            <div style={screenStyle}>
              <div style={dynamicIslandStyle}>
                <div style={cameraStyle}></div>
              </div>
              {/* Auth-guarded screen rendering */}
              {loading ? (
                <LoadingScreen />
              ) : user && userProfile?.status === 'pending' && protectedScreens.includes(currentScreen) ? (
                <PendingApprovalScreen />
              ) : user && (userProfile?.status === 'suspended' || userProfile?.status === 'terminated') ? (
                <AccountSuspendedScreen />
              ) : (
                screens[currentScreen]
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default ClockWiseProPrototype;