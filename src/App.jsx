import React, { useState, useEffect } from 'react';
import { Camera, Users, MessageSquare, Target, TrendingUp, Video, X, Check, RefreshCw, Send, Heart, Rocket, LogOut, User } from 'lucide-react';

// API Configuration - Using socyfie.pythonanywhere.com
const API_BASE_URL = 'https://socyfie.pythonanywhere.com';

const API = {
  async login(email, password) {
    console.log('🔐 Login attempt:', { email, url: `${API_BASE_URL}/api/token/` });
    try {
      const response = await fetch(`${API_BASE_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('📡 Login response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login successful');
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        return data;
      }
      
      const error = await response.json();
      console.error('❌ Login failed:', error);
      throw new Error(error.detail || 'Login failed');
    } catch (err) {
      console.error('❌ Login error:', err.message);
      throw err;
    }
  },

  async signup(email, username, password) {
    console.log('📝 Signup attempt:', { email, username, url: `${API_BASE_URL}/api/auth/register/` });
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      
      console.log('📡 Signup response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Signup failed:', error);
        throw new Error(error.error || 'Signup failed');
      }
      
      const data = await response.json();
      console.log('✅ Signup successful:', data);
      return data;
    } catch (err) {
      console.error('❌ Signup error:', err.message);
      throw err;
    }
  },

  async createProfile(data) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/founders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Profile creation failed');
    return response.json();
  },

  async getCurrentProfile() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    const response = await fetch(`${API_BASE_URL}/api/founders/me/`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem('access_token', data.access);
            // Retry with new token
            const retryResponse = await fetch(`${API_BASE_URL}/api/founders/me/`, {
              headers: { 
                'Authorization': `Bearer ${data.access}`,
                'Content-Type': 'application/json'
              }
            });
            if (retryResponse.ok) return retryResponse.json();
          }
        } catch (err) {
          console.error('Token refresh failed:', err);
        }
      }
      // If refresh failed, clear tokens
      localStorage.clear();
      window.location.reload();
      return null;
    }
    if (!response.ok) return null;
    return response.json();
  },

  async getFounders(filters = {}) {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/founders/?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  },

  async createIdea(data) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/ideas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create idea');
    return response.json();
  },

  async getIdeas() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/ideas/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  },

  async matchRandomFounder() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/matching/roulette/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('No matches available');
    return response.json();
  },

  async upvoteIdea(ideaId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/upvote/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to upvote');
    return response.json();
  },

  async commentOnIdea(ideaId, content) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/comment/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to comment');
    return response.json();
  },

  async collaborateOnIdea(ideaId, message) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/collaborate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to request collaboration');
    return response.json();
  },

  async getIdeaComments(ideaId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/ideas/${ideaId}/comments/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  },

  async sendRoomMessage(roomId, content) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/send_message/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  async getRoomMessages(roomId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/messages/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  },

  async getFounderProfile(founderId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/founders/${founderId}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to load profile');
    return response.json();
  },

  async sendConnectionRequest(toFounderId, message = '') {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/connections/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        to_founder: toFounderId,
        message: message 
      }),
    });
    if (!response.ok) throw new Error('Failed to send connection request');
    return response.json();
  },

  async sendDirectMessage(toFounderId, content) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/messages/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        to_founder: toFounderId,
        content: content 
      }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  async getMyMessages() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/messages/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  },

  async getConversation(founderId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/messages/conversation/${founderId}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  },

  async joinRoom(roomId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}/join/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to join room');
    return response.json();
  },

  async getMyConnections() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/connections/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  },

  async acceptConnection(connectionId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/connections/${connectionId}/accept/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to accept connection');
    return response.json();
  },

  async uploadProfileImage(imageFile) {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('profile_image', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/api/founders/upload_image/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },

  async searchFounders(query) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/founders/search/?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  },

  async updateProfile(profileData) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/founders/update_profile/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  async getRooms() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/rooms/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    return response.json();
  }
};

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [messagingWith, setMessagingWith] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
    loadConnections();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const profile = await API.getCurrentProfile();
        if (profile) {
          setCurrentUser(profile);
          setIsAuthenticated(true);
          setCurrentView('home');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.clear();
      }
    }
    setLoading(false);
  };

  const loadConnections = async () => {
    try {
      const connections = await API.getMyConnections();
      setConnectionRequests(connections);
    } catch (err) {
      console.error('Failed to load connections:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentView('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Rocket className="text-red-600 animate-bounce mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading startup.hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {isAuthenticated && (
        <header className="border-b-4 border-red-600 bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
                  <Rocket className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">startup.hub</h1>
              </div>
              
              <nav className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('home')}
                  className={`px-4 py-2 font-medium ${currentView === 'home' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentView('roulette')}
                  className={`px-4 py-2 font-medium ${currentView === 'roulette' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                >
                  Roulette
                </button>
                <button
                  onClick={() => setCurrentView('ideas')}
                  className={`px-4 py-2 font-medium ${currentView === 'ideas' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                >
                  Ideas
                </button>
                <button
                  onClick={() => setCurrentView('matchmaking')}
                  className={`px-4 py-2 font-medium ${currentView === 'matchmaking' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                >
                  Matchmaking
                </button>
                <button
                  onClick={() => setCurrentView('coworking')}
                  className={`px-4 py-2 font-medium ${currentView === 'coworking' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                >
                  Co-Working
                </button>
                <button
                  onClick={() => {
                    setViewingProfile(currentUser);
                    setCurrentView('profile');
                  }}
                  className={`px-4 py-2 font-medium ${currentView === 'profile' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setCurrentView('connections')}
                  className={`px-4 py-2 font-medium relative ${currentView === 'connections' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                >
                  Connections
                  {connectionRequests.filter(c => c.status === 'pending' && c.to_founder === currentUser?.id).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                      {connectionRequests.filter(c => c.status === 'pending' && c.to_founder === currentUser?.id).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentView('messages')}
                  className={`px-4 py-2 font-medium relative ${currentView === 'messages' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                >
                  Messages
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-2 ml-4 pl-4 border-l-2 border-gray-300">
                  <User className="text-gray-600" size={20} />
                  <span className="text-sm text-gray-600">{currentUser?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'login' ? (
          <LoginView 
            onLogin={(user) => {
              setCurrentUser(user);
              setIsAuthenticated(true);
              setCurrentView('home');
            }}
            onSwitchToSignup={() => setCurrentView('signup')}
          />
        ) : currentView === 'signup' ? (
          <SignupView 
            onSignup={() => setCurrentView('onboarding')}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        ) : currentView === 'onboarding' ? (
          <OnboardingFlow 
            onComplete={(user) => {
              setCurrentUser(user);
              setIsAuthenticated(true);
              setCurrentView('home');
            }} 
          />
        ) : currentView === 'home' ? (
          <HomeView currentUser={currentUser} setCurrentView={setCurrentView} />
        ) : currentView === 'roulette' ? (
          <FounderRouletteView currentUser={currentUser} />
        ) : currentView === 'ideas' ? (
          <IdeaRoomsView currentUser={currentUser} />
        ) : currentView === 'matchmaking' ? (
          <CoFounderMatchView currentUser={currentUser} />
        ) : currentView === 'coworking' ? (
          <CoWorkingView currentUser={currentUser} />
        ) : currentView === 'profile' ? (
          <ProfileView 
            profile={viewingProfile} 
            currentUser={currentUser}
            onUpdate={(updated) => {
              setCurrentUser(updated);
              setViewingProfile(updated);
            }}
            onBack={() => setCurrentView('home')}
          />
        ) : currentView === 'connections' ? (
          <ConnectionsView 
            currentUser={currentUser}
            connections={connectionRequests}
            onRefresh={loadConnections}
            onMessage={(founder) => {
              setMessagingWith(founder);
              setCurrentView('messages');
            }}
          />
        ) : currentView === 'messages' ? (
          <MessagesView 
            currentUser={currentUser}
            messagingWith={messagingWith}
            onBack={() => setCurrentView('connections')}
          />
        ) : null}
      </main>
    </div>
  );
}

function LoginView({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await API.login(email, password);
      const profile = await API.getCurrentProfile();
      onLogin(profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="border-4 border-red-600 rounded-lg p-8 bg-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Welcome to startup.hub</h2>
          <p className="text-gray-600">Login to connect with founders</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-600 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-red-600 font-medium hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function SignupView({ onSignup, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await API.signup(email, username, password);
      await API.login(email, password);
      onSignup();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="border-4 border-red-600 rounded-lg p-8 bg-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Join startup.hub</h2>
          <p className="text-gray-600">Create your founder account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-600 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
              placeholder="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-red-600 font-medium hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    timezone: '',
    stage: '',
    industry: '',
    skills: [],
    looking_for: '',
    personality_tags: [],
    current_goal: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const stages = ["idea", "mvp", "launched", "scaling"];
  const industries = ["FinTech", "EdTech", "AI", "E-commerce", "SaaS", "HealthTech", "Other"];
  const skillOptions = ["Tech", "Marketing", "Ops", "Design", "Sales"];
  const lookingForOptions = ["cofounder", "feedback", "users", "networking"];
  const personalityOptions = [
    "🚀 Fast executor",
    "🧠 Deep thinker",
    "🎯 Growth hacker",
    "🔧 Technical builder",
    "💬 Sales & pitch person"
  ];

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const user = await API.createProfile(formData);
      onComplete(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-4 border-red-600 rounded-lg p-8 bg-white">
        <h2 className="text-3xl font-bold mb-2">Build Your Founder Profile</h2>
        <p className="text-gray-600 mb-8">Let's get you connected with the right founders</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-600 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex-1 h-2 rounded ${s <= step ? 'bg-red-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Basic Info</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Name / Alias</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                  placeholder="e.g., USA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                  placeholder="e.g., EST"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Startup Stage</label>
              <div className="grid grid-cols-2 gap-3">
                {stages.map(stage => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setFormData({...formData, stage})}
                    className={`px-4 py-3 border-2 rounded font-medium capitalize ${
                      formData.stage === stage
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-300 hover:border-red-600'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
              >
                <option value="">Select industry</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Your Skills & Interests</h3>

            <div>
              <label className="block text-sm font-medium mb-2">Skills (select multiple)</label>
              <div className="flex flex-wrap gap-3">
                {skillOptions.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      const newSkills = formData.skills.includes(skill)
                        ? formData.skills.filter(s => s !== skill)
                        : [...formData.skills, skill];
                      setFormData({...formData, skills: newSkills});
                    }}
                    className={`px-4 py-2 border-2 rounded font-medium ${
                      formData.skills.includes(skill)
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-300 hover:border-red-600'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Looking For</label>
              <div className="grid grid-cols-2 gap-3">
                {lookingForOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData({...formData, looking_for: option})}
                    className={`px-4 py-3 border-2 rounded font-medium capitalize ${
                      formData.looking_for === option
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-300 hover:border-red-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Personality Tags (select 2-3)</label>
              <div className="space-y-2">
                {personalityOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      const newPersonality = formData.personality_tags.includes(option)
                        ? formData.personality_tags.filter(p => p !== option)
                        : formData.personality_tags.length < 3
                        ? [...formData.personality_tags, option]
                        : formData.personality_tags;
                      setFormData({...formData, personality_tags: newPersonality});
                    }}
                    className={`w-full px-4 py-3 border-2 rounded font-medium text-left ${
                      formData.personality_tags.includes(option)
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-300 hover:border-red-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Your Current Goal</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                What are you building right now? What do you need?
              </label>
              <textarea
                value={formData.current_goal}
                onChange={(e) => setFormData({...formData, current_goal: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                rows="4"
                placeholder="e.g., Building an AI bookkeeping tool for small businesses — looking for a marketing co-founder."
              />
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border-2 border-gray-300 rounded font-medium hover:border-red-600"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded font-medium hover:bg-red-700"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HomeView({ currentUser, setCurrentView }) {
  return (
    <div className="space-y-8">
      <div className="border-4 border-red-600 rounded-lg p-8 bg-white text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome back, {currentUser?.name}!</h2>
        <p className="text-xl text-gray-600 mb-6">
          The place where startup founders meet their future co-founder, first user, or first breakthrough conversation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          icon={<Video className="text-red-600" size={32} />}
          title="Founder Roulette"
          description="Talk to a random founder right now"
          highlight="LIVE NOW"
          onClick={() => setCurrentView('roulette')}
        />
        <ActionCard
          icon={<MessageSquare className="text-red-600" size={32} />}
          title="Idea Validation"
          description="Get brutal feedback on your concept"
          onClick={() => setCurrentView('ideas')}
        />
        <ActionCard
          icon={<Users className="text-red-600" size={32} />}
          title="Find Co-Founder"
          description="Match with your perfect partner"
          onClick={() => setCurrentView('matchmaking')}
        />
        <ActionCard
          icon={<Target className="text-red-600" size={32} />}
          title="Co-Working Rooms"
          description="Build alongside other founders"
          onClick={() => setCurrentView('coworking')}
        />
        <ActionCard
          icon={<TrendingUp className="text-red-600" size={32} />}
          title="Track Progress"
          description="Log your weekly wins and fails"
          onClick={() => {}}
        />
        <ActionCard
          icon={<Rocket className="text-red-600" size={32} />}
          title="Pro Features"
          description="Unlock unlimited matches"
          badge="UPGRADE"
          onClick={() => {}}
        />
      </div>

      <div className="border-2 border-red-600 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-bold mb-2">Your Current Goal</h3>
        <p className="text-gray-700">{currentUser?.current_goal}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, description, highlight, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="border-2 border-gray-300 rounded-lg p-6 bg-white hover:border-red-600 transition text-left relative"
    >
      {highlight && (
        <span className="absolute top-3 right-3 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
          {highlight}
        </span>
      )}
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded">
          {badge}
        </span>
      )}
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </button>
  );
}

function FounderRouletteView({ currentUser }) {
  const [matching, setMatching] = useState(false);
  const [matched, setMatched] = useState(null);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);

  const startMatching = async () => {
    setMatching(true);
    setError('');
    
    try {
      const result = await API.matchRandomFounder();
      console.log('Match result:', result);
      setMatched(result.matched_founder);
      setSessionId(result.session_id);
    } catch (err) {
      setError(err.message || 'Failed to find a match. Please try again.');
      console.error('Matching error:', err);
    } finally {
      setMatching(false);
    }
  };

  const nextFounder = () => {
    setMatched(null);
    startMatching();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="border-4 border-red-600 rounded-lg p-8 bg-white">
        <h2 className="text-3xl font-bold mb-4">🎥 Founder Roulette</h2>
        <p className="text-gray-600 mb-8">
          Connect with random founders for 5-10 min conversations. Build serendipity.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-600 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        {!matched && !matching && (
          <div className="text-center py-12">
            <Video className="mx-auto mb-6 text-red-600" size={64} />
            <button
              onClick={startMatching}
              className="px-8 py-4 bg-red-600 text-white rounded-lg font-bold text-xl hover:bg-red-700"
            >
              Start Matching
            </button>
          </div>
        )}

        {matching && (
          <div className="text-center py-12">
            <RefreshCw className="mx-auto mb-6 text-red-600 animate-spin" size={64} />
            <p className="text-xl font-medium">Finding you a founder to talk to...</p>
          </div>
        )}

        {matched && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border-2 border-red-600">
                <Camera className="text-white" size={48} />
                <span className="text-white ml-2">You</span>
              </div>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border-2 border-red-600">
                <Camera className="text-white" size={48} />
                <span className="text-white ml-2">{matched.name}</span>
              </div>
            </div>

            <div className="border-2 border-red-600 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{matched.name}</h3>
                  <p className="text-gray-600">{matched.country} • {matched.timezone}</p>
                </div>
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium capitalize">
                  {matched.stage}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Industry:</span> {matched.industry}
                </div>
                <div>
                  <span className="font-medium">Skills:</span> {matched.skills.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Personality:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {matched.personality_tags?.map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t-2 border-gray-200">
                  <span className="font-medium">Current Goal:</span>
                  <p className="text-gray-700 mt-1">{matched.current_goal}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => alert('Connection request sent!')}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Let's Connect
              </button>
              <button
                onClick={nextFounder}
                className="flex-1 px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Next Founder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IdeaRoomsView({ currentUser }) {
  const [ideas, setIdeas] = useState([]);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [expandedIdea, setExpandedIdea] = useState(null);
  const [ideaComments, setIdeaComments] = useState({});
  const [newIdea, setNewIdea] = useState({
    problem: '',
    solution: '',
    stage: '',
    need_help: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const data = await API.getIdeas();
      setIdeas(data);
    } catch (err) {
      setError('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (ideaId) => {
    try {
      const comments = await API.getIdeaComments(ideaId);
      setIdeaComments(prev => ({ ...prev, [ideaId]: comments }));
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const submitIdea = async () => {
    setError('');
    try {
      const idea = await API.createIdea(newIdea);
      setIdeas([idea, ...ideas]);
      setShowNewIdea(false);
      setNewIdea({ problem: '', solution: '', stage: '', need_help: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleComments = async (ideaId) => {
    if (expandedIdea === ideaId) {
      setExpandedIdea(null);
    } else {
      setExpandedIdea(ideaId);
      if (!ideaComments[ideaId]) {
        await loadComments(ideaId);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">💡 Idea Validation Rooms</h2>
          <p className="text-gray-600 mt-1">Post ideas, get brutal feedback, find collaborators</p>
        </div>
        <button
          onClick={() => setShowNewIdea(!showNewIdea)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
        >
          Post New Idea
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-2 border-red-600 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      {showNewIdea && (
        <div className="border-4 border-red-600 rounded-lg p-6 bg-white">
          <h3 className="text-xl font-bold mb-4">Share Your Idea</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Problem</label>
              <textarea
                value={newIdea.problem}
                onChange={(e) => setNewIdea({...newIdea, problem: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                rows="2"
                placeholder="What problem are you solving?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Your Solution</label>
              <textarea
                value={newIdea.solution}
                onChange={(e) => setNewIdea({...newIdea, solution: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                rows="2"
                placeholder="How will you solve it?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stage</label>
              <input
                type="text"
                value={newIdea.stage}
                onChange={(e) => setNewIdea({...newIdea, stage: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                placeholder="e.g., Just idea, Validating, Building MVP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">What I Need</label>
              <input
                type="text"
                value={newIdea.need_help}
                onChange={(e) => setNewIdea({...newIdea, need_help: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                placeholder="e.g., Brutal feedback, Technical co-founder"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={submitIdea}
                className="px-6 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
              >
                Post Idea
              </button>
              <button
                onClick={() => setShowNewIdea(false)}
                className="px-6 py-2 border-2 border-gray-300 rounded font-medium hover:border-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="mx-auto mb-4 text-red-600 animate-spin" size={48} />
          <p className="text-gray-600">Loading ideas...</p>
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12 border-2 border-gray-300 rounded-lg">
          <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">No ideas yet. Be the first to post!</p>
        </div>
      ) : (
        ideas.map(idea => (
          <div key={idea.id} className="border-2 border-gray-300 rounded-lg p-6 bg-white hover:border-red-600 transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{idea.author_name}</h3>
                <p className="text-sm text-gray-500">{new Date(idea.created_at).toLocaleDateString()}</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                {idea.stage}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div>
                <span className="font-medium text-red-600">Problem:</span>
                <p className="text-gray-700 mt-1">{idea.problem}</p>
              </div>
              <div>
                <span className="font-medium text-red-600">Solution:</span>
                <p className="text-gray-700 mt-1">{idea.solution}</p>
              </div>
              <div>
                <span className="font-medium text-red-600">Need Help With:</span>
                <p className="text-gray-700 mt-1">{idea.need_help}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-200">
              <button 
                onClick={async () => {
                  try {
                    const result = await API.upvoteIdea(idea.id);
                    setIdeas(ideas.map(i => 
                      i.id === idea.id ? { ...i, upvotes: result.upvotes, user_upvoted: result.status === 'upvoted' } : i
                    ));
                  } catch (err) {
                    alert(err.message);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 border-2 rounded font-medium ${
                  idea.user_upvoted 
                    ? 'border-red-600 bg-red-50 text-red-600' 
                    : 'border-gray-300 hover:border-red-600'
                }`}
              >
                <Heart size={18} className={idea.user_upvoted ? 'fill-red-600' : ''} />
                <span>{idea.upvotes} Upvotes</span>
              </button>
              <button 
                onClick={() => toggleComments(idea.id)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded hover:border-red-600 font-medium"
              >
                <MessageSquare size={18} />
                <span>{idea.comment_count || 0} Comments</span>
              </button>
              <button 
                onClick={() => {
                  const message = prompt('Why do you want to collaborate?');
                  if (message) {
                    API.collaborateOnIdea(idea.id, message)
                      .then(() => alert('Collaboration request sent!'))
                      .catch(err => alert(err.message));
                  }
                }}
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
              >
                Offer to Collaborate
              </button>
            </div>

            {expandedIdea === idea.id && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <h4 className="font-bold mb-3">Comments</h4>
                
                {/* Add Comment Form */}
                <div className="mb-4">
                  <textarea
                    placeholder="Write a comment..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                    rows="2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const content = e.target.value.trim();
                        if (content) {
                          API.commentOnIdea(idea.id, content)
                            .then(() => {
                              e.target.value = '';
                              loadComments(idea.id);
                              setIdeas(ideas.map(i => 
                                i.id === idea.id ? { ...i, comment_count: (i.comment_count || 0) + 1 } : i
                              ));
                            })
                            .catch(err => alert(err.message));
                        }
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Press Enter to post</p>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {ideaComments[idea.id]?.length > 0 ? (
                    ideaComments[idea.id].map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author_name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No comments yet. Be the first!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function CoFounderMatchView({ currentUser }) {
  const [founders, setFounders] = useState([]);
  const [filteredFounders, setFilteredFounders] = useState([]);
  const [filters, setFilters] = useState({
    looking_for: 'all',
    stage: 'all',
    industry: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingFounder, setViewingFounder] = useState(null);

  useEffect(() => {
    loadFounders();
  }, [filters]);

  useEffect(() => {
    // Filter founders based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = founders.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.industry?.toLowerCase().includes(query) ||
        f.current_goal?.toLowerCase().includes(query)
      );
      setFilteredFounders(filtered);
    } else {
      setFilteredFounders(founders);
    }
  }, [searchQuery, founders]);

  const loadFounders = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.stage !== 'all') filterParams.stage = filters.stage;
      if (filters.industry !== 'all') filterParams.industry = filters.industry;
      if (filters.looking_for !== 'all') filterParams.looking_for = filters.looking_for;
      
      const data = await API.getFounders(filterParams);
      setFounders(data);
      setFilteredFounders(data);
    } catch (err) {
      console.error('Failed to load founders:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewProfile = async (founderId) => {
    try {
      const profile = await API.getFounderProfile(founderId);
      setViewingFounder(profile);
    } catch (err) {
      alert('Failed to load profile');
    }
  };

  const sendConnection = async (founder) => {
    try {
      await API.sendConnectionRequest(founder.id, `Hi ${founder.name}, I'd like to connect!`);
      alert(`Connection request sent to ${founder.name}! Check the Connections tab to see your requests.`);
    } catch (err) {
      alert(err.message || 'Failed to send connection request');
    }
  };

  if (viewingFounder) {
    return (
      <FounderProfileModal
        founder={viewingFounder}
        currentUser={currentUser}
        onClose={() => setViewingFounder(null)}
        onConnect={sendConnection}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">🤝 Find a Co-Founder</h2>
        <p className="text-gray-600 mt-1">Match with founders who complement your skills</p>
      </div>

      <div className="border-2 border-red-600 rounded-lg p-6 bg-white">
        <h3 className="font-bold mb-4">Filters</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Looking For</label>
            <select
              value={filters.looking_for}
              onChange={(e) => setFilters({...filters, looking_for: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
            >
              <option value="all">All</option>
              <option value="cofounder">Co-founder</option>
              <option value="feedback">Feedback</option>
              <option value="users">Users</option>
              <option value="networking">Networking</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Stage</label>
            <select
              value={filters.stage}
              onChange={(e) => setFilters({...filters, stage: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
            >
              <option value="all">All Stages</option>
              <option value="idea">Idea</option>
              <option value="mvp">MVP</option>
              <option value="launched">Launched</option>
              <option value="scaling">Scaling</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({...filters, industry: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
            >
              <option value="all">All Industries</option>
              <option value="FinTech">FinTech</option>
              <option value="AI">AI</option>
              <option value="EdTech">EdTech</option>
              <option value="E-commerce">E-commerce</option>
              <option value="SaaS">SaaS</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="mx-auto mb-4 text-red-600 animate-spin" size={48} />
          <p className="text-gray-600">Loading founders...</p>
        </div>
      ) : founders.length === 0 ? (
        <div className="text-center py-12 border-2 border-gray-300 rounded-lg">
          <Users className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">No founders found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {founders.map(founder => (
            <div key={founder.id} className="border-2 border-gray-300 rounded-lg p-6 bg-white hover:border-red-600 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">{founder.name}</h3>
                    {founder.is_online && (
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-600">{founder.country} • {founder.timezone}</p>
                </div>
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium capitalize">
                  {founder.stage}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <span className="font-medium">Industry:</span> {founder.industry}
                </div>
                <div>
                  <span className="font-medium">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {founder.skills?.map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Looking For:</span> <span className="capitalize">{founder.looking_for}</span>
                </div>
                <div>
                  <span className="font-medium">Personality:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {founder.personality_tags?.map((p, i) => (
                      <span key={i} className="text-sm">{p}</span>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t-2 border-gray-200">
                  <span className="font-medium">Goal:</span>
                  <p className="text-gray-700 mt-1 text-sm">{founder.current_goal}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => sendConnection(founder)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
                >
                  Connect
                </button>
                <button 
                  onClick={() => viewProfile(founder.id)}
                  className="px-4 py-2 border-2 border-red-600 text-red-600 rounded font-medium hover:bg-red-50"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CoWorkingView({ currentUser }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // Refresh every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      const data = await API.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedRoom) return;
    try {
      const data = await API.getRoomMessages(selectedRoom.id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const joinRoom = async (room) => {
    try {
      await API.joinRoom(room.id);
      setSelectedRoom(room);
      loadMessages();
    } catch (err) {
      console.error('Failed to join room:', err);
      setSelectedRoom(room); // Still open the room even if join fails
    }
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sending) return;
    
    setSending(true);
    try {
      console.log('Sending message:', trimmedMessage, 'to room:', selectedRoom.id);
      const result = await API.sendRoomMessage(selectedRoom.id, trimmedMessage);
      console.log('Message sent successfully:', result);
      setMessage('');
      
      // Immediately add the message to the UI
      setMessages([...messages, result]);
      
      // Reload after a short delay to get any other new messages
      setTimeout(loadMessages, 500);
    } catch (err) {
      console.error('Send message error:', err);
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">🏢 Virtual Co-Working Rooms</h2>
        <p className="text-gray-600 mt-1">Drop in, work silently, or chat with fellow founders</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="mx-auto mb-4 text-red-600 animate-spin" size={48} />
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      ) : !selectedRoom ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => joinRoom(room)}
              className="border-2 border-gray-300 rounded-lg p-6 bg-white hover:border-red-600 transition text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold">{room.emoji} {room.name}</h3>
                {room.is_active && (
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{room.description}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={18} />
                <span>{room.member_count || 0} founders inside</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="border-4 border-red-600 rounded-lg p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{selectedRoom.emoji} {selectedRoom.name}</h3>
            <button
              onClick={() => setSelectedRoom(null)}
              className="px-4 py-2 border-2 border-gray-300 rounded font-medium hover:border-red-600"
            >
              Leave Room
            </button>
          </div>

          <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
            <div className="font-bold mb-4">Room Chat</div>
            <div className="space-y-3 mb-4 h-48 overflow-y-auto">
              <div className="text-sm text-gray-500 text-center">
                Welcome to {selectedRoom.name}! Start chatting with fellow founders.
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
              />
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// UPDATED ConnectionsView with Search
function ConnectionsView({ currentUser, connections, onRefresh, onMessage, onViewProfile }) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConnections, setFilteredConnections] = useState(connections);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = connections.filter(conn => {
        const otherFounder = conn.from_founder === currentUser?.id 
          ? conn.to_founder_details 
          : conn.from_founder_details;
        return otherFounder?.name?.toLowerCase().includes(query) ||
               otherFounder?.username?.toLowerCase().includes(query);
      });
      setFilteredConnections(filtered);
    } else {
      setFilteredConnections(connections);
    }
  }, [searchQuery, connections, currentUser]);

  const handleAccept = async (connectionId) => {
    setLoading(true);
    try {
      await API.acceptConnection(connectionId);
      alert('Connection accepted!');
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pendingReceived = filteredConnections.filter(c => 
    c.status === 'pending' && c.to_founder === currentUser?.id
  );
  const pendingSent = filteredConnections.filter(c => 
    c.status === 'pending' && c.from_founder === currentUser?.id
  );
  const accepted = filteredConnections.filter(c => c.status === 'accepted');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">🤝 Connections</h2>
        <p className="text-gray-600">Manage your founder network</p>
      </div>

      <SearchBar 
        onSearch={setSearchQuery}
        placeholder="Search connections by name or username..."
      />

      {pendingReceived.length > 0 && (
        <div className="border-4 border-red-600 rounded-lg p-6 bg-white">
          <h3 className="text-xl font-bold mb-4">
            Pending Requests ({pendingReceived.length})
          </h3>
          <div className="space-y-4">
            {pendingReceived.map(conn => (
              <div key={conn.id} className="border-2 border-gray-300 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {conn.from_founder_details?.profile_image_url ? (
                    <img 
                      src={conn.from_founder_details.profile_image_url} 
                      alt={conn.from_founder_details.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-red-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                      {conn.from_founder_details?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold">{conn.from_founder_details?.name || 'Unknown Founder'}</h4>
                    <p className="text-sm text-gray-600">@{conn.from_founder_details?.username}</p>
                    <p className="text-sm text-gray-600">{conn.from_founder_details?.industry}</p>
                    {conn.message && (
                      <p className="text-sm text-gray-700 mt-2 italic">"{conn.message}"</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conn.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(conn.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:bg-gray-400"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onViewProfile(conn.from_founder_details)}
                    className="px-4 py-2 border-2 border-red-600 text-red-600 rounded font-medium hover:bg-red-50"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingSent.length > 0 && (
        <div className="border-2 border-gray-300 rounded-lg p-6 bg-white">
          <h3 className="text-xl font-bold mb-4">
            Sent Requests ({pendingSent.length})
          </h3>
          <div className="space-y-4">
            {pendingSent.map(conn => (
              <div key={conn.id} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {conn.to_founder_details?.profile_image_url ? (
                      <img 
                        src={conn.to_founder_details.profile_image_url} 
                        alt={conn.to_founder_details.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-600"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                        {conn.to_founder_details?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold">{conn.to_founder_details?.name || 'Unknown Founder'}</h4>
                      <p className="text-sm text-gray-600">@{conn.to_founder_details?.username}</p>
                      <p className="text-sm text-gray-600">{conn.to_founder_details?.industry}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Sent {new Date(conn.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {accepted.length > 0 ? (
        <div className="border-2 border-gray-300 rounded-lg p-6 bg-white">
          <h3 className="text-xl font-bold mb-4">
            My Connections ({accepted.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {accepted.map(conn => {
              const otherFounder = conn.from_founder === currentUser?.id 
                ? conn.to_founder_details 
                : conn.from_founder_details;
              
              return (
                <div key={conn.id} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {otherFounder?.profile_image_url ? (
                      <img 
                        src={otherFounder.profile_image_url} 
                        alt={otherFounder.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-600"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                        {otherFounder?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold">{otherFounder?.name || 'Unknown'}</h4>
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      </div>
                      <p className="text-sm text-gray-600">@{otherFounder?.username}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{otherFounder?.industry}</p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{otherFounder?.current_goal}</p>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => onMessage(otherFounder)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 text-sm"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => onViewProfile(otherFounder)}
                      className="px-4 py-2 border-2 border-red-600 text-red-600 rounded font-medium hover:bg-red-50 text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        !pendingReceived.length && !pendingSent.length && (
          <div className="text-center py-12 border-2 border-gray-300 rounded-lg">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">No connections yet. Start connecting with founders!</p>
          </div>
        )
      )}
    </div>
  );
}

// UPDATED MessagesView with Search
function MessagesView({ currentUser, messagingWith, onBack, onViewProfile }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(messagingWith);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);

  useEffect(() => {
    loadConversations();
    if (messagingWith) {
      loadConversation(messagingWith.id);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = conversations.filter(conv => 
        conv.founder?.name?.toLowerCase().includes(query) ||
        conv.founder?.username?.toLowerCase().includes(query)
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const loadConversations = async () => {
    try {
      const msgs = await API.getMyMessages();
      const convMap = new Map();
      msgs.forEach(msg => {
        const partnerId = msg.from_founder === currentUser?.id ? msg.to_founder : msg.from_founder;
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, {
            founder: msg.from_founder === currentUser?.id ? msg.to_founder_details : msg.from_founder_details,
            lastMessage: msg,
            unread: msg.to_founder === currentUser?.id && !msg.read
          });
        }
      });
      const convList = Array.from(convMap.values());
      setConversations(convList);
      setFilteredConversations(convList);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (founderId) => {
    try {
      const msgs = await API.getConversation(founderId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      await API.sendDirectMessage(selectedConversation.id, newMessage);
      setNewMessage('');
      loadConversation(selectedConversation.id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium"
        >
          ← Back to Connections
        </button>
      </div>

      <div className="border-4 border-red-600 rounded-lg bg-white overflow-hidden" style={{height: '600px'}}>
        <div className="grid grid-cols-3 h-full">
          <div className="col-span-1 border-r-2 border-red-600 overflow-y-auto">
            <div className="p-4 bg-red-600 text-white font-bold">Messages</div>
            <div className="p-3">
              <SearchBar 
                onSearch={setSearchQuery}
                placeholder="Search messages..."
              />
            </div>
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No messages yet</div>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv.founder.id}
                  onClick={() => {
                    setSelectedConversation(conv.founder);
                    loadConversation(conv.founder.id);
                  }}
                  className={`w-full p-4 text-left border-b-2 border-gray-200 hover:bg-gray-50 ${
                    selectedConversation?.id === conv.founder.id ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {conv.founder.profile_image_url ? (
                      <img 
                        src={conv.founder.profile_image_url} 
                        alt={conv.founder.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-red-600"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                        {conv.founder.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{conv.founder.name}</div>
                      <div className="text-sm text-gray-600 truncate">@{conv.founder.username}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</div>
                  {conv.unread && (
                    <span className="inline-block mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded-full">New</span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b-2 border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedConversation.profile_image_url ? (
                      <img 
                        src={selectedConversation.profile_image_url} 
                        alt={selectedConversation.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-red-600"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                        {selectedConversation.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold">{selectedConversation.name}</h3>
                      <p className="text-sm text-gray-600">{selectedConversation.industry}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewProfile(selectedConversation)}
                    className="px-4 py-2 border-2 border-red-600 text-red-600 rounded font-medium hover:bg-red-50 text-sm"
                  >
                    View Profile
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.from_founder === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.from_founder === currentUser?.id
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t-2 border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      className="px-6 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <MessageSquare size={48} className="mb-4" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ profile, currentUser, onUpdate, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile || {});
  const [saving, setSaving] = useState(false);

  const isOwnProfile = profile?.id === currentUser?.id;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await API.updateProfile(editData);
      onUpdate(updated);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <button
          onClick={onBack}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium"
        >
          ← Back
        </button>
      </div>

      <div className="border-4 border-red-600 rounded-lg p-8 bg-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{profile?.name}</h2>
            <p className="text-gray-600">{profile?.country} • {profile?.timezone}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium capitalize">
              {profile?.stage}
            </span>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border-2 border-red-600 text-red-600 rounded font-medium hover:bg-red-50"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input
                  type="text"
                  value={editData.country}
                  onChange={(e) => setEditData({...editData, country: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <input
                  type="text"
                  value={editData.timezone}
                  onChange={(e) => setEditData({...editData, timezone: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <input
                type="text"
                value={editData.industry}
                onChange={(e) => setEditData({...editData, industry: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current Goal</label>
              <textarea
                value={editData.current_goal}
                onChange={(e) => setEditData({...editData, current_goal: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
                rows="4"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">Industry</h3>
              <p className="text-gray-700">{profile?.industry}</p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Looking For</h3>
              <p className="text-gray-700 capitalize">{profile?.looking_for}</p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Personality</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.personality_tags?.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-red-50 border-2 border-red-600 text-red-600 rounded text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">Current Goal</h3>
              <p className="text-gray-700">{profile?.current_goal}</p>
            </div>

            <div className="pt-4 border-t-2 border-gray-200">
              <p className="text-sm text-gray-500">
                {profile?.created_at && `Member since ${new Date(profile.created_at).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;