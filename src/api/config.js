// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  TOKEN: `${API_BASE_URL}/api/token/`,
  TOKEN_REFRESH: `${API_BASE_URL}/api/token/refresh/`,
  FOUNDERS: `${API_BASE_URL}/api/founders/`,
  IDEAS: `${API_BASE_URL}/api/ideas/`,
  MATCHING: `${API_BASE_URL}/api/matching/`,
  ROOMS: `${API_BASE_URL}/api/rooms/`,
  PROGRESS: `${API_BASE_URL}/api/progress/`,
};

export const WS_BASE_URL = API_BASE_URL
  .replace('https://', 'wss://')
  .replace('http://', 'ws://');

// API helper with authentication
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });
    
    // Handle token expiration
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        const refreshResponse = await fetch(API_ENDPOINTS.TOKEN_REFRESH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('access_token', data.access);
          
          // Retry original request
          headers['Authorization'] = `Bearer ${data.access}`;
          return fetch(endpoint, { ...options, headers });
        }
      }
      
      // Refresh failed, redirect to login
      localStorage.clear();
      window.location.href = '/login';
      return response;
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Helper functions for common API calls
export const API = {
  async login(email, password) {
    const response = await fetch(API_ENDPOINTS.TOKEN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      return data;
    }
    throw new Error('Login failed');
  },
  
  async createProfile(profileData) {
    const response = await apiRequest(API_ENDPOINTS.FOUNDERS, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
    return response.json();
  },
  
  async getFounders(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await apiRequest(`${API_ENDPOINTS.FOUNDERS}?${params}`);
    return response.json();
  },
  
  async createIdea(ideaData) {
    const response = await apiRequest(API_ENDPOINTS.IDEAS, {
      method: 'POST',
      body: JSON.stringify(ideaData),
    });
    return response.json();
  },
  
  async getIdeas() {
    const response = await apiRequest(API_ENDPOINTS.IDEAS);
    return response.json();
  },
  
  async matchRandomFounder() {
    const response = await apiRequest(`${API_ENDPOINTS.MATCHING}roulette/`, {
      method: 'POST',
    });
    return response.json();
  },
  
  async getRooms() {
    const response = await apiRequest(API_ENDPOINTS.ROOMS);
    return response.json();
  },
};
