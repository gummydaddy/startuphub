import React, { useState, useEffect } from 'react';
import { Camera, Users, MessageSquare, Target, TrendingUp, Video, X, Check, RefreshCw, Send, Heart, Rocket, Brain, Zap, Code, DollarSign } from 'lucide-react';

// Mock API service (replace with real backend calls)
const API = {
  async createProfile(data) {
    await new Promise(r => setTimeout(r, 500));
    return { id: Date.now(), ...data };
  },
  async getFounders(filters = {}) {
    await new Promise(r => setTimeout(r, 300));
    return mockFounders;
  },
  async createIdea(data) {
    await new Promise(r => setTimeout(r, 500));
    return { id: Date.now(), ...data, upvotes: 0, comments: [] };
  },
  async matchRandomFounder(currentUser) {
    await new Promise(r => setTimeout(r, 800));
    const available = mockFounders.filter(f => f.id !== currentUser?.id);
    return available[Math.floor(Math.random() * available.length)];
  }
};

// Mock data
const mockFounders = [
  {
    id: 1,
    name: "Sarah Chen",
    country: "Singapore",
    timezone: "GMT+8",
    stage: "MVP",
    industry: "FinTech",
    skills: ["Tech", "Design"],
    lookingFor: "Co-founder",
    personality: ["🚀 Fast executor", "🔧 Technical builder"],
    currentGoal: "Building a crypto wallet for SEA markets - need growth marketer",
    online: true
  },
  {
    id: 2,
    name: "Marcus Johnson",
    country: "USA",
    timezone: "EST",
    stage: "Launched",
    industry: "AI",
    skills: ["Marketing", "Sales"],
    lookingFor: "Feedback",
    personality: ["💬 Sales & pitch person", "🎯 Growth hacker"],
    currentGoal: "Scaling AI writing tool - 500 users, looking for technical co-founder",
    online: true
  },
  {
    id: 3,
    name: "Priya Sharma",
    country: "India",
    timezone: "IST",
    stage: "Idea",
    industry: "EdTech",
    skills: ["Ops", "Design"],
    lookingFor: "Just networking",
    personality: ["🧠 Deep thinker", "🚀 Fast executor"],
    currentGoal: "Validating AI-powered career counseling platform for college students",
    online: false
  }
];

