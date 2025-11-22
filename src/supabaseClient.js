import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Loaded from environment variables
// Make sure you have a .env file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file contains:\n' +
    '- REACT_APP_SUPABASE_URL\n' +
    '- REACT_APP_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// INPUT VALIDATION HELPERS
// ============================================================================

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6; // Supabase minimum
};

const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
};

// ============================================================================
// AUTH HELPER FUNCTIONS
// ============================================================================

export const signUp = async (email, password) => {
  // Validate inputs
  const cleanEmail = sanitizeString(email);
  if (!validateEmail(cleanEmail)) {
    return { data: null, error: { message: 'Please enter a valid email address' } };
  }
  if (!validatePassword(password)) {
    return { data: null, error: { message: 'Password must be at least 6 characters' } };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });
    return { data, error };
  } catch (err) {
    console.error('SignUp error:', err);
    return { data: null, error: { message: 'An unexpected error occurred. Please try again.' } };
  }
};

export const signIn = async (email, password) => {
  // Validate inputs
  const cleanEmail = sanitizeString(email);
  if (!validateEmail(cleanEmail)) {
    return { data: null, error: { message: 'Please enter a valid email address' } };
  }
  if (!password || password.length === 0) {
    return { data: null, error: { message: 'Please enter your password' } };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    return { data, error };
  } catch (err) {
    console.error('SignIn error:', err);
    return { data: null, error: { message: 'An unexpected error occurred. Please try again.' } };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// ============================================================================
// ORGANIZATION REGISTRATION
// ============================================================================

export const registerOrganization = async ({
  organizationName,
  organizationSlug,
  organizationCategory,
  organizationAddress,
  organizationCity,
  organizationState,
  organizationPostalCode,
  organizationCountry,
  organizationTimezone,
  adminEmail,
  adminPassword,
  adminFirstName,
  adminLastName,
  adminPhone
}) => {
  try {
    // Input validation
    const cleanOrgName = sanitizeString(organizationName);
    const cleanAdminEmail = sanitizeString(adminEmail);
    const cleanFirstName = sanitizeString(adminFirstName);
    const cleanLastName = sanitizeString(adminLastName);

    if (!cleanOrgName || cleanOrgName.length < 2) {
      return { success: false, error: 'Organization name must be at least 2 characters' };
    }
    if (!validateEmail(cleanAdminEmail)) {
      return { success: false, error: 'Please enter a valid admin email address' };
    }
    if (!validatePassword(adminPassword)) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    if (!cleanFirstName || !cleanLastName) {
      return { success: false, error: 'Admin first and last name are required' };
    }

    // Step 1: Sign up the admin user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          first_name: adminFirstName,
          last_name: adminLastName,
          phone: adminPhone,
          role: 'admin'
        }
      }
    });

    if (authError) {
      // Handle specific auth errors
      if (authError.message.includes('already registered')) {
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    const userId = authData.user.id;

    // Step 2: Call RPC function to create organization and user profile
    // Parameters must match the new function signature order
    const { data, error } = await supabase.rpc('register_organization', {
      // Required parameters
      org_name: organizationName,
      org_slug: organizationSlug,
      org_category: organizationCategory,
      admin_user_id: userId,
      admin_email: adminEmail,
      admin_first_name: adminFirstName,
      admin_last_name: adminLastName,
      // Optional parameters with defaults
      org_address_line1: organizationAddress || null,
      org_city: organizationCity || null,
      org_state: organizationState || null,
      org_postal_code: organizationPostalCode || null,
      org_country: organizationCountry || 'USA',
      org_timezone: organizationTimezone || 'America/New_York',
      admin_phone: adminPhone || null
    });

    if (error) {
      // If org creation fails, we should clean up the auth user
      console.error('Organization creation failed:', error);
      throw new Error(`Failed to create organization: ${error.message}`);
    }

    // Step 3: Sign out the user (they need approval first)
    await supabase.auth.signOut();

    return {
      success: true,
      data,
      userId,
      requiresApproval: true,
      message: data.message || 'Organization registration submitted successfully! Your organization is currently under review. You will receive a notification once approved.'
    };
  } catch (error) {
    console.error('Organization registration error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during registration'
    };
  }
};

