

const API_BASE_URL = 'http://localhost:5002/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Get current user
  getCurrentUser: async () => {
    return await apiRequest('/users/me');
  },
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: async (userId) => {
    return await apiRequest(`/users/${userId}`);
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    return await apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Update user preferences
  updatePreferences: async (userId, preferences) => {
    return await apiRequest(`/users/preferences`, {
      method: 'PUT',
      body: JSON.stringify({ userId, preferences }),
    });
  },
};

// Jobs API
export const jobsAPI = {
  // Get all jobs
  getJobs: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiRequest(`/jobs${queryParams ? `?${queryParams}` : ''}`);
  },

  // Post new job
  postJob: async (jobData) => {
    return await apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  // Apply to job
  applyToJob: async (jobId, applicationData) => {
    return await apiRequest(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },
};

// Employer API
export const employerAPI = {
  // Get job applications sorted by XP
  getJobApplications: async (jobId, employerId) => {
    return await apiRequest(`/jobs/${jobId}/applications?employerId=${employerId}`);
  },

  // Update application status
  updateApplicationStatus: async (jobId, applicantId, status, employerId) => {
    return await apiRequest(`/jobs/${jobId}/applications/${applicantId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, employerId }),
    });
  },

  // Get employer's jobs with application counts
  getEmployerJobs: async (employerId) => {
    return await apiRequest(`/employers/${employerId}/jobs`);
  },
};