const mockIdeas = [
  {
    id: 1,
    author: "Alex Turner",
    problem: "Small businesses can't track daily cash flow easily",
    solution: "WhatsApp-based AI accountant",
    stage: "Just idea",
    needHelp: "Brutal feedback + someone technical",
    upvotes: 12,
    comments: 5,
    timestamp: "2 hours ago"
  }
];

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-4 border-red-600 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
                <Rocket className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">startup.hub</h1>
            </div>
            
            {currentUser && (
              <nav className="flex gap-4">
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
                  Founder Roulette
                </button>
                <button
                  onClick={() => setCurrentView('ideas')}
                  className={`px-4 py-2 font-medium ${currentView === 'ideas' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                >
                  Idea Rooms
                </button>
                <button
                  onClick={() => setCurrentView('matchmaking')}
                  className={`px-4 py-2 font-medium ${currentView === 'matchmaking' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                >
                  Find Co-Founder
                </button>
                <button
                  onClick={() => setCurrentView('coworking')}
                  className={`px-4 py-2 font-medium ${currentView === 'coworking' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                >
                  Co-Working
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!currentUser && showOnboarding ? (
          <OnboardingFlow onComplete={(user) => {
            setCurrentUser(user);
            setShowOnboarding(false);
          }} />
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
        ) : null}
      </main>
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
    lookingFor: '',
    personality: [],
    currentGoal: ''
  });

  const stages = ["Idea", "MVP", "Launched", "Scaling"];
  const industries = ["FinTech", "EdTech", "AI", "E-commerce", "SaaS", "HealthTech", "Other"];
  const skillOptions = ["Tech", "Marketing", "Ops", "Design", "Sales"];
  const lookingForOptions = ["Co-founder", "Feedback", "Users", "Just networking"];
  const personalityOptions = [
    "🚀 Fast executor",
    "🧠 Deep thinker",
    "🎯 Growth hacker",
    "🔧 Technical builder",
    "💬 Sales & pitch person"
  ];

  const handleSubmit = async () => {
    const user = await API.createProfile(formData);
    onComplete(user);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-4 border-red-600 rounded-lg p-8 bg-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to startup.hub</h2>
        <p className="text-gray-600 mb-8">Let's set up your founder profile</p>

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
                    onClick={() => setFormData({...formData, stage})}
                    className={`px-4 py-3 border-2 rounded font-medium ${
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
                    onClick={() => setFormData({...formData, lookingFor: option})}
                    className={`px-4 py-3 border-2 rounded font-medium ${
                      formData.lookingFor === option
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
                    onClick={() => {
                      const newPersonality = formData.personality.includes(option)
                        ? formData.personality.filter(p => p !== option)
                        : formData.personality.length < 3
                        ? [...formData.personality, option]
                        : formData.personality;
                      setFormData({...formData, personality: newPersonality});
                    }}
                    className={`w-full px-4 py-3 border-2 rounded font-medium text-left ${
                      formData.personality.includes(option)
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
                value={formData.currentGoal}
                onChange={(e) => setFormData({...formData, currentGoal: e.target.value})}
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
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded font-medium hover:bg-red-700"
            >
              Complete Profile
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
        <p className="text-gray-700">{currentUser?.currentGoal}</p>
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
  const [inCall, setInCall] = useState(false);

  const startMatching = async () => {
    setMatching(true);
    const founder = await API.matchRandomFounder(currentUser);
    setMatched(founder);
    setMatching(false);
    setInCall(true);
  };

  const nextFounder = () => {
    setInCall(false);
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
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
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
                    {matched.personality.map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t-2 border-gray-200">
                  <span className="font-medium">Current Goal:</span>
                  <p className="text-gray-700 mt-1">{matched.currentGoal}</p>
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
  const [ideas, setIdeas] = useState(mockIdeas);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newIdea, setNewIdea] = useState({
    problem: '',
    solution: '',
    stage: '',
    needHelp: ''
  });

  const submitIdea = async () => {
    const idea = await API.createIdea({
      ...newIdea,
      author: currentUser.name,
      timestamp: 'Just now'
    });
    setIdeas([idea, ...ideas]);
    setShowNewIdea(false);
    setNewIdea({ problem: '', solution: '', stage: '', needHelp: '' });
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
                value={newIdea.needHelp}
                onChange={(e) => setNewIdea({...newIdea, needHelp: e.target.value})}
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

      {ideas.map(idea => (
        <div key={idea.id} className="border-2 border-gray-300 rounded-lg p-6 bg-white hover:border-red-600 transition">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">{idea.author}</h3>
              <p className="text-sm text-gray-500">{idea.timestamp}</p>
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
              <p className="text-gray-700 mt-1">{idea.needHelp}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t-2 border-gray-200">
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded hover:border-red-600 font-medium">
              <Heart size={18} />
              <span>{idea.upvotes} Upvotes</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded hover:border-red-600 font-medium">
              <MessageSquare size={18} />
              <span>{idea.comments} Comments</span>
            </button>
            <button className="ml-auto px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700">
              Offer to Collaborate
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CoFounderMatchView({ currentUser }) {
  const [founders, setFounders] = useState(mockFounders);
  const [filters, setFilters] = useState({
    lookingFor: 'all',
    stage: 'all',
    industry: 'all'
  });

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
              value={filters.lookingFor}
              onChange={(e) => setFilters({...filters, lookingFor: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-red-600 outline-none"
            >
              <option value="all">All</option>
              <option value="Co-founder">Co-founder</option>
              <option value="Feedback">Feedback</option>
              <option value="Users">Users</option>
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
              <option value="Idea">Idea</option>
              <option value="MVP">MVP</option>
              <option value="Launched">Launched</option>
              <option value="Scaling">Scaling</option>
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
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {founders.map(founder => (
          <div key={founder.id} className="border-2 border-gray-300 rounded-lg p-6 bg-white hover:border-red-600 transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{founder.name}</h3>
                  {founder.online && (
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  )}
                </div>
                <p className="text-gray-600">{founder.country} • {founder.timezone}</p>
              </div>
              <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
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
                  {founder.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Looking For:</span> {founder.lookingFor}
              </div>
              <div>
                <span className="font-medium">Personality:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {founder.personality.map((p, i) => (
                    <span key={i} className="text-sm">{p}</span>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t-2 border-gray-200">
                <span className="font-medium">Goal:</span>
                <p className="text-gray-700 mt-1 text-sm">{founder.currentGoal}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700">
                Interested to Build Together
              </button>
              <button className="px-4 py-2 border-2 border-red-600 text-red-600 rounded font-medium hover:bg-red-50">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoWorkingView({ currentUser }) {
  const rooms = [
    { id: 1, name: "💻 Indie Hackers Room", members: 12, active: true },
    { id: 2, name: "💰 Fundraising Room", members: 8, active: true },
    { id: 3, name: "🤖 AI Builders Room", members: 24, active: true },
    { id: 4, name: "🌍 First-time Founders Room", members: 15, active: true },
    { id: 5, name: "🚀 Growth & Marketing", members: 9, active: false },
    { id: 6, name: "📱 Mobile App Founders", members: 6, active: false }
  ];

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">🏢 Virtual Co-Working Rooms</h2>
        <p className="text-gray-600 mt-1">Drop in, work silently, or chat with fellow founders</p>
      </div>

      {!selectedRoom ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className="border-2 border-gray-300 rounded-lg p-6 bg-white hover:border-red-600 transition text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold">{room.name}</h3>
                {room.active && (
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={18} />
                <span>{room.members} founders inside</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="border-4 border-red-600 rounded-lg p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">{selectedRoom.name}</h3>
            <button
              onClick={() => setSelectedRoom(null)}
              className="px-4 py-2 border-2 border-gray-300 rounded font-medium hover:border-red-600"
            >
              Leave Room
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="border-2 border-gray-300 rounded-lg p-4">
              <div className="font-bold mb-2">{selectedRoom.members} Members</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">You</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Alex K.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Sarah M.</span>
                </div>
                <div className="text-sm text-gray-500">+{selectedRoom.members - 3} more</div>
              </div>
            </div>

            <div className="md:col-span-2 border-2 border-gray-300 rounded-lg p-4">
              <div className="font-bold mb-4">Room Chat</div>
              <div className="space-y-3 mb-4 h-48 overflow-y-auto">
                <div className="text-sm">
                  <span className="font-medium">Alex K.:</span> Just launched v2 of my landing page!
                </div>
                <div className="text-sm">
                  <span className="font-medium">Sarah M.:</span> Congrats! Would love feedback on my pricing model
                </div>
                <div className="text-sm">
                  <span className="font-medium">You:</span> Hey everyone! 👋
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

          <div className="border-2 border-gray-300 rounded-lg p-4">
            <div className="font-bold mb-2">Quick Help Board</div>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <span className="font-medium">Alex K.:</span> Anyone know a good analytics tool for SaaS?
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="font-medium">Sarah M.:</span> Looking for feedback on pricing: $29 vs $49/mo?
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