// ============================================================================
// EMPLOYEE REGISTRATION
// ============================================================================

export const registerEmployee = async ({
  organizationId,
  email,
  phone,
  firstName,
  lastName,
  displayName,
  jobTitle,
  departmentId,
  branchId,
  employeeNumber,
  dateOfBirth,
  gender,
  // Address fields
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  country,
  timezone,
  // Emergency contact fields
  emergencyContactName,
  emergencyContactPhone,
  emergencyContactRelationship,
  password,
  role = 'employee' // Can be 'employee' or 'manager'
}) => {
  try {
    // Validation
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!email || !password || !firstName || !lastName) {
      throw new Error('Email, password, first name, and last name are required');
    }

    // Step 1: Sign up the employee/manager with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || '',
          role: role
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    const userId = authData.user.id;

    // Step 2: Call RPC function to create employee/manager profile
    // Parameters must match the new function signature order
    const { data, error } = await supabase.rpc('register_employee', {
      // Required parameters
      org_id: organizationId,
      user_id_param: userId,
      emp_email: email,
      emp_first_name: firstName,
      emp_last_name: lastName,
      // Optional parameters with defaults
      emp_phone: phone || null,
      emp_display_name: displayName || null,
      emp_job_title: jobTitle || null,
      emp_role: role,
      department_id_param: departmentId || null,
      branch_id_param: branchId || null,
      emp_number: employeeNumber || null,
      date_of_birth_param: dateOfBirth || null,
      gender_param: gender || null,
      // Address fields
      address_line1_param: addressLine1 || null,
      address_line2_param: addressLine2 || null,
      city_param: city || null,
      state_param: state || null,
      postal_code_param: postalCode || null,
      country_param: country || null,
      timezone_param: timezone || null,
      // Emergency contact fields
      emergency_contact_name_param: emergencyContactName || null,
      emergency_contact_phone_param: emergencyContactPhone || null,
      emergency_contact_relationship_param: emergencyContactRelationship || null
    });

    if (error) {
      console.error('Employee/Manager registration failed:', error);
      throw new Error(`Failed to create ${role} profile: ${error.message}`);
    }

    // Step 3: Sign out immediately (they need manager approval first)
    await supabase.auth.signOut();

    return {
      success: true,
      data,
      userId,
      message: `Registration submitted successfully! Your account is pending approval from your ${role === 'manager' ? 'administrator' : 'manager'}. You will receive an email once approved.`,
      requiresApproval: true
    };
  } catch (error) {
    console.error('Employee/Manager registration error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during registration'
    };
  }
};

// ============================================================================
// USER PROFILE OPERATIONS
// ============================================================================

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      organization:organizations(*),
      departments:user_departments(
        department:departments(*)
      )
    `)
    .eq('id', userId)
    .single();

  return { data, error };
};

export const getCurrentUserProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: 'Not authenticated' };
  return getUserProfile(user.id);
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

// ============================================================================
// CLOCK IN/OUT OPERATIONS
// ============================================================================

export const clockIn = async ({
  latitude,
  longitude,
  photoUrl,
  notes,
  deviceInfo,
  shiftId,
  branchId
}) => {
  const { data, error } = await supabase.rpc('submit_clock_in', {
    latitude,
    longitude,
    photo_url: photoUrl,
    notes,
    device_info: deviceInfo,
    shift_id_param: shiftId,
    branch_id_param: branchId
  });

  return { data, error };
};

export const clockOut = async ({
  latitude,
  longitude,
  photoUrl,
  notes,
  deviceInfo
}) => {
  const { data, error } = await supabase.rpc('submit_clock_out', {
    latitude,
    longitude,
    photo_url: photoUrl,
    notes,
    device_info: deviceInfo
  });

  return { data, error };
};

export const startBreak = async ({
  breakType = 'short',
  latitude,
  longitude,
  notes
}) => {
  const { data, error } = await supabase.rpc('submit_break_start', {
    break_type_param: breakType,
    latitude,
    longitude,
    notes
  });

  return { data, error };
};

export const endBreak = async ({
  latitude,
  longitude,
  notes
}) => {
  const { data, error } = await supabase.rpc('submit_break_end', {
    latitude,
    longitude,
    notes
  });

  return { data, error };
};

// ============================================================================
// SCHEDULE OPERATIONS
// ============================================================================

export const getMySchedule = async (startDate, endDate) => {
  const { data, error } = await supabase.rpc('get_my_schedule', {
    start_date_param: startDate,
    end_date_param: endDate
  });

  return { data, error };
};

export const getMyTimesheet = async (weekStartDate) => {
  const { data, error } = await supabase.rpc('get_my_timesheet', {
    week_start_param: weekStartDate
  });

  return { data, error };
};

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

export const getMyNotifications = async (limit = 50) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
};

export const markNotificationAsRead = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single();

  return { data, error };
};

export const markAllNotificationsAsRead = async () => {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return { data, error };
};

// ============================================================================
// ORGANIZATION OPERATIONS (Admin/Manager)
// ============================================================================

export const getOrganizationDashboardStats = async () => {
  const { data, error } = await supabase.rpc('get_org_dashboard_stats');
  return { data, error };
};

export const searchEmployees = async ({
  searchQuery,
  departmentId,
  status,
  limit = 50,
  offset = 0
}) => {
  const { data, error } = await supabase.rpc('search_employees', {
    search_query: searchQuery,
    department_id_param: departmentId,
    status_param: status,
    limit_param: limit,
    offset_param: offset
  });

  return { data, error };
};

export const approveEmployee = async (userId, employeeNumber, hireDate) => {
  const { data, error } = await supabase.rpc('approve_employee', {
    emp_user_id: userId,
    emp_number: employeeNumber,
    hire_date_val: hireDate
  });

  return { data, error };
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const subscribeToNotifications = (userId, callback) => {
  return supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
};

export const subscribeToMessages = (chatRoomId, callback) => {
  return supabase
    .channel(`messages:${chatRoomId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_room_id=eq.${chatRoomId}`
    }, callback)
    .subscribe();
};

// ============================================================================
// STORAGE OPERATIONS
// ============================================================================

export const uploadAvatar = async (userId, file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) return { data: null, error };

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return { data: publicUrl, error: null };
};

export const uploadClockPhoto = async (userId, file) => {
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${timestamp}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('clock-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) return { data: null, error };

  // Get signed URL (private bucket)
  const { data: urlData, error: urlError } = await supabase.storage
    .from('clock-photos')
    .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

  if (urlError) return { data: null, error: urlError };

  return { data: urlData.signedUrl, error: null };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timestamp: new Date().toISOString()
  };
};

// ============================================================================
// AI ASSISTANT FUNCTIONS
// ============================================================================

/**
 * Create a new AI conversation
 * @param {string} agentType - Type of AI agent (general_assistant, hr_assistant, scheduling_assistant, wellness_coach)
 * @param {string} title - Optional conversation title
 * @param {object} context - Optional context data
 * @returns {Promise<{conversationId: string, error: any}>}
 */
export const createAIConversation = async (
  agentType = 'general_assistant',
  title = null,
  context = {}
) => {
  try {
    const { data, error } = await supabase.rpc('create_ai_conversation', {
      p_title: title,
      p_agent_type: agentType,
      p_context: context
    });

    if (error) throw error;
    return { conversationId: data, error: null };
  } catch (error) {
    return { conversationId: null, error: error.message };
  }
};

/**
 * Send a message in an AI conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} role - Message role (user, assistant, system)
 * @param {string} content - Message content
 * @param {string} model - AI model used (optional)
 * @param {number} tokensUsed - Tokens consumed (optional)
 * @param {number} responseTimeMs - Response time in ms (optional)
 * @param {object} metadata - Additional metadata (optional)
 * @returns {Promise<{messageId: string, error: any}>}
 */
export const sendAIMessage = async (
  conversationId,
  role,
  content,
  model = null,
  tokensUsed = null,
  responseTimeMs = null,
  metadata = {}
) => {
  try {
    const { data, error } = await supabase.rpc('send_ai_message', {
      p_conversation_id: conversationId,
      p_role: role,
      p_content: content,
      p_model: model,
      p_tokens_used: tokensUsed,
      p_response_time_ms: responseTimeMs,
      p_metadata: metadata
    });

    if (error) throw error;
    return { messageId: data, error: null };
  } catch (error) {
    return { messageId: null, error: error.message };
  }
};

/**
 * Get conversation history
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Maximum number of messages to retrieve
 * @returns {Promise<{messages: Array, error: any}>}
 */
export const getAIConversationHistory = async (conversationId, limit = 50) => {
  try {
    const { data, error } = await supabase.rpc('get_ai_conversation_history', {
      p_conversation_id: conversationId,
      p_limit: limit
    });

    if (error) throw error;
    return { messages: data, error: null };
  } catch (error) {
    return { messages: [], error: error.message };
  }
};

/**
 * Get user's AI conversations
 * @param {string} status - Filter by status (active, closed, archived)
 * @param {number} limit - Maximum number of conversations
 * @returns {Promise<{conversations: Array, error: any}>}
 */
export const getUserAIConversations = async (status = 'active', limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('status', status)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { conversations: data, error: null };
  } catch (error) {
    return { conversations: [], error: error.message };
  }
};

/**
 * Close an AI conversation
 * @param {string} conversationId - Conversation ID to close
 * @returns {Promise<{success: boolean, error: any}>}
 */
export const closeAIConversation = async (conversationId) => {
  try {
    const { error } = await supabase
      .from('ai_conversations')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Submit feedback for an AI message
 * @param {string} messageId - Message ID
 * @param {string} feedbackType - Type of feedback (helpful, not_helpful, inaccurate, inappropriate)
 * @param {string} comment - Optional feedback comment
 * @returns {Promise<{success: boolean, error: any}>}
 */
export const submitAIFeedback = async (messageId, feedbackType, comment = null) => {
  try {
    const { error } = await supabase
      .from('ai_messages')
      .update({
        feedback_type: feedbackType,
        feedback_comment: comment,
        feedback_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get AI usage statistics
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<{stats: Array, error: any}>}
 */
export const getAIUsageStats = async (startDate = null, endDate = null) => {
  try {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase.rpc('get_ai_usage_stats', {
      p_start_date: start,
      p_end_date: end
    });

    if (error) throw error;
    return { stats: data, error: null };
  } catch (error) {
    return { stats: [], error: error.message };
  }
};

/**
 * Get available AI agents
 * @returns {Promise<{agents: Array, error: any}>}
 */
export const getAIAgents = async () => {
  try {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return { agents: data, error: null };
  } catch (error) {
    return { agents: [], error: error.message };
  }
};

/**
 * Get AI suggested actions for the current user
 * @param {string} status - Filter by status (pending, accepted, declined)
 * @returns {Promise<{actions: Array, error: any}>}
 */
export const getAISuggestedActions = async (status = 'pending') => {
  try {
    const { data, error } = await supabase
      .from('ai_suggested_actions')
      .select('*')
      .eq('status', status)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { actions: data, error: null };
  } catch (error) {
    return { actions: [], error: error.message };
  }
};

/**
 * Respond to an AI suggested action
 * @param {string} actionId - Action ID
 * @param {string} response - User response (accepted, declined)
 * @param {string} comment - Optional comment
 * @returns {Promise<{success: boolean, error: any}>}
 */
export const respondToAIAction = async (actionId, response, comment = null) => {
  try {
    const { error } = await supabase
      .from('ai_suggested_actions')
      .update({
        status: response,
        user_response: comment,
        responded_at: new Date().toISOString()
      })
      .eq('id', actionId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Search AI knowledge base
 * @param {string} query - Search query
 * @param {string} category - Filter by category (optional)
 * @returns {Promise<{results: Array, error: any}>}
 */
export const searchAIKnowledge = async (query, category = null) => {
  try {
    let queryBuilder = supabase
      .from('ai_knowledge_base')
      .select('*')
      .eq('is_active', true)
      .textSearch('content', query);

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data, error} = await queryBuilder.limit(10);

    if (error) throw error;
    return { results: data, error: null };
  } catch (error) {
    return { results: [], error: error.message };
  }
};

// ============================================================================
// DROPDOWN DATA FETCHING (For Registration Forms)
// ============================================================================

/**
 * Get all organization categories (from enum)
 * @returns {Array} Organization categories
 */
export const getOrganizationCategories = () => {
  return [
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
};

/**
 * Get all countries
 * @returns {Array} Countries list
 */
export const getCountries = () => {
  return [
    { value: 'USA', label: 'United States' },
    { value: 'CAN', label: 'Canada' },
    { value: 'GBR', label: 'United Kingdom' },
    { value: 'AUS', label: 'Australia' },
    { value: 'NZL', label: 'New Zealand' },
    { value: 'IND', label: 'India' },
    { value: 'CHN', label: 'China' },
    { value: 'JPN', label: 'Japan' },
    { value: 'DEU', label: 'Germany' },
    { value: 'FRA', label: 'France' },
    { value: 'ITA', label: 'Italy' },
    { value: 'ESP', label: 'Spain' },
    { value: 'BRA', label: 'Brazil' },
    { value: 'MEX', label: 'Mexico' },
    { value: 'ZAF', label: 'South Africa' },
    { value: 'NGA', label: 'Nigeria' },
    { value: 'CMR', label: 'Cameroon' },
    { value: 'KEN', label: 'Kenya' },
    { value: 'SGP', label: 'Singapore' },
    { value: 'ARE', label: 'United Arab Emirates' },
    { value: 'SAU', label: 'Saudi Arabia' }
  ];
};

/**
 * Get all timezones
 * @returns {Array} Timezones list
 */
export const getTimezones = () => {
  return [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Africa/Douala', label: 'West Africa Time (WAT)' },
    { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' }
  ];
};

/**
 * Get departments for an organization
 * @param {string} organizationId - Organization UUID
 * @returns {Promise<{departments: Array, error: any}>}
 */
export const getDepartments = async (organizationId) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, code, description')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return { departments: data || [], error: null };
  } catch (error) {
    return { departments: [], error: error.message };
  }
};

/**
 * Get branches for an organization
 * @param {string} organizationId - Organization UUID
 * @returns {Promise<{branches: Array, error: any}>}
 */
export const getBranches = async (organizationId) => {
  try {
    const { data, error } = await supabase
      .from('branches')
      .select('id, name, code, city, state, country')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return { branches: data || [], error: null };
  } catch (error) {
    return { branches: [], error: error.message };
  }
};

/**
 * Search organizations by name or slug (for employee/manager registration)
 * @param {string} searchQuery - Organization name or slug
 * @returns {Promise<{organizations: Array, error: any}>}
 */
export const searchOrganizations = async (searchQuery) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, slug, category')
      .or(`name.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`)
      .eq('is_active', true)
      .limit(10);

    if (error) throw error;
    return { organizations: data || [], error: null };
  } catch (error) {
    return { organizations: [], error: error.message };
  }
};

// ============================================================================
// FACE RECOGNITION FUNCTIONS
// ============================================================================

// Helper function to convert data URI to Blob
const dataURItoBlob = (dataURI) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

/**
 * Enroll a user's face for biometric authentication
 * @param {string} userId - User UUID
 * @param {Array<number>} descriptor - 128D face descriptor array
 * @param {string} faceImage - Base64 encoded face image
 * @param {number} confidence - Face detection confidence (0-1)
 * @param {Object} deviceInfo - Device information
 * @param {Object} location - GPS coordinates
 * @returns {Promise<{success: boolean, descriptorId: string, error: any}>}
 */
export const enrollFace = async (userId, descriptor, faceImage, confidence, deviceInfo = null, location = null) => {
  try {
    // Upload face image to Supabase Storage
    const fileName = 'face-' + userId + '-' + Date.now() + '.jpg';
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('face-images')
      .upload(fileName, dataURItoBlob(faceImage), {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('face-images')
      .getPublicUrl(fileName);

    // Call RPC function to enroll face
    const { data, error } = await supabase.rpc('enroll_face', {
      p_user_id: userId,
      p_descriptor: descriptor,
      p_face_image_url: publicUrl,
      p_face_confidence: confidence,
      p_device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
      p_location: location ? JSON.stringify(location) : null
    });

    if (error) throw error;

    return {
      success: data.success,
      descriptorId: data.descriptor_id,
      action: data.action,
      message: data.message,
      error: null
    };
  } catch (error) {
    console.error('Face enrollment error:', error);
    return {
      success: false,
      descriptorId: null,
      error: error.message
    };
  }
};

/**
 * Verify a user's face during clock-in/out
 * @param {string} userId - User UUID
 * @param {Array<number>} capturedDescriptor - 128D face descriptor from verification
 * @param {number} similarityScore - Similarity score (0-1)
 * @param {string} verificationType - Type of verification (clock_in, clock_out)
 * @param {string} capturedImage - Base64 encoded captured image
 * @param {Object} deviceInfo - Device information
 * @param {Object} gpsLocation - GPS coordinates
 * @param {string} clockEntryId - Clock entry ID (if applicable)
 * @returns {Promise<{success: boolean, passed: boolean, verificationId: string, error: any}>}
 */
export const verifyFace = async (
  userId,
  capturedDescriptor,
  similarityScore,
  verificationType = 'clock_in',
  capturedImage = null,
  deviceInfo = null,
  gpsLocation = null,
  clockEntryId = null
) => {
  try {
    let capturedImageUrl = null;

    // Upload captured image if provided
    if (capturedImage) {
      const fileName = 'verification-' + userId + '-' + Date.now() + '.jpg';
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('face-verifications')
        .upload(fileName, dataURItoBlob(capturedImage), {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('face-verifications')
          .getPublicUrl(fileName);
        capturedImageUrl = publicUrl;
      }
    }

    // Convert GPS location to PostGIS point format if provided
    let gpsPoint = null;
    if (gpsLocation && gpsLocation.latitude && gpsLocation.longitude) {
      gpsPoint = '(' + gpsLocation.longitude + ',' + gpsLocation.latitude + ')';
    }

    // Call RPC function to verify face
    const { data, error } = await supabase.rpc('verify_face', {
      p_user_id: userId,
      p_captured_descriptor: capturedDescriptor,
      p_similarity_score: similarityScore,
      p_verification_type: verificationType,
      p_captured_image_url: capturedImageUrl,
      p_device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
      p_gps_location: gpsPoint,
      p_clock_entry_id: clockEntryId
    });

    if (error) throw error;

    return {
      success: data.success,
      passed: data.passed,
      verificationId: data.verification_id,
      similarity: data.similarity_score,
      threshold: data.threshold,
      message: data.message,
      error: null
    };
  } catch (error) {
    console.error('Face verification error:', error);
    return {
      success: false,
      passed: false,
      verificationId: null,
      error: error.message
    };
  }
};

/**
 * Get user's enrolled face descriptor
 * @param {string} userId - User UUID
 * @returns {Promise<{descriptor: Array<number>, faceImageUrl: string, error: any}>}
 */
export const getFaceDescriptor = async (userId) => {
  try {
    const { data, error } = await supabase.rpc('get_face_descriptor', {
      p_user_id: userId
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error);
    }

    return {
      descriptorId: data.descriptor_id,
      descriptor: data.descriptor,
      faceImageUrl: data.face_image_url,
      confidence: data.face_confidence,
      enrolledAt: data.enrolled_at,
      error: null
    };
  } catch (error) {
    console.error('Get face descriptor error:', error);
    return {
      descriptor: null,
      faceImageUrl: null,
      error: error.message
    };
  }
};

/**
 * Check if user has enrolled face
 * @param {string} userId - User UUID
 * @returns {Promise<{hasEnrolledFace: boolean, error: any}>}
 */
export const hasEnrolledFace = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('face_descriptors')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    return {
      hasEnrolledFace: !!data,
      error: null
    };
  } catch (error) {
    console.error('Check enrolled face error:', error);
    return {
      hasEnrolledFace: false,
      error: error.message
    };
  }
};
