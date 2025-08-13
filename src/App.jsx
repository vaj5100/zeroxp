import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Search, Zap, TrendingUp, MapPin, DollarSign, Users, X, ChevronDown } from 'lucide-react';
import { employerAPI } from './api';

/** ===== CAREER PROGRESSION CONFIG ===== */
const XP_ACTIONS = {
  SIGNUP: 25,
  DAILY_LOGIN: 5,
  COMPLETE_PROFILE: 50,
  UPLOAD_RESUME: 75,
  UPLOAD_VIDEO_CV: 200,
  APPLY_TO_JOB: 35,
  GET_INTERVIEW_INVITE: 150,
  COMPLETE_INTERVIEW: 250,
  RECEIVE_JOB_OFFER: 500,
  ACCEPT_JOB_OFFER: 750,
  POST_JOB: 25,
  HIRE_CANDIDATE: 100,
  COMPLETE_DAILY_CHALLENGE: 10,
  REFER_FRIEND: 50,
  COMPLETE_SKILL_ASSESSMENT: 75,
  ATTEND_WEBINAR: 35,
  WRITE_REVIEW: 25,
  SHARE_JOB: 10,
  COMPLETE_COURSE: 150,
  // Career progression challenges
  COMPLETE_WEEKLY_CHALLENGE: 100,
  COMPLETE_SEASONAL_CHALLENGE: 500,
  LAND_DREAM_JOB: 200,
  COMPLETE_INTERVIEWS: 25,
  MAINTAIN_STREAK: 50,
  BUILD_PORTFOLIO: 75,
  LEARN_SKILLS: 15,
  EXPLORE_OPPORTUNITIES: 20,
  NETWORK_CONNECTIONS: 10,
  CELEBRATE_SUCCESS: 300,
  HELP_OTHERS: 100,
  FIND_PERFECT_ROLE: 150,
  MEET_REQUIREMENTS: 80,
  CUSTOMIZE_PROFILE: 200,
  REACH_FINALS: 150,
  FIRST_INTERVIEW: 50,
  COMPLETE_ONBOARDING: 100,
  JOIN_COMMUNITY: 75,
  TEAM_HIRING: 250,
  GROUP_PROJECT: 400,
  COMPLETE_DAILY_QUEST: 25,
  COMPLETE_WEEKLY_QUEST: 150,
  COMPLETE_SEASON_QUEST: 1000
};

// Career seasons
const SEASONS = {
  SEASON_1: { name: 'Career Launch', theme: 'cyberpunk', startDate: '2024-01-01', endDate: '2024-03-31' },
  SEASON_2: { name: 'Professional Rise', theme: 'futuristic', startDate: '2024-04-01', endDate: '2024-06-30' },
  SEASON_3: { name: 'Elite Hunt', theme: 'neon', startDate: '2024-07-01', endDate: '2024-09-30' },
  SEASON_4: { name: 'Legendary Quest', theme: 'golden', startDate: '2024-10-01', endDate: '2024-12-31' }
};

// Career progression tiers (100 tiers)
const CAREER_TIERS = [
  // Free tier rewards
  { tier: 1, xpRequired: 0, freeReward: 'Basic Profile Enhancement', premiumReward: 'Rare Profile Frame' },
  { tier: 2, xpRequired: 100, freeReward: '50 XP', premiumReward: 'Epic Application Boost' },
  { tier: 3, xpRequired: 200, freeReward: 'Basic Achievement', premiumReward: 'Rare Job Alert' },
  { tier: 4, xpRequired: 300, freeReward: 'Profile Badge', premiumReward: 'Epic Profile Theme' },
  { tier: 5, xpRequired: 400, freeReward: '100 XP', premiumReward: 'Legendary Application Priority' },
  { tier: 6, xpRequired: 500, freeReward: 'Basic Success Animation', premiumReward: 'Epic Interview Prep' },
  { tier: 7, xpRequired: 600, freeReward: 'Profile Icon', premiumReward: 'Rare Skill Assessment' },
  { tier: 8, xpRequired: 700, freeReward: '150 XP', premiumReward: 'Epic Networking Event' },
  { tier: 9, xpRequired: 800, freeReward: 'Basic Loading Screen', premiumReward: 'Legendary Job Match' },
  { tier: 10, xpRequired: 900, freeReward: 'Profile Banner', premiumReward: 'Epic Career Coaching' },
  // Continue with more tiers...
  { tier: 50, xpRequired: 5000, freeReward: 'Epic Profile Enhancement', premiumReward: 'Legendary Profile Frame' },
  { tier: 75, xpRequired: 8000, freeReward: 'Rare Success Animation', premiumReward: 'Epic Job Guarantee' },
  { tier: 100, xpRequired: 12000, freeReward: 'Legendary Profile Theme', premiumReward: 'Ultimate Career Package' }
];

// Career challenges
const CHALLENGES = {
  DAILY: [
    { id: 'daily_1', title: 'Apply to 3 jobs', xp: 50, description: 'Submit 3 job applications' },
    { id: 'daily_2', title: 'Update your profile', xp: 25, description: 'Complete one profile section' },
    { id: 'daily_3', title: 'Share a job', xp: 15, description: 'Share a job posting with friends' },
    { id: 'daily_4', title: 'Learn a new skill', xp: 30, description: 'Complete a skill assessment' },
    { id: 'daily_5', title: 'Network online', xp: 20, description: 'Connect with 2 professionals' }
  ],
  WEEKLY: [
    { id: 'weekly_1', title: 'Apply to 15 jobs', xp: 500, description: 'Submit 15 job applications this week' },
    { id: 'weekly_2', title: 'Complete 5 interviews', xp: 1000, description: 'Participate in 5 interviews' },
    { id: 'weekly_3', title: 'Upload video CV', xp: 600, description: 'Create and upload a video CV' },
    { id: 'weekly_4', title: 'Get 3 interview invites', xp: 800, description: 'Receive 3 interview invitations' },
    { id: 'weekly_5', title: 'Build your portfolio', xp: 750, description: 'Create and showcase your projects' }
  ],
  SEASONAL: [
    { id: 'seasonal_1', title: 'Land your dream job', xp: 2000, description: 'Accept a job offer' },
    { id: 'seasonal_2', title: 'Reach level 50', xp: 1500, description: 'Achieve career tier 50' },
    { id: 'seasonal_3', title: 'Complete 100 applications', xp: 1000, description: 'Submit 100 job applications' },
    { id: 'seasonal_4', title: 'Master all skills', xp: 1200, description: 'Complete all skill assessments' },
    { id: 'seasonal_5', title: 'Build strong network', xp: 800, description: 'Connect with 50+ professionals' }
  ]
};

// Career progression system
const getCareerLevel = (xp) => {
  const tier = CAREER_TIERS.find(t => xp >= t.xpRequired) || CAREER_TIERS[CAREER_TIERS.length - 1];
  return {
    tier: tier.tier,
    xp: xp,
    nextTierXP: tier.xpRequired,
    freeReward: tier.freeReward,
    premiumReward: tier.premiumReward,
    progress: Math.min(((xp - tier.xpRequired) / (tier.xpRequired - (tier.tier > 1 ? CAREER_TIERS[tier.tier - 2].xpRequired : 0))) * 100, 100)
  };
};

// Get current season
const getCurrentSeason = () => {
  const now = new Date();
  return Object.entries(SEASONS).find(([key, season]) => {
    const start = new Date(season.startDate);
    const end = new Date(season.endDate);
    return now >= start && now <= end;
  })?.[1] || SEASONS.SEASON_1;
};

// Priority system for higher-level users
const getApplicationPriority = (userXP) => {
  const level = getJobHuntXPLevel(userXP);
  const features = getLevelFeatures(userXP);
  
  switch(level.level) {
    case 5: return { 
      priority: 'legendary', 
      boost: 5, 
      color: 'text-yellow-300', 
      icon: '👑',
      description: `${features.visibility} visibility, ${features.supportLevel}`
    };
    case 4: return { 
      priority: 'elite', 
      boost: 4, 
      color: 'text-purple-300', 
      icon: '💎',
      description: `${features.visibility} visibility, ${features.supportLevel}`
    };
    case 3: return { 
      priority: 'champion', 
      boost: 3, 
      color: 'text-pink-300', 
      icon: '🏆',
      description: `${features.visibility} visibility, ${features.supportLevel}`
    };
    case 2: return { 
      priority: 'pro', 
      boost: 2, 
      color: 'text-cyan-300', 
      icon: '⭐',
      description: `${features.visibility} visibility, ${features.supportLevel}`
    };
    default: return { 
      priority: 'standard', 
      boost: 1, 
      color: 'text-gray-300', 
      icon: '🌱',
      description: `${features.visibility} visibility, ${features.supportLevel}`
    };
  }
};

const getLevelFeatures = (userXP) => {
  const level = getJobHuntXPLevel(userXP);
  
  switch(level.level) {
    case 5: return { 
      visibility: 'Maximum', 
      supportLevel: 'VIP support' 
    };
    case 4: return { 
      visibility: 'Elite', 
      supportLevel: 'Priority support' 
    };
    case 3: return { 
      visibility: 'Champion', 
      supportLevel: 'Enhanced support' 
    };
    case 2: return { 
      visibility: 'Pro', 
      supportLevel: 'Standard support' 
    };
    default: return { 
      visibility: 'Standard', 
      supportLevel: 'Basic support' 
    };
  }
};

const getJobHuntXPLevel = (xp) => {
  if (xp >= 3500) return { 
    level: 5, 
    name: 'Legendary Hunter', 
    color: 'text-yellow-300', 
    bgColor: 'bg-yellow-500/20', 
    borderColor: 'border-yellow-500/40', 
    icon: '👑', 
    advantage: 'Maximum visibility, priority support, exclusive job alerts, featured profile',
    badge: 'bg-gradient-to-r from-yellow-400 to-orange-500'
  };
  if (xp >= 2000) return { 
    level: 4, 
    name: 'Elite Professional', 
    color: 'text-purple-300', 
    bgColor: 'bg-purple-500/20', 
    borderColor: 'border-purple-500/40', 
    icon: '💎', 
    advantage: 'Elite visibility, VIP support, priority alerts, enhanced profile',
    badge: 'bg-gradient-to-r from-purple-400 to-pink-500'
  };
  if (xp >= 1000) return { 
    level: 3, 
    name: 'Career Champion', 
    color: 'text-pink-300', 
    bgColor: 'bg-pink-500/20', 
    borderColor: 'border-pink-500/40', 
    icon: '🏆', 
    advantage: 'Champion visibility, enhanced placement, skill assessments, priority ranking',
    badge: 'bg-gradient-to-r from-pink-400 to-red-500'
  };
  if (xp >= 400) return { 
    level: 2, 
    name: 'Rising Pro', 
    color: 'text-cyan-300', 
    bgColor: 'bg-cyan-500/20', 
    borderColor: 'border-cyan-500/40', 
    icon: '⭐', 
    advantage: 'Pro visibility, better search ranking, profile highlights, priority features',
    badge: 'bg-gradient-to-r from-cyan-400 to-blue-500'
  };
  return { 
    level: 1, 
    name: 'Fresh Start', 
    color: 'text-gray-300', 
    bgColor: 'bg-gray-500/20', 
    borderColor: 'border-gray-500/40', 
    icon: '🌱', 
    advantage: 'Getting started - Complete your profile to level up',
    badge: 'bg-gradient-to-r from-gray-400 to-gray-500'
  };
};

const getNextLevelXP = (xp) => {
  const levels = [0, 400, 1000, 2000, 3500];
  const currentLevel = getJobHuntXPLevel(xp).level;
  return levels[currentLevel] || 3500;
};

const getXPProgress = (xp) => {
  const level = getJobHuntXPLevel(xp);
  if (level.level === 5) return 100;
  
  const levels = [0, 400, 1000, 2000, 3500];
  const currentLevelIndex = level.level - 1;
  const start = levels[currentLevelIndex];
  const next = levels[currentLevelIndex + 1];
  
  return Math.min(((xp - start) / (next - start)) * 100, 100);
};

// Achievement system
const ACHIEVEMENTS = {
  FIRST_APPLICATION: { name: 'First Application', icon: '📝', xp: 25 },
  PROFILE_COMPLETE: { name: 'Profile Complete', icon: '✅', xp: 50 },
  VIDEO_CV_UPLOAD: { name: 'Video CV Master', icon: '🎥', xp: 100 },
  DAILY_LOGIN_STREAK: { name: 'Daily Login Streak', icon: '🔥', xp: 10 },
  JOB_OFFER: { name: 'Job Offer Received', icon: '🎉', xp: 500 },
  LEVEL_3: { name: 'Career Champion', icon: '🏆', xp: 200 },
  LEVEL_5: { name: 'Legendary Status', icon: '👑', xp: 500 },
  REFERRAL: { name: 'Referral Master', icon: '🤝', xp: 50 },
  SKILL_ASSESSMENT: { name: 'Skill Validated', icon: '🏆', xp: 75 }
};

/** ===== APP CONTEXT ===== */
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

/** ===== PROVIDER ===== */
function AppProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userCredits, setUserCredits] = useState(100);
  const [userJobHuntXP, setUserJobHuntXP] = useState(0);
  const [userProfile, setUserProfile] = useState({});
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: 85000,
      description: 'Join our team to build amazing user experiences with React and modern web technologies.',
      tags: ['React', 'JavaScript', 'CSS', 'HTML'],
      jobType: 'Full-time',
      postedAt: '2024-01-15T10:00:00Z',
      applicants: []
    },
    {
      id: 2,
      title: 'Data Analyst',
      company: 'DataFlow Inc',
      location: 'Remote',
      salary: 65000,
      description: 'Help us analyze data and create insights that drive business decisions.',
      tags: ['Python', 'SQL', 'Excel', 'Data Visualization'],
      jobType: 'Full-time',
      postedAt: '2024-01-14T15:30:00Z',
      applicants: []
    },
    {
      id: 3,
      title: 'Marketing Assistant',
      company: 'Growth Marketing',
      location: 'New York, NY',
      salary: 55000,
      description: 'Support our marketing team with content creation, social media, and campaign management.',
      tags: ['Social Media', 'Content Creation', 'Marketing', 'Analytics'],
      jobType: 'Full-time',
      postedAt: '2024-01-13T09:15:00Z',
      applicants: []
    }
  ]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEmployerAuthModal, setShowEmployerAuthModal] = useState(false);
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [lastXPGain, setLastXPGain] = useState(0);

  const addJobHuntXP = (amount) => {
    setUserJobHuntXP(prev => prev + amount);
    setLastXPGain(amount);
    setShowXPNotification(true);
    setTimeout(() => setShowXPNotification(false), 3000);
  };

  const login = (email, password, type) => {
    // Simulate authentication
    setIsLoggedIn(true);
    setUserType(type);
    // Give new users 2 free credits (worth $600)
    setUserCredits(2);
    if (type === 'jobseeker') {
      addJobHuntXP(XP_ACTIONS.SIGNUP);
    }
    // Close the appropriate modal
    setShowAuthModal(false);
    setShowEmployerAuthModal(false);
    
    // Debug logging
    console.log('Login successful:', { type, credits: 2 });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setUserJobHuntXP(0);
    setUserProfile({});
    setUserCredits(100); // Reset credits
    // Clear localStorage
    localStorage.removeItem('zeroxp_user');
  };

  // Save user state to localStorage whenever it changes
  useEffect(() => {
    if (isLoggedIn) {
      // Small delay to ensure state is fully updated
      const timeoutId = setTimeout(() => {
        const userData = {
          isLoggedIn,
          userType,
          userCredits,
          userJobHuntXP,
          userProfile
        };
        localStorage.setItem('zeroxp_user', JSON.stringify(userData));
        console.log('Saving user data to localStorage:', userData);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      console.log('User not logged in, clearing localStorage');
    }
  }, [isLoggedIn, userType, userCredits, userJobHuntXP, userProfile]);

  // Restore user state from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('zeroxp_user');
    console.log('Checking localStorage for saved user:', savedUser);
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('Restoring user data:', userData);
        setIsLoggedIn(userData.isLoggedIn || false);
        setUserType(userData.userType || null);
        setUserCredits(userData.userCredits || 100);
        setUserJobHuntXP(userData.userJobHuntXP || 0);
        setUserProfile(userData.userProfile || {});
      } catch (error) {
        console.error('Error restoring user data:', error);
        localStorage.removeItem('zeroxp_user');
      }
    } else {
      console.log('No saved user data found in localStorage');
    }
  }, []);

  const postJob = (job) => {
    const newJob = {
      ...job,
      id: Date.now(),
      postedAt: new Date().toISOString(),
      applicants: []
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const value = {
    isLoggedIn,
    userType,
    userCredits,
    userJobHuntXP,
    userProfile,
    jobs,
    showAuthModal,
    setShowAuthModal,
    showEmployerAuthModal,
    setShowEmployerAuthModal,
    showXPNotification,
    lastXPGain,
    addJobHuntXP,
    login,
    logout,
    postJob,
    setUserProfile
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

/** ===== AUTH MODAL ===== */
function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, setShowEmployerAuthModal } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData.email, formData.password, 'jobseeker');
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowAuthModal(false);
      setIsClosing(false);
    }, 300);
  };

  if (!showAuthModal) return null;

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`} onClick={handleClose}>
      <div className={`bg-gray-900 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}`} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-white/30"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-white/30"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-cyan-300 hover:text-cyan-200 transition-colors text-sm"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-gray-400 text-sm mb-2">Are you an employer?</p>
            <button
              onClick={() => {
                setShowAuthModal(false);
                setShowEmployerAuthModal(true);
              }}
              className="text-purple-300 hover:text-purple-200 transition-colors text-sm"
            >
              Click here to sign in as an employer
            </button>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

/** ===== HEADER (neon theme) ===== */
function Header() {
  const { isLoggedIn, userType, userCredits, logout, setShowAuthModal, setShowEmployerAuthModal } = useApp();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  
  // Debug logging
  console.log('Header render:', { isLoggedIn, userType, isAccountMenuOpen });

  const handleLogin = (type) => {
    if (type === 'employer') {
      setShowEmployerAuthModal(true);
    } else {
      setShowAuthModal(true);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  };

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAccountMenuOpen && !event.target.closest('.account-menu')) {
        setIsAccountMenuOpen(false);
      }
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAccountMenuOpen, isMobileMenuOpen]);

  return (
    <header className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">ZXP</span>
            </div>
            <span className="text-white font-bold text-lg sm:text-xl">ZeroXP</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Navigation items moved to the right section for better organization */}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link to="/job-seeker-welcome" className="text-gray-300 hover:text-white transition-colors py-2">Welcome</Link>
                <Link to="/jobs" className="text-gray-300 hover:text-white transition-colors py-2">Jobs</Link>
                <div className="relative group">
                  <button className="text-gray-300 hover:text-white transition-colors py-2 flex items-center">
                    Guides
                    <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 bg-[#0b0e1a] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] z-50">
                    <Link to="/xp-guide" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-t-lg">
                      XP Guide
                    </Link>
                    <Link to="/guides" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-b-lg">
                      Career Advice
                    </Link>
                  </div>
                </div>
                <Link 
                  to="/post-job" 
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-orange-600 transition-all duration-300"
                >
                  Post a Job
                </Link>

                <button
                  onClick={() => handleLogin('jobseeker')}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
                >
                  Sign In
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                                  {userType === 'jobseeker' && (
                    <>
                      <Link to="/jobs" className="text-gray-300 hover:text-white transition-colors py-2">Jobs</Link>
                      <div className="relative group">
                        <button className="text-gray-300 hover:text-white transition-colors py-2 flex items-center">
                          Guides
                          <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform" />
                        </button>
                        <div className="absolute top-full left-0 bg-[#0b0e1a] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] z-50">
                          <Link to="/xp-guide" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-t-lg">
                            XP Guide
                          </Link>
                          <Link to="/guides" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-b-lg">
                            Career Advice
                          </Link>
                        </div>
                      </div>
                      <Link to="/my-xp" className="text-gray-300 hover:text-white transition-colors py-2">My XP</Link>
                    </>
                  )}
                {userType === 'employer' && (
                  <>
                    <Link to="/post-job" className="text-gray-300 hover:text-white transition-colors py-2">Post Job</Link>
                    <Link to="/employer-hub" className="text-gray-300 hover:text-white transition-colors py-2">Employer Hub</Link>
                    <Link to="/pricing" className="text-emerald-400 hover:text-emerald-300 transition-colors py-2">Pricing</Link>
                    <span className="text-emerald-300 text-sm px-2 py-1 bg-emerald-500/10 rounded">
                      Credits: {userCredits || 0}
                    </span>
                  </>
                )}
                <div className="relative account-menu">
                  <button 
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold border border-white/20 transition-all duration-300"
                  >
                    <span className="text-gray-400 text-sm px-2 py-1 bg-white/5 rounded">
                      {userType === 'jobseeker' ? 'Job Seeker' : 'Employer'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isAccountMenuOpen && (
                    <div className="absolute top-full right-0 bg-[#0b0e1a] border border-white/10 rounded-lg shadow-xl min-w-[200px] z-50">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-t-lg"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link 
                        to={userType === 'jobseeker' ? '/job-seeker-dashboard' : '/employer-dashboard'} 
                        className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      {userType === 'employer' && (
                        <Link 
                          to="/pricing" 
                          className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          Buy Credits
                        </Link>
                      )}
                      <div className="border-t border-white/10 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-b-lg"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center">
              <span className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
              <span className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 mobile-menu">
            <div className="flex flex-col space-y-2 pt-4">
              {!isLoggedIn ? (
                <>
                  <Link 
                    to="/job-seeker-welcome" 
                    className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Welcome
                  </Link>
                  <Link 
                    to="/jobs" 
                    className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Jobs
                  </Link>
                  <div className="px-4 py-2">
                    <div className="text-gray-300 font-medium mb-2">Guides</div>
                    <Link 
                      to="/xp-guide" 
                      className="block text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5 ml-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      XP Guide
                    </Link>
                    <Link 
                      to="/guides" 
                      className="block text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5 ml-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Career Advice
                    </Link>
                  </div>
                  <Link 
                    to="/post-job" 
                    className="bg-gradient-to-r from-green-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-orange-600 transition-all duration-300 text-left"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Post a Job
                  </Link>
                  <Link 
                    to="/pricing" 
                    className="text-emerald-400 hover:text-emerald-300 transition-colors py-2 px-4 rounded-lg hover:bg-white/5 text-left"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    View Pricing
                  </Link>
                  <button
                    onClick={() => handleLogin('jobseeker')}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 text-left"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  {userType === 'jobseeker' && (
                    <>
                      <Link 
                        to="/jobs" 
                        className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Jobs
                      </Link>
                      <div className="px-4 py-2">
                        <div className="text-gray-300 font-medium mb-2">Guides</div>
                        <Link 
                          to="/xp-guide" 
                          className="block text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5 ml-4"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          XP Guide
                        </Link>
                        <Link 
                          to="/guides" 
                          className="block text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5 ml-4"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Career Advice
                        </Link>
                      </div>
                      <Link 
                        to="/my-xp" 
                        className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My XP
                      </Link>
                    </>
                  )}
                  {userType === 'employer' && (
                    <>
                      <Link 
                        to="/post-job" 
                        className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Post Job
                      </Link>
                      <Link 
                        to="/employer-hub" 
                        className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Employer Hub
                      </Link>
                      <Link 
                        to="/pricing" 
                        className="text-emerald-400 hover:text-emerald-300 transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Pricing
                      </Link>
                      <span className="text-emerald-300 text-sm px-2 py-1 bg-emerald-500/10 rounded ml-4">
                        Credits: {userCredits || 0}
                      </span>
                    </>
                  )}
                  <div className="px-4 py-2">
                    <div className="text-gray-300 font-medium mb-2">Account</div>
                    <Link 
                      to="/profile" 
                      className="block text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5 ml-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to={userType === 'jobseeker' ? '/job-seeker-dashboard' : '/employer-dashboard'} 
                      className="block text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5 ml-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    {userType === 'employer' && (
                      <Link 
                        to="/pricing" 
                        className="block text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5 ml-4"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Buy Credits
                      </Link>
                    )}
                    <div className="border-t border-white/10 my-2 ml-4"></div>
                    <button
                      onClick={handleLogout}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold border border-white/20 transition-all duration-300 text-left ml-4"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/** ===== XP TOAST (neon) ===== */
function XPToast() {
  const { showXPNotification, lastXPGain, userJobHuntXP } = useApp();
  const level = getJobHuntXPLevel(userJobHuntXP);
  const progress = getXPProgress(userJobHuntXP);
  const nextLevelXP = getNextLevelXP(userJobHuntXP);

  if (!showXPNotification) return null;

  return (
    <div className="fixed top-24 right-6 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-emerald-500/90 to-cyan-500/90 backdrop-blur-xl text-white px-6 py-4 rounded-xl border border-emerald-400/50 shadow-neon">
        <div className="flex items-center space-x-3 mb-2">
          <Zap className="h-6 w-6 text-yellow-300" />
          <span className="font-bold text-lg">+{lastXPGain} XP!</span>
          <TrendingUp className="h-5 w-5 text-emerald-300" />
          </div>

        {/* Level Progress */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Level {level.level} Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className={`${level.badge} h-2 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
          </div>
        </div>
        
        {/* Next Level Info */}
        {level.level < 5 && (
          <div className="text-xs text-gray-200">
            {nextLevelXP - userJobHuntXP} XP to Level {level.level + 1}
          </div>
        )}
        
        {/* Level Up Notification */}
        {progress >= 100 && level.level < 5 && (
          <div className="mt-2 p-2 bg-yellow-500/20 rounded-lg border border-yellow-400/50">
            <div className="flex items-center gap-2">
              <span className="text-yellow-300">🎉</span>
              <span className="text-yellow-300 font-semibold text-sm">Level Up!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** ===== PAGES (with stronger glow) ===== */
function Home() {
  const { isLoggedIn, userType } = useApp();
  const navigate = useNavigate();
  const [heroRef, heroVisible] = useScrollAnimation();
  const [featuresRef, featuresVisible] = useScrollAnimation();

  return (
    <div className="px-4 sm:px-6 py-12 sm:py-24 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div ref={heroRef} className={`text-center mb-12 sm:mb-16 ${heroVisible ? 'animate-on-scroll animate-in' : 'animate-on-scroll'}`}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            ZeroXP
          </span>
          <br />
          <span className="text-white">Job Hunt</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
          The gamified job platform where your dedication to finding work pays off. 
          Build XP, stand out to employers, and land your dream job.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <button
            onClick={() => navigate('/job-seeker-welcome')}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Start Your Journey
          </button>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-white/10 hover:bg-white/20 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold border border-white/20 transition-all duration-300"
          >
            Browse Jobs
          </button>
        </div>
      </div>

      {/* Features */}
      <div ref={featuresRef} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 ${featuresVisible ? 'animate-on-scroll-scale animate-in' : 'animate-on-scroll-scale'}`}>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl">🎯</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Build XP</h3>
          <p className="text-gray-300 text-sm sm:text-base">Earn experience points through job applications and activities</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl">⭐</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Stand Out</h3>
          <p className="text-gray-300 text-sm sm:text-base">Higher XP means priority visibility to employers</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl">🚀</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Land Jobs</h3>
          <p className="text-gray-300 text-sm sm:text-base">Connect with employers who value dedication and persistence</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-emerald-300 font-bold text-sm sm:text-base">1</span>
            </div>
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Apply to Jobs</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Submit applications and earn XP for each one</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-cyan-300 font-bold text-sm sm:text-base">2</span>
            </div>
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Build Your Profile</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Add skills, experience, and video CVs for bonus XP</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-300 font-bold text-sm sm:text-base">3</span>
            </div>
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Get Noticed</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Employers see your dedication and prioritize your applications</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Jobs() {
  const { jobs, isLoggedIn, userType, userJobHuntXP } = useApp();
  const [filters, setFilters] = useState({
    salary: '',
    location: '',
    jobType: '',
    skills: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [headerRef, headerVisible] = useScrollAnimation();
  const [jobsRef, jobsVisible] = useScrollAnimation();

  // Get all unique skills from jobs
  const allSkills = [...new Set(jobs.flatMap(job => job.tags))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSalary = !filters.salary || job.salary >= parseInt(filters.salary);
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesJobType = !filters.jobType || job.jobType === filters.jobType;
    const matchesSkills = filters.skills.length === 0 || 
                         filters.skills.some(skill => job.tags.includes(skill));

    return matchesSearch && matchesSalary && matchesLocation && matchesJobType && matchesSkills;
  });

  const clearFilters = () => {
    setFilters({
      salary: '',
      location: '',
      jobType: '',
      skills: []
    });
  };

  return (
    <div className="px-4 sm:px-6 py-12 sm:py-24 max-w-7xl mx-auto">
      {/* Header */}
      <div ref={headerRef} className={`mb-6 sm:mb-8 ${headerVisible ? 'animate-on-scroll animate-in' : 'animate-on-scroll'}`}>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Find Your Next Job</h1>
        <p className="text-gray-300 text-sm sm:text-base">Browse opportunities and apply to build your XP</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search jobs, companies, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-white/30"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all duration-300"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {showFilters && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Min Salary</label>
                <select
                  value={filters.salary}
                  onChange={(e) => setFilters(prev => ({ ...prev, salary: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-white/30 appearance-none h-[42px]"
                >
                  <option value="">Any Salary</option>
                  <option value="30000">$30k+</option>
                  <option value="50000">$50k+</option>
                  <option value="70000">$70k+</option>
                  <option value="90000">$90k+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="City, State, or Remote"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-white/30 h-[42px]"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-white/30 appearance-none h-[42px]"
                >
                  <option value="">Any Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                {allSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        skills: prev.skills.includes(skill)
                          ? prev.skills.filter(s => s !== skill)
                          : [...prev.skills, skill]
                      }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                      filters.skills.includes(skill)
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <button
                onClick={clearFilters}
                className="text-cyan-300 hover:text-cyan-200 transition-colors text-sm"
              >
                Clear All Filters
              </button>
              <span className="text-gray-400 text-sm">
                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters */}
      {(filters.salary || filters.location || filters.jobType || filters.skills.length > 0) && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.salary && (
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">
                ${parseInt(filters.salary).toLocaleString()}+
              </span>
            )}
            {filters.location && (
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {filters.location}
              </span>
            )}
            {filters.jobType && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
                {filters.jobType}
              </span>
            )}
            {filters.skills.map(skill => (
              <span key={skill} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Job Cards */}
      <div ref={jobsRef} className={`space-y-6 ${jobsVisible ? 'animate-on-scroll-scale animate-in' : 'animate-on-scroll-scale'}`}>
        {filteredJobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No jobs found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function JobCard({ job }) {
  const { isLoggedIn, userJobHuntXP, userType } = useApp();
  const priority = getApplicationPriority(userJobHuntXP);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{job.title}</h3>
          <p className="text-gray-300 mb-2">{job.company}</p>
          <p className="text-gray-400 text-sm">{job.location}</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xl sm:text-2xl font-bold text-emerald-400">${job.salary}</div>
          <div className="text-sm text-gray-400">per year</div>
        </div>
      </div>
      
      <p className="text-gray-300 mb-4 text-sm sm:text-base">{job.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {job.tags.map((tag, index) => (
          <span key={index} className="px-2 sm:px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs sm:text-sm border border-cyan-500/30">
            {tag}
          </span>
        ))}
      </div>

      {isLoggedIn && userType === 'jobseeker' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => {
              // Implement job application logic
              alert(`Applied to ${job.title} at ${job.company}!`);
            }}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow-neon text-sm sm:text-base"
          >
            Apply Now
          </button>
          
          {/* Priority Status */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${priority.color} ${priority.priority === 'legendary' ? 'bg-yellow-500/20 border-yellow-500/40' : priority.priority === 'elite' ? 'bg-purple-500/20 border-purple-500/40' : priority.priority === 'champion' ? 'bg-pink-500/20 border-pink-500/40' : priority.priority === 'pro' ? 'bg-cyan-500/20 border-cyan-500/40' : 'bg-gray-500/20 border-gray-500/40'}`}>
            <span className="text-sm">{priority.icon}</span>
            <span className="text-xs font-medium">{priority.description}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function XPGuide() {
  const { isLoggedIn, userJobHuntXP, userType } = useApp();
  const careerLevel = getCareerLevel(userJobHuntXP);
  const currentSeason = getCurrentSeason();
  const [headerRef, headerVisible] = useScrollAnimation();
  const [progressRef, progressVisible] = useScrollAnimation();
  const [actionsRef, actionsVisible] = useScrollAnimation();
  const [xpRef, xpVisible] = useScrollAnimation();

  // Hide XP content for employers
  if (isLoggedIn && userType === 'employer') {
    return (
      <div className="px-4 sm:px-6 py-12 sm:py-24 max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div ref={headerRef} className={`text-center ${headerVisible ? 'animate-on-scroll animate-in' : 'animate-on-scroll'}`}>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 sm:mb-6">Employer <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Dashboard</span></h1>
          <p className="text-gray-300 text-sm sm:text-base">Manage your job postings and review applications</p>
        </div>
        
        <div ref={actionsRef} className={`bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-6 sm:p-8 ${actionsVisible ? 'animate-on-scroll-scale animate-in' : 'animate-on-scroll-scale'}`}>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Post a Job</h3>
              <p className="text-gray-300 mb-4 text-sm sm:text-base">Create and publish new job opportunities</p>
              <button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 text-sm sm:text-base">
                Post Job
              </button>
            </div>
            <div className="bg-white/5 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Review Applications</h3>
              <p className="text-gray-300 mb-4 text-sm sm:text-base">View and manage job applications</p>
              <button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 text-sm sm:text-base">
                View Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-12 sm:py-24 max-w-7xl mx-auto space-y-8 sm:space-y-12">
      <div ref={headerRef} className={`text-center ${headerVisible ? 'animate-on-scroll animate-in' : 'animate-on-scroll'}`}>
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 sm:mb-6">Career <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Progression</span></h1>
        <p className="text-gray-300 text-sm sm:text-base">Your XP shows how active you are in the job hunt. Higher XP = more engaged job seeker</p>
      </div>

      {/* Career Progress */}
      {isLoggedIn && (
        <div ref={progressRef} className={`bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-8 ${progressVisible ? 'animate-on-scroll-scale animate-in' : 'animate-on-scroll-scale'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Career Progress</h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{careerLevel.tier}</div>
              <div className="text-sm text-gray-300">Tier</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>{userJobHuntXP} XP</span>
              <span>{careerLevel.nextTier ? `${careerLevel.nextTier.xpRequired} XP to next tier` : 'Max tier reached'}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${careerLevel.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* XP Actions */}
      <div ref={xpRef} className={`space-y-8 ${xpVisible ? 'animate-on-scroll-left animate-in' : 'animate-on-scroll-left'}`}>
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">Build Your Job Hunt XP</h2>
          <p className="text-gray-300 mb-8">The higher your XP, the more visible you become to employers. Here's how to earn it:</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Job Search</h3>
            <div className="space-y-3">
              <XPRow title="Apply to job" xp={`+${XP_ACTIONS.APPLY_TO_JOB} XP`} />
              <XPRow title="Get interview invite" xp={`+${XP_ACTIONS.GET_INTERVIEW_INVITE} XP`} />
              <XPRow title="Complete interview" xp={`+${XP_ACTIONS.COMPLETE_INTERVIEW} XP`} />
              <XPRow title="Receive job offer" xp={`+${XP_ACTIONS.RECEIVE_JOB_OFFER} XP`} />
              <XPRow title="Accept job offer" xp={`+${XP_ACTIONS.ACCEPT_JOB_OFFER} XP`} highlight />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Development</h3>
            <div className="space-y-3">
              <XPRow title="Complete profile" xp={`+${XP_ACTIONS.COMPLETE_PROFILE} XP`} />
              <XPRow title="Upload resume" xp={`+${XP_ACTIONS.UPLOAD_RESUME} XP`} />
              <XPRow title="Upload video CV" xp={`+${XP_ACTIONS.UPLOAD_VIDEO_CV} XP`} highlight />
              <XPRow title="Complete skill assessment" xp={`+${XP_ACTIONS.COMPLETE_SKILL_ASSESSMENT} XP`} />
              <XPRow title="Complete course" xp={`+${XP_ACTIONS.COMPLETE_COURSE} XP`} />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Networking</h3>
            <div className="space-y-3">
              <XPRow title="Daily login" xp={`+${XP_ACTIONS.DAILY_LOGIN} XP`} />
              <XPRow title="Refer friend" xp={`+${XP_ACTIONS.REFER_FRIEND} XP`} />
              <XPRow title="Attend webinar" xp={`+${XP_ACTIONS.ATTEND_WEBINAR} XP`} />
              <XPRow title="Write review" xp={`+${XP_ACTIONS.WRITE_REVIEW} XP`} />
              <XPRow title="Share job" xp={`+${XP_ACTIONS.SHARE_JOB} XP`} />
            </div>
          </div>
        </div>
      </div>

      {/* About Your XP */}
      <div className={`bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-8 ${xpVisible ? 'animate-on-scroll-right animate-in' : 'animate-on-scroll-right'}`}>
        <h2 className="text-3xl font-bold text-white mb-6 text-center">About Your XP</h2>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-300 text-lg leading-relaxed">
            No work experience? No problem. Build your Job Hunt XP to show companies how serious you are about getting a job. 
            The higher your XP, the more employers will notice your dedication and activity level.
          </p>
        </div>
      </div>
    </div>
  );
}

function XPRow({ title, xp, highlight }) {
  return (
    <div className={`flex justify-between items-center rounded-lg p-4 ${highlight ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 shadow-neon' : 'bg-white/5 shadow-accent'}`}>
      <span className="font-medium text-white">{title}</span>
      <span className="font-semibold text-emerald-300">{xp}</span>
    </div>
  );
}

function Profile() {
  const { userType } = useApp();

  // Render different profile types based on user type
  if (userType === 'employer') {
    return <EmployerProfile />;
  } else {
    return <JobSeekerProfile />;
  }
}

function JobSeekerProfile() {
  const { userProfile, setUserProfile, addJobHuntXP } = useApp();
  const [awarded, setAwarded] = useState(false);
  const [videoCV, setVideoCV] = useState(null);
  const [showVideoUpload, setShowVideoUpload] = useState(false);

  const handleChange = (e) => setUserProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const completion = useMemo(() => {
    const required = ['firstName', 'lastName', 'email'];
    const filled = required.filter(field => userProfile[field]?.trim()).length;
    return Math.round((filled / required.length) * 100);
  }, [userProfile]);

  useEffect(() => {
    if (!awarded && completion >= 100) {
      setAwarded(true);
      addJobHuntXP(XP_ACTIONS.COMPLETE_PROFILE);
    }
  }, [completion, awarded, addJobHuntXP]);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoCV(URL.createObjectURL(file));
      addJobHuntXP(50); // Bonus XP for video CV
    }
  };

  return (
    <div className="px-6 py-24 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2">Professional Profile</h1>
        <p className="text-gray-300">Build your professional presence and stand out to employers</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {userProfile.firstName} {userProfile.lastName}
            </h2>
            <p className="text-gray-300 mb-2">{userProfile.title || 'Job Seeker'}</p>
            <p className="text-gray-400 mb-4">{userProfile.location}</p>
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30">
                {completion}% Complete
              </div>
              <div className="text-gray-300 text-sm">
                {userProfile.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video CV Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Video CV</h3>
        {videoCV ? (
          <div className="space-y-4">
            <video controls className="w-full max-w-md rounded-lg">
              <source src={videoCV} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
                  <button
              onClick={() => setShowVideoUpload(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
            >
              Replace Video
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
            <p className="text-gray-300 mb-4">Add a video introduction to stand out</p>
              <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="bg-gradient-to-r from-cyan-600 to-purple-700 hover:from-cyan-500 hover:to-purple-600 text-white px-6 py-2 rounded-lg cursor-pointer"
            >
              Upload Video CV
            </label>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-bold text-white mb-6">Basic Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-semibold mb-2">First Name *</label>
            <input
              name="firstName"
              value={userProfile.firstName || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
              placeholder="Your first name"
            />
              </div>
          <div>
            <label className="block text-white font-semibold mb-2">Last Name *</label>
            <input
              name="lastName"
              value={userProfile.lastName || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
              placeholder="Your last name"
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Email *</label>
            <input
              name="email"
              type="email"
              value={userProfile.email || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Professional Title</label>
            <input
              name="title"
              value={userProfile.title || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
              placeholder="e.g., Frontend Developer"
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Location</label>
            <input
              name="location"
              value={userProfile.location || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
              placeholder="City, State"
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Phone</label>
            <input
              name="phone"
              value={userProfile.phone || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-bold text-white mb-6">About</h3>
        <textarea
          name="summary"
          value={userProfile.summary || ''}
          onChange={handleChange}
          className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 min-h-[120px]"
          placeholder="Write a compelling professional summary that highlights your key strengths, career goals, and what makes you unique..."
        />
      </div>

      {/* Experience Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-bold text-white mb-6">Experience</h3>
        <textarea
          name="experience"
          value={userProfile.experience || ''}
          onChange={handleChange}
          className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 min-h-[120px]"
          placeholder="List your relevant work experience, internships, or projects. Include company names, roles, dates, and key achievements..."
        />
      </div>

      {/* Education Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-bold text-white mb-6">Education</h3>
        <textarea
          name="education"
          value={userProfile.education || ''}
          onChange={handleChange}
          className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 min-h-[100px]"
          placeholder="List your educational background, degrees, certifications, and relevant coursework..."
        />
      </div>

      {/* Skills Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-bold text-white mb-6">Skills</h3>
        <textarea
          name="skills"
          value={userProfile.skills || ''}
          onChange={handleChange}
          className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 min-h-[100px]"
          placeholder="List your technical skills, programming languages, tools, and soft skills..."
        />
      </div>

      {/* Links Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Professional Links</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-semibold mb-2">LinkedIn URL</label>
            <input
              name="linkedinUrl"
              value={userProfile.linkedinUrl || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Portfolio URL</label>
            <input
              name="portfolioUrl"
              value={userProfile.portfolioUrl || ''}
              onChange={handleChange}
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployerProfile() {
  const { userProfile, setUserProfile } = useApp();
  const [companyData, setCompanyData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    hiringNeeds: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleChange = (e) => setUserProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCompanyChange = (e) => setCompanyData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const completion = useMemo(() => {
    const requiredFields = ['firstName', 'lastName', 'email'];
    const companyRequired = ['companyName', 'industry', 'contactEmail'];
    const allRequired = [...requiredFields, ...companyRequired];
    const filled = allRequired.filter(field => {
      const value = field.includes('company') ? companyData[field] : userProfile[field];
      return String(value || '').trim();
    }).length;
    return Math.round((filled / allRequired.length) * 100);
  }, [userProfile, companyData]);

  return (
    <div className="px-6 py-24 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white mb-2">Employer Profile</h1>
      <p className="text-gray-300 mb-8">Complete your company profile to start posting jobs and finding talent.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-neon">
          <h2 className="text-2xl font-bold text-white mb-4">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {['firstName','lastName','email','phone'].map((f) => (
              <div key={f}>
                <input 
                  name={f} 
                  value={userProfile[f] || ''} 
                  onChange={handleChange} 
                  placeholder={f}
                  className={`w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-0 ${['firstName', 'lastName', 'email'].includes(f) ? 'border-cyan-500/50' : ''}`}
                />
                {['firstName', 'lastName', 'email'].includes(f) && (
                  <span className="text-xs text-cyan-300 mt-1">Required</span>
                )}
              </div>
                ))}
              </div>
        </div>

        {/* Company Information */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-neon">
          <h2 className="text-2xl font-bold text-white mb-4">Company Information</h2>
          <div className="space-y-4">
            <input
              name="companyName"
              value={companyData.companyName}
              onChange={handleCompanyChange}
              placeholder="Company Name"
              className="w-full bg-transparent border border-cyan-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
            />
            <span className="text-xs text-cyan-300">Required</span>
            
              <select
              name="industry"
              value={companyData.industry}
              onChange={handleCompanyChange}
              className="w-full bg-transparent border border-cyan-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-0"
            >
              <option value="">Select Industry</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="consulting">Consulting</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="other">Other</option>
              </select>
            <span className="text-xs text-cyan-300">Required</span>

            <select
              name="companySize"
              value={companyData.companySize}
              onChange={handleCompanyChange}
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-0"
            >
              <option value="">Company Size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>

              <input
              name="website"
              value={companyData.website}
              onChange={handleCompanyChange}
              placeholder="Company Website"
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
            />

            <input
              name="contactEmail"
              value={companyData.contactEmail}
              onChange={handleCompanyChange}
              placeholder="Contact Email"
              className="w-full bg-transparent border border-cyan-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
            />
            <span className="text-xs text-cyan-300">Required</span>

            <input
              name="contactPhone"
              value={companyData.contactPhone}
              onChange={handleCompanyChange}
              placeholder="Contact Phone"
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Company Description */}
      <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-neon">
        <h2 className="text-2xl font-bold text-white mb-4">Company Details</h2>
        <textarea
          name="description"
          value={companyData.description}
          onChange={handleCompanyChange}
          placeholder="Describe your company culture, mission, and what makes you unique..."
          className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 min-h-[120px] focus:outline-none"
        />
        <textarea
          name="hiringNeeds"
          value={companyData.hiringNeeds}
          onChange={handleCompanyChange}
          placeholder="What types of roles are you typically hiring for? What skills are you looking for?"
          className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 min-h-[120px] focus:outline-none"
        />
      </div>

      {/* Progress Bar */}
      <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-neon">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Profile Completion</h3>
          <span className="text-cyan-300 font-medium">{completion}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-600 h-3 rounded-full shadow-neon" style={{ width: `${completion}%` }} />
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Complete your profile to unlock advanced hiring features and better candidate matching.
        </p>
      </div>
    </div>
  );
}

function Candidates() {
  // Organic-only: reads from localStorage (no sample data).
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('zeroxp_candidates') || '[]');
    setCandidates(stored);
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return candidates.filter(c =>
      !s ||
      c.name?.toLowerCase().includes(s) ||
      c.location?.toLowerCase().includes(s) ||
      c.skills?.toLowerCase().includes(s)
    );
  }, [candidates, search]);

  return (
    <div className="px-6 py-24 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white mb-2">Find Candidates</h1>
      <p className="text-gray-300 mb-8">Filter and rank job seekers by XP, skills, and availability.</p>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 max-w-xl shadow-neon">
        <div className="flex items-center">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by skill, name, or location..."
            className="flex-1 bg-transparent border-0 text-white placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-accent hover:shadow-neon transition-shadow">
            <div>
              <div className="text-xl font-bold">{c.name || 'Unnamed Candidate'}</div>
              <div className="text-gray-300 text-sm mt-1">{c.location || '—'} • {c.level ? `Level ${c.level}` : 'Level —'}</div>
              <div className="text-gray-300 text-sm mt-2">{c.skills || 'No skills listed'}</div>
            </div>
            <div className="space-x-2">
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/20">Message</button>
              <button className="bg-gradient-to-r from-cyan-600 to-purple-700 hover:from-cyan-500 hover:to-purple-600 text-white px-4 py-2 rounded-lg shadow-neon">Invite</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-gray-400">No candidates found. As job seekers join and earn XP, they'll appear here.</div>
        )}
      </div>
    </div>
  );
}

function PostJob() {
  const { userCredits, postJob } = useApp();
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'full-time',
    description: '',
    requirements: '',
    benefits: '',
    applicationInstructions: '',
    tags: []
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = () => {
    if (userCredits === undefined) {
      alert('You need to sign in as an employer to post a job.');
      nav('/employer-auth');
      return;
    }
    
    if (userCredits === 0) {
      alert('You need credits to post a job. You can start with 2 free credits or purchase more.');
      nav('/pricing');
      return;
    }
    
    const result = postJob(formData);
    if (result.error === 'NO_CREDITS') {
      alert('You need credits to post a job. Please purchase credits first.');
      nav('/pricing');
    } else {
      alert('Job posted successfully! 1 credit deducted.');
      nav('/jobs');
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Job title and company' },
    { number: 2, title: 'Details', description: 'Description and requirements' },
    { number: 3, title: 'Settings', description: 'Type, level, and benefits' },
    { number: 4, title: 'Review', description: 'Preview and submit' }
  ];

  return (
    <div className="px-6 py-24 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2">Post a Job</h1>
        <p className="text-gray-300">Reach motivated entry-level talent with your job posting</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.number)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 hover:scale-110 ${
                  currentStep >= step.number 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white cursor-pointer' 
                    : 'bg-white/10 text-gray-400 cursor-pointer hover:bg-white/20'
                }`}
              >
                {step.number}
              </button>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step.number ? 'bg-gradient-to-r from-cyan-500 to-purple-600' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map(step => (
            <button
              key={step.number}
              onClick={() => setCurrentStep(step.number)}
              className={`text-xs transition-colors cursor-pointer hover:text-cyan-300 ${
                currentStep >= step.number ? 'text-cyan-300' : 'text-gray-500'
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Credit Display - Only show after sign-in */}
      {userCredits !== undefined ? (
        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
          <div>
            <span className="text-emerald-300 font-semibold">Available Credits: {userCredits}</span>
            <span className="text-gray-300 text-sm block">1 credit per job post</span>
          </div>
          {userCredits === 0 && (
            <Link 
              to="/pricing" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Buy Credits
            </Link>
          )}
        </div>
        
        {userCredits === 0 && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-amber-400 text-lg">⚠️</div>
              <div>
                <p className="text-amber-300 font-semibold mb-2">No credits available</p>
                <p className="text-amber-200 text-sm mb-3">
                  You need credits to post a job. New employers get 2 free credits worth $600.
                </p>
                <Link 
                  to="/pricing" 
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  View Credit Packages
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      ) : (
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 mb-8">
          <div className="text-center">
            <div className="text-amber-400 text-2xl mb-3">🔐</div>
            <h3 className="text-amber-300 font-semibold mb-2">Sign in to continue</h3>
            <p className="text-amber-200 text-sm mb-4">
              You need to sign in as an employer to post a job and see your available credits.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/employer-auth'}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Sign In as Employer
              </button>
              <Link 
                to="/pricing" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      )}

      {!showPreview ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Job Title *</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
                    placeholder="e.g., Frontend Developer"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Company Name *</label>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
                    placeholder="e.g., TechCorp Inc."
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Location *</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Salary Range *</label>
                  <input
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
                    placeholder="e.g., $60,000 - $80,000"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Job Details</h2>
              <div>
                <label className="block text-white font-semibold mb-2">Job Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 min-h-[120px]"
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 min-h-[100px]"
                  placeholder="List the skills, experience, and qualifications needed..."
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Job Settings</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Job Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-white/30"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Benefits (Optional)</label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 min-h-[80px]"
                  placeholder="Health insurance, remote work, flexible hours..."
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Application Instructions (Optional)</label>
                <textarea
                  name="applicationInstructions"
                  value={formData.applicationInstructions}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 min-h-[80px]"
                  placeholder="How should candidates apply? Any specific instructions or requirements..."
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Skills/Tags</label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
                    placeholder="Add a skill (press Enter)"
                  />
                  <button
                    onClick={addTag}
                    className="bg-gradient-to-r from-cyan-600 to-purple-700 hover:from-cyan-500 hover:to-purple-600 text-white px-6 py-2 rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="bg-white/10 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Review & Submit</h2>
              
              {/* Quick Review Cards */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="text-cyan-300 font-semibold mb-2">Basic Info</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div><span className="text-gray-400">Title:</span> {formData.title || 'Not provided'}</div>
                    <div><span className="text-gray-400">Company:</span> {formData.company || 'Not provided'}</div>
                    <div><span className="text-gray-400">Location:</span> {formData.location || 'Not provided'}</div>
                    <div><span className="text-gray-400">Salary:</span> {formData.salary || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="text-emerald-300 font-semibold mb-2">Job Details</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div><span className="text-gray-400">Type:</span> {formData.type || 'Full Time'}</div>
                    <div><span className="text-gray-400">Skills:</span> {formData.tags.length || 0} tags</div>
                    <div><span className="text-gray-400">Description:</span> {formData.description ? '✓' : '✗'}</div>
                    <div><span className="text-gray-400">Requirements:</span> {formData.requirements ? '✓' : '✗'}</div>
                  </div>
                </div>
              </div>

              {/* Final Check */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Final Check</h4>
                <div className="text-gray-300 text-sm space-y-1">
                  <div>✓ All required fields completed</div>
                  <div>✓ Job description detailed</div>
                  <div>✓ Skills and requirements specified</div>
                  <div>✓ Ready for posting</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-4">
              {currentStep === 4 ? (
                <button
                  onClick={() => setShowPreview(true)}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  View Full Preview
                </button>
              ) : (
                <button
                  onClick={() => setShowPreview(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg"
                >
                  Preview
                </button>
              )}
              <button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={userCredits === undefined}
                className={`px-6 py-2 rounded-lg transition-all ${
                  userCredits === undefined 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cyan-600 to-purple-700 hover:from-cyan-500 hover:to-purple-600 text-white'
                }`}
              >
                {currentStep === 4 ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Job Preview - Review Everything</h2>
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-2xl font-semibold text-white">{formData.title || 'Job Title'}</h3>
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30">
                {formData.type || 'Full Time'}
              </span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-semibold">🏢</span>
                <span className="font-semibold text-cyan-300">{formData.company || 'Company Name'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-300">📍</span>
                <span>{formData.location || 'Location'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-300">💰</span>
                <span>{formData.salary || 'Salary Range'}</span>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Job Description */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-cyan-300">📝</span>
                Job Description
              </h4>
              <p className="text-gray-300 leading-relaxed">
                {formData.description || 'No description provided'}
              </p>
            </div>

            {/* Requirements */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-emerald-300">🎯</span>
                Requirements
              </h4>
              <p className="text-gray-300 leading-relaxed">
                {formData.requirements || 'No specific requirements listed'}
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-purple-300">🎁</span>
                Benefits
              </h4>
              <p className="text-gray-300 leading-relaxed">
                {formData.benefits || 'No benefits listed'}
              </p>
            </div>

            {/* Skills/Tags */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-orange-300">🔧</span>
                Skills & Technologies
              </h4>
              {formData.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm border border-cyan-500/30">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No skills or technologies specified</p>
              )}
            </div>

            {/* Application Instructions */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-yellow-300">📋</span>
                Application Instructions
              </h4>
              <p className="text-gray-300 leading-relaxed">
                {formData.applicationInstructions || 'Standard application process'}
              </p>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setShowPreview(false)}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg"
            >
              Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={userCredits === undefined}
              className={`px-8 py-2 rounded-lg transition-all ${
                userCredits === undefined 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-600 to-purple-700 hover:from-cyan-500 hover:to-purple-600 text-white'
              }`}
            >
              {userCredits === undefined ? 'Sign In Required' : 'Post Job (1 Credit)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Pricing() {
  return (
    <div className="px-6 py-24 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-white mb-6">Job Posting Credits</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Post jobs with our flexible credit system. Buy more credits, save more per job posting.
        </p>
      </div>

      {/* Free Credits Info */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-emerald-300 mb-4">Start with Free Credits</h2>
          <p className="text-gray-300 mb-4">
            New employers get <span className="text-emerald-300 font-semibold">2 free job postings</span> worth $600
          </p>
          <p className="text-gray-400 text-sm">
            Returning employers receive 1 free credit every 6 months
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {/* Starter Pack */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
            <div className="text-3xl font-bold text-cyan-300 mb-1">$300</div>
            <p className="text-gray-400 text-sm">1 credit</p>
            <p className="text-gray-500 text-xs">$300 per job</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-white text-sm">1 job posting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-white text-sm">30-day listing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-white text-sm">Basic support</span>
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-cyan-600 to-purple-700 hover:from-cyan-500 hover:to-purple-600 text-white py-3 rounded-lg font-semibold transition-all">
            Get Started
          </button>
        </div>

        {/* Growth Pack */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Popular
            </span>
          </div>
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Growth</h3>
            <div className="text-3xl font-bold text-cyan-300 mb-1">$1,199</div>
            <p className="text-gray-400 text-sm">5 credits</p>
            <p className="text-emerald-400 text-xs font-semibold">Save $301</p>
            <p className="text-gray-500 text-xs">$239 per job</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-white text-sm">5 job postings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-white text-sm">60-day listings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-white text-sm">Priority support</span>
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-cyan-600 to-purple-700 hover:from-cyan-500 hover:to-purple-600 text-white py-3 rounded-lg font-semibold transition-all">
            Choose Growth
          </button>
        </div>

        {/* Scale Pack */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Scale</h3>
            <div className="text-3xl font-bold text-purple-300 mb-1">$2,999</div>
            <p className="text-gray-400 text-sm">15 credits</p>
            <p className="text-emerald-400 text-xs font-semibold">Save $1,501</p>
            <p className="text-gray-500 text-xs">$199 per job</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-white text-sm">15 job postings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-white text-sm">90-day listings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-white text-sm">Advanced analytics</span>
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-purple-600 to-cyan-700 hover:from-purple-500 hover:to-cyan-600 text-white py-3 rounded-lg font-semibold transition-all">
            Choose Scale
          </button>
        </div>

        {/* Enterprise Pack */}
        <div className="bg-gradient-to-br from-purple-500/10 to-emerald-500/10 border border-purple-500/30 rounded-2xl p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
            <div className="text-3xl font-bold text-emerald-300 mb-1">$8,999</div>
            <p className="text-gray-400 text-sm">50 credits</p>
            <p className="text-emerald-400 text-xs font-semibold">Save $3,001</p>
            <p className="text-gray-500 text-xs">$179 per job</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-white text-sm">50 job postings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-white text-sm">120-day listings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-white text-sm">Dedicated support</span>
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-emerald-600 to-purple-700 hover:from-emerald-500 hover:to-purple-600 text-white py-3 rounded-lg font-semibold transition-all">
            Choose Enterprise
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">How Credits Work</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-cyan-300">1</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Buy Credits</h3>
            <p className="text-gray-400">Choose a credit package that fits your hiring needs</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-300">2</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Post Jobs</h3>
            <p className="text-gray-400">Use 1 credit per job posting - credits never expire</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-emerald-300">3</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Hire Talent</h3>
            <p className="text-gray-400">Access our pool of motivated entry-level candidates</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployerWelcome() {
  const nav = useNavigate();
  const { setShowAuthModal } = useApp();

  return (
    <div className="relative overflow-hidden">
      <div className="relative px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-8 cyber-text">
            Welcome, <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Employers</span>
          </h1>
          <p className="text-xl leading-8 text-gray-300 max-w-3xl mx-auto mb-12">
            Find motivated entry-level talent through our gamified platform. Post jobs, discover candidates, and build your team with ZeroXP.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-neon">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">Post Jobs</h3>
              <p className="text-gray-300 text-sm">Create compelling job listings that attract motivated entry-level candidates</p>
          </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-neon">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">Find Talent</h3>
              <p className="text-gray-300 text-sm">Discover candidates ranked by XP and motivation level</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-neon">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Hire Faster</h3>
              <p className="text-gray-300 text-sm">Connect with pre-vetted candidates ready to contribute</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg min-w-[200px] shadow-magenta cyber-border">
              Get Started
            </button>
            <button onClick={() => nav('/pricing')} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg border border-white/20 min-w-[200px] shadow-accent cyber-border">
              View Pricing
            </button>
        </div>
    </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose ZeroXP?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-neon">
            <h3 className="text-2xl font-bold text-white mb-4">🎮 Gamified Candidate Discovery</h3>
            <p className="text-gray-300 mb-4">
              Our unique XP system rewards candidates for taking action. Higher XP candidates are more motivated, 
              engaged, and likely to succeed in your organization.
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• XP-based candidate ranking</li>
              <li>• Pre-vetted motivated talent</li>
              <li>• Reduced hiring time</li>
            </ul>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-neon">
            <h3 className="text-2xl font-bold text-white mb-4">💼 Entry-Level Focus</h3>
            <p className="text-gray-300 mb-4">
              We specialize in entry-level positions, helping you find candidates who are eager to learn, 
              grow, and contribute to your company's success.
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• Entry-level specialists</li>
              <li>• Growth-minded candidates</li>
              <li>• Cultural fit focus</li>
            </ul>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-neon">
            <h3 className="text-2xl font-bold text-white mb-4">🚀 Simple & Effective</h3>
            <p className="text-gray-300 mb-4">
              Post jobs, browse candidates, and make connections. Our platform is designed to streamline 
              your hiring process without the complexity of traditional job boards.
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• Easy job posting</li>
              <li>• Direct candidate contact</li>
              <li>• No complex algorithms</li>
            </ul>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-neon">
            <h3 className="text-2xl font-bold text-white mb-4">💰 Transparent Pricing</h3>
            <p className="text-gray-300 mb-4">
              Simple credit-based system with no hidden fees. Pay for what you use and scale as you grow.
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• Credit-based pricing</li>
              <li>• No recurring fees</li>
              <li>• Flexible scaling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployerHub() {
  const { jobs, userType } = useApp();
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock applications data - in real app this would come from backend
  useEffect(() => {
    const mockApplications = [
      {
        id: 'app_1',
        jobId: 'job_1',
        candidateId: 'candidate_1',
        candidateName: 'Sarah Johnson',
        candidateEmail: 'sarah.johnson@email.com',
        candidateXP: 1250,
        candidateLevel: 4,
        candidateLocation: 'San Francisco, CA',
        candidateSkills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
        status: 'new',
        appliedAt: '2024-01-15T10:30:00Z',
        lastUpdated: '2024-01-16T14:20:00Z',
        notes: 'Strong XP level, excellent video CV',
        rating: 4.5,
        hasVideoCV: true,
        videoCVUrl: 'https://example.com/video1.mp4'
      },
      {
        id: 'app_2',
        jobId: 'job_1',
        candidateId: 'candidate_2',
        candidateName: 'Mike Chen',
        candidateEmail: 'mike.chen@email.com',
        candidateXP: 850,
        candidateLevel: 3,
        candidateLocation: 'New York, NY',
        candidateSkills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        status: 'reviewing',
        appliedAt: '2024-01-14T09:15:00Z',
        lastUpdated: '2024-01-16T11:45:00Z',
        notes: 'Good technical skills, needs to see more projects',
        rating: 3.8,
        hasVideoCV: false
      },
      {
        id: 'app_3',
        jobId: 'job_1',
        candidateId: 'candidate_3',
        candidateName: 'Emily Rodriguez',
        candidateEmail: 'emily.rodriguez@email.com',
        candidateXP: 2100,
        candidateLevel: 5,
        candidateLocation: 'Austin, TX',
        candidateSkills: ['Full Stack', 'React', 'Node.js', 'MongoDB', 'Docker'],
        status: 'interview',
        appliedAt: '2024-01-13T16:20:00Z',
        lastUpdated: '2024-01-16T15:30:00Z',
        notes: 'Top candidate - Career Champion level, excellent communication',
        rating: 4.9,
        hasVideoCV: true,
        videoCVUrl: 'https://example.com/video2.mp4'
      }
    ];
    setApplications(mockApplications);
  }, []);

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.candidateSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'reviewing': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'interview': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'hired': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getLevelInfo = (level) => {
    const levelData = {
      1: { name: 'Fresh Start', color: 'text-gray-300', icon: '🌱' },
      2: { name: 'Go-Getter', color: 'text-emerald-300', icon: '⭐' },
      3: { name: 'Job Hunter', color: 'text-cyan-300', icon: '🎯' },
      4: { name: 'Rising Pro', color: 'text-pink-300', icon: '🏆' },
      5: { name: 'Career Champion', color: 'text-purple-300', icon: '👑' }
    };
    return levelData[level] || levelData[1];
  };

  const updateApplicationStatus = (applicationId, newStatus) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId ? { ...app, status: newStatus, lastUpdated: new Date().toISOString() } : app
    ));
  };

  if (userType !== 'employer') {
    return (
      <div className="px-6 py-24 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-white mb-4">Access Denied</h1>
        <p className="text-gray-300">This page is only available to employers.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-24 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2">Employer Hub</h1>
        <p className="text-gray-300">Manage your job applications and find the best candidates</p>
      </div>

      {/* Job Selection */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Select Job</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <button
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedJob?.id === job.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <h3 className="font-semibold text-white mb-1">{job.title}</h3>
              <p className="text-gray-300 text-sm">{job.company}</p>
              <p className="text-gray-400 text-xs">{job.location}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedJob && (
        <>
          {/* Filters and Search */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border border-white/10 rounded-lg p-3 text-white"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="interview">Interview</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Applications List */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Applications List */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-white mb-4">Applications ({filteredApplications.length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredApplications.map(application => (
                  <div
                    key={application.id}
                    onClick={() => setSelectedApplication(application)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedApplication?.id === application.id
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{application.candidateName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{application.candidateLocation}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm ${getLevelInfo(application.candidateLevel).color}`}>
                        {getLevelInfo(application.candidateLevel).icon} Level {application.candidateLevel}
                      </span>
                      <span className="text-gray-400 text-sm">{application.candidateXP} XP</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {application.candidateSkills.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-white/10 text-gray-200 px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {application.candidateSkills.length > 3 && (
                        <span className="text-gray-400 text-xs">+{application.candidateSkills.length - 3} more</span>
                      )}
                    </div>
                    {application.hasVideoCV && (
                      <div className="mt-2 text-cyan-300 text-xs">📹 Video CV Available</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Application Detail */}
            <div className="lg:col-span-2">
              {selectedApplication ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedApplication.candidateName}</h2>
                      <p className="text-gray-300">{selectedApplication.candidateEmail}</p>
                      <p className="text-gray-400">{selectedApplication.candidateLocation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedApplication.status)}`}>
                        {selectedApplication.status}
                      </span>
                      <div className="text-right">
                        <div className={`text-sm ${getLevelInfo(selectedApplication.candidateLevel).color}`}>
                          {getLevelInfo(selectedApplication.candidateLevel).icon} {getLevelInfo(selectedApplication.candidateLevel).name}
                        </div>
                        <div className="text-gray-400 text-sm">{selectedApplication.candidateXP} XP</div>
                      </div>
                    </div>
                  </div>

                  {/* Video CV */}
                  {selectedApplication.hasVideoCV && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Video CV</h3>
                      <div className="bg-black/50 rounded-lg p-4">
                        <video controls className="w-full rounded">
                          <source src={selectedApplication.videoCVUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.candidateSkills.map(skill => (
                        <span key={skill} className="bg-white/10 text-gray-200 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                    <textarea
                      value={selectedApplication.notes}
                      onChange={(e) => {
                        setApplications(prev => prev.map(app => 
                          app.id === selectedApplication.id ? { ...app, notes: e.target.value } : app
                        ));
                      }}
                      className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 min-h-[100px]"
                      placeholder="Add notes about this candidate..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'reviewing')}
                      className="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/30"
                    >
                      Mark Reviewing
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'interview')}
                      className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg border border-purple-500/30 hover:bg-purple-500/30"
                    >
                      Schedule Interview
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'hired')}
                      className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30"
                    >
                      Hire
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                      className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/30"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                  <p className="text-gray-400">Select an application to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MyXP() {
  const { isLoggedIn, userJobHuntXP, userType } = useApp();
  const careerLevel = getJobHuntXPLevel(userJobHuntXP);
  const nextLevel = getNextLevelXP(userJobHuntXP);
  const progress = getXPProgress(userJobHuntXP);
  const [headerRef, headerVisible] = useScrollAnimation();
  const [levelRef, levelVisible] = useScrollAnimation();
  const [statsRef, statsVisible] = useScrollAnimation();
  const [activityRef, activityVisible] = useScrollAnimation();
  const [tipsRef, tipsVisible] = useScrollAnimation();

  if (!isLoggedIn || userType !== 'jobseeker') {
    return (
      <div className="px-6 py-24 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-4">My XP</h1>
        <p className="text-gray-300">Please sign in as a job seeker to view your XP progress.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-24 max-w-7xl mx-auto space-y-12">
      <div ref={headerRef} className={`text-center ${headerVisible ? 'animate-on-scroll animate-in' : 'animate-on-scroll'}`}>
        <h1 className="text-5xl font-extrabold mb-6">My <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Career XP</span></h1>
        <p className="text-gray-300">Track your job hunting progress and achievements</p>
      </div>

      {/* Current Level Card */}
      <div ref={levelRef} className={`bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-8 ${levelVisible ? 'animate-on-scroll-scale animate-in' : 'animate-on-scroll-scale'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{careerLevel.name}</h2>
            <p className="text-gray-300">{careerLevel.advantage}</p>
          </div>
          <div className={`w-16 h-16 ${careerLevel.badge} rounded-full flex items-center justify-center text-2xl`}>
            {careerLevel.icon}
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>{userJobHuntXP} XP</span>
            <span>{nextLevel} XP to next level</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* XP Stats Grid */}
      <div ref={statsRef} className={`grid md:grid-cols-3 gap-6 ${statsVisible ? 'animate-on-scroll animate-in' : 'animate-on-scroll'}`}>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Total XP</h3>
            <div className="text-2xl font-bold text-cyan-400">{userJobHuntXP}</div>
          </div>
          <p className="text-gray-300 text-sm">Your career progression points</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Current Level</h3>
            <div className="text-2xl font-bold text-purple-400">{careerLevel.level}</div>
          </div>
          <p className="text-gray-300 text-sm">Career tier achieved</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Next Level</h3>
            <div className="text-2xl font-bold text-emerald-400">{nextLevel - userJobHuntXP}</div>
          </div>
          <p className="text-gray-300 text-sm">XP needed to level up</p>
        </div>
      </div>

      {/* Recent XP Gains */}
      <div ref={activityRef} className={`bg-white/5 border border-white/10 rounded-xl p-6 ${activityVisible ? 'animate-on-scroll-left animate-in' : 'animate-on-scroll-left'}`}>
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <span className="text-cyan-300 text-sm">+35</span>
              </div>
              <span className="text-gray-300">Applied to job</span>
            </div>
            <span className="text-gray-400 text-sm">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-purple-300 text-sm">+5</span>
              </div>
              <span className="text-gray-300">Daily login</span>
            </div>
            <span className="text-gray-400 text-sm">1 day ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-emerald-300 text-sm">+50</span>
              </div>
              <span className="text-gray-300">Completed profile</span>
            </div>
            <span className="text-gray-400 text-sm">3 days ago</span>
          </div>
        </div>
      </div>

      {/* XP Tips */}
      <div ref={tipsRef} className={`bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6 ${tipsVisible ? 'animate-on-scroll-right animate-in' : 'animate-on-scroll-right'}`}>
        <h3 className="text-xl font-semibold text-white mb-4">💡 XP Tips</h3>
        <div className="space-y-3 text-gray-300">
          <p>• Apply to jobs regularly to earn consistent XP</p>
          <p>• Complete your profile to unlock bonus XP</p>
          <p>• Upload a video CV for a significant XP boost</p>
          <p>• Log in daily to maintain your streak</p>
        </div>
      </div>
    </div>
  );
}

function JobSeekerWelcome() {
  const { setShowAuthModal } = useApp();
  const nav = useNavigate();
  const [heroRef, heroVisible] = useScrollAnimation();
  const [problemRef, problemVisible] = useScrollAnimation();
  const [solutionRef, solutionVisible] = useScrollAnimation();
  const [timelineRef, timelineVisible] = useScrollAnimation();
  const [actionsRef, actionsVisible] = useScrollAnimation();
  const [resultsRef, resultsVisible] = useScrollAnimation();

  return (
    <div className="px-4 sm:px-6 py-12 sm:py-24 max-w-7xl mx-auto">
      <div ref={heroRef} className={`text-center mb-12 sm:mb-16 ${heroVisible ? 'animate-on-scroll animate-in' : 'animate-on-scroll'}`}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6">We Know the <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Struggle</span></h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
          Entry-level job hunting is tough. You're competing with hundreds of applicants, getting ghosted by recruiters, and feeling like your applications disappear into a black hole.
        </p>
      </div>

      {/* The Problem */}
      <div ref={problemRef} className={`bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6 sm:p-8 mb-12 sm:mb-16 ${problemVisible ? 'animate-on-scroll-left animate-in' : 'animate-on-scroll-left'}`}>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">The Entry-Level Reality</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-red-300 text-xl sm:text-2xl">×</span>
            </div>
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Ghosted Applications</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Your resume gets lost in the pile, never to be seen again</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-orange-300 text-xl sm:text-2xl">!</span>
            </div>
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">"Experience Required"</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Every entry-level job wants 3+ years of experience</p>
          </div>
          <div className="text-center sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-yellow-300 text-xl sm:text-2xl">#</span>
            </div>
            <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Endless Competition</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Hundreds of applicants for every position</p>
          </div>
        </div>
      </div>

      {/* The Solution */}
      <div ref={solutionRef} className={`text-center mb-12 sm:mb-16 ${solutionVisible ? 'animate-on-scroll animate-in' : 'animate-on-scroll'}`}>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Here's How We <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Fix It</span></h2>
        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
          ZeroXP turns your job search into a game where your dedication becomes your advantage. The more you apply, the more visible you become to employers.
        </p>
      </div>

      {/* How It Works */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 ${solutionVisible ? 'animate-on-scroll-scale animate-in' : 'animate-on-scroll-scale'}`}>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl">+</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Apply & Build XP</h3>
          <p className="text-gray-300 text-sm sm:text-base">Every application earns you XP. No more feeling like your efforts go unnoticed.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl">↑</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Rise Above the Crowd</h3>
          <p className="text-gray-300 text-sm sm:text-base">Higher XP puts your applications at the top of employer searches.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl">→</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Get Noticed Faster</h3>
          <p className="text-gray-300 text-sm sm:text-base">Employers see your dedication through your XP. Stand out from the competition.</p>
        </div>
      </div>

      {/* XP System Preview */}
      <div ref={timelineRef} className={`bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-8 mb-16 ${timelineVisible ? 'animate-on-scroll-right animate-in' : 'animate-on-scroll-right'}`}>
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Your Career Timeline</h2>
        <div className="relative">
          {/* Horizontal Timeline Line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-600"></div>
          
          {/* Timeline Items */}
          <div className="grid grid-cols-5 gap-4 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center border-2 border-gray-500/40 mx-auto mb-4 relative z-10">
                <span className="text-gray-300 text-lg">•</span>
              </div>
              <h4 className="text-white font-bold text-sm mb-2">Starting Out</h4>
              <p className="text-gray-200 text-xs mb-1">0 XP</p>
              <p className="text-gray-300 text-xs mb-2">Begin your journey</p>
              <p className="text-gray-300 text-xs leading-relaxed">Complete your profile and make your first application to start earning XP</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center border-2 border-cyan-500/40 mx-auto mb-4 relative z-10">
                <span className="text-cyan-300 text-lg">•</span>
              </div>
              <h4 className="text-white font-bold text-sm mb-2">Getting Noticed</h4>
              <p className="text-cyan-200 text-xs mb-1">400 XP</p>
              <p className="text-cyan-300 text-xs mb-2">Rising above crowd</p>
              <p className="text-gray-300 text-xs leading-relaxed">Your applications start appearing higher in employer searches</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center border-2 border-pink-500/40 mx-auto mb-4 relative z-10">
                <span className="text-pink-300 text-lg">•</span>
              </div>
              <h4 className="text-white font-bold text-sm mb-2">Standing Out</h4>
              <p className="text-pink-200 text-xs mb-1">1000 XP</p>
              <p className="text-pink-300 text-xs mb-2">Champion status</p>
              <p className="text-gray-300 text-xs leading-relaxed">Priority placement and enhanced visibility to employers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center border-2 border-purple-500/40 mx-auto mb-4 relative z-10">
                <span className="text-purple-300 text-lg">•</span>
              </div>
              <h4 className="text-white font-bold text-sm mb-2">Elite Status</h4>
              <p className="text-purple-200 text-xs mb-1">2000 XP</p>
              <p className="text-purple-300 text-xs mb-2">Professional recognition</p>
              <p className="text-gray-300 text-xs leading-relaxed">Top-tier visibility and exclusive employer features</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500/40 mx-auto mb-4 relative z-10">
                <span className="text-yellow-300 text-lg">•</span>
              </div>
              <h4 className="text-white font-bold text-sm mb-2">Top Priority</h4>
              <p className="text-yellow-200 text-xs mb-1">3500 XP</p>
              <p className="text-yellow-300 text-xs mb-2">Legendary status</p>
              <p className="text-gray-300 text-xs leading-relaxed">Maximum visibility and priority support from employers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div ref={actionsRef} className={`grid md:grid-cols-2 gap-8 mb-16 ${actionsVisible ? 'animate-on-scroll-scale animate-in' : 'animate-on-scroll-scale'}`}>
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Break Through?</h3>
          <p className="text-gray-300 mb-6">
            Stop feeling invisible. Start building your XP and get the attention you deserve from employers.
          </p>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
          >
            Start Your Journey
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">See What's Out There</h3>
          <p className="text-gray-300 mb-6">
            Browse available jobs and see the opportunities waiting for you. You can always sign up later to start earning XP.
          </p>
          <button 
            onClick={() => nav('/jobs')}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold border border-white/20 transition-all duration-300"
          >
            Browse Jobs
          </button>
        </div>
      </div>

      {/* Success Stories */}
      <div ref={resultsRef} className={`bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-8 ${resultsVisible ? 'animate-on-scroll-left animate-in' : 'animate-on-scroll-left'}`}>
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Real Results</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center mt-1">
                <span className="text-emerald-300 text-xs">✓</span>
              </div>
              <div>
                <h4 className="text-white font-semibold">No More Ghosting</h4>
                <p className="text-gray-300 text-sm">Your XP shows employers you're serious and active</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mt-1">
                <span className="text-cyan-300 text-xs">✓</span>
              </div>
              <div>
                <h4 className="text-white font-semibold">Priority Placement</h4>
                <p className="text-gray-300 text-sm">Higher XP users appear first in employer searches</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-1">
                <span className="text-purple-300 text-xs">✓</span>
              </div>
              <div>
                <h4 className="text-white font-semibold">Track Your Progress</h4>
                <p className="text-gray-300 text-sm">See your growth and stay motivated</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center mt-1">
                <span className="text-pink-300 text-xs">✓</span>
              </div>
              <div>
                <h4 className="text-white font-semibold">Build Confidence</h4>
                <p className="text-gray-300 text-sm">Turn job hunting anxiety into achievement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ===== GUIDES PAGE ===== */
function Guides() {
  const navigate = useNavigate();
  
  const careerArticles = [
    {
      title: "The Numbers Game: Why Applying to More Jobs Increases Your Success",
      excerpt: "Learn why quantity often beats quality in job hunting and how to apply efficiently without sacrificing quality.",
      category: "Job Search Strategy",
      readTime: "5 min read",
      featured: true
    },
    {
      title: "How to Write a Resume That Gets Past ATS Systems",
      excerpt: "Master the art of creating resumes that both human recruiters and AI systems will love.",
      category: "Resume Writing",
      readTime: "7 min read"
    },
    {
      title: "Interview Preparation: The Complete Guide",
      excerpt: "From research to follow-up, everything you need to ace your next interview.",
      category: "Interviewing",
      readTime: "8 min read"
    },
    {
      title: "Networking for Introverts: Building Connections Your Way",
      excerpt: "Effective networking strategies that don't require being the loudest person in the room.",
      category: "Networking",
      readTime: "6 min read"
    },
    {
      title: "Salary Negotiation: Getting What You're Worth",
      excerpt: "Proven techniques to negotiate better compensation without burning bridges.",
      category: "Career Growth",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0e1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Career Guides & Resources
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to level up your career, from understanding XP to mastering job search strategies
          </p>
        </div>

        {/* Featured Article - Numbers Game */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-cyan-500/20 rounded-xl p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-full mb-4">
                Featured Article
              </div>
              <h2 className="text-3xl font-bold mb-4">
                The Numbers Game: Why More Applications = More Success
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                In job hunting, quantity often beats quality. Learn why applying to more jobs increases your chances of landing the perfect role, and how to do it efficiently without sacrificing quality.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">85%</div>
                  <div className="text-sm text-gray-400">Success rate with 50+ applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">3x</div>
                  <div className="text-sm text-gray-400">More interviews with volume approach</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">2.5x</div>
                  <div className="text-sm text-gray-400">Faster job placement</div>
                </div>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all font-semibold">
                Read Full Article
              </button>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-center">The Numbers Don't Lie</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">1-10 applications</span>
                  <span className="text-red-400">15% success rate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">11-25 applications</span>
                  <span className="text-yellow-400">35% success rate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">26-50 applications</span>
                  <span className="text-green-400">65% success rate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">50+ applications</span>
                  <span className="text-cyan-400">85% success rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* XP Guide Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Understanding the XP System</h2>
            <p className="text-gray-300 mb-4">Learn how the XP system works and how to maximize your career growth</p>
            <button 
              onClick={() => navigate('/xp-guide')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all font-semibold"
            >
              <Zap className="w-5 h-5 mr-2" />
              View Full XP Guide
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => navigate('/xp-guide')}>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">How XP Works</h3>
              <p className="text-gray-300 mb-4">
                Earn XP through various career-building activities. The more you engage, the faster you level up and get priority visibility to employers.
              </p>
              <div className="text-sm text-cyan-400">
                • Sign up: +25 XP<br/>
                • Apply to jobs: +35 XP<br/>
                • Complete profile: +50 XP<br/>
                • Upload video CV: +200 XP
              </div>
              <div className="mt-4 text-cyan-400 text-sm font-medium flex items-center">
                Click to learn more →
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all cursor-pointer" onClick={() => navigate('/xp-guide')}>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Leveling Up</h3>
              <p className="text-gray-300 mb-4">
                Progress through 5 career levels, each unlocking new opportunities and priority placement in employer searches.
              </p>
              <div className="text-sm text-purple-400">
                • Level 1: Basic visibility<br/>
                • Level 3: Priority placement<br/>
                • Level 5: Top-tier priority<br/>
                • Elite status benefits
              </div>
              <div className="mt-4 text-purple-400 text-sm font-medium flex items-center">
                Click to learn more →
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-green-500/30 transition-all cursor-pointer" onClick={() => navigate('/xp-guide')}>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Employer Benefits</h3>
              <p className="text-gray-300 mb-4">
                Higher XP candidates appear first in employer searches, giving you a competitive advantage in the job market.
              </p>
              <div className="text-sm text-green-400">
                • Level 1: Basic visibility<br/>
                • Level 3: Priority placement<br/>
                • Level 5: Top-tier priority<br/>
                • Elite status benefits
              </div>
              <div className="mt-4 text-green-400 text-sm font-medium flex items-center">
                Click to learn more →
              </div>
            </div>
          </div>
        </div>

        {/* Career Advice Articles */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">Career Advice & Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerArticles.slice(1).map((article, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded">
                    {article.category}
                  </span>
                  <span className="text-sm text-gray-400">{article.readTime}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{article.title}</h3>
                <p className="text-gray-300 mb-4">{article.excerpt}</p>
                <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  Read More →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-cyan-500/20 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Building XP?</h3>
            <p className="text-gray-300 mb-6">
              Apply to jobs, complete your profile, and start leveling up your career today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/jobs')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all font-semibold"
              >
                Browse Jobs
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all font-semibold"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ===== ROOT APP ===== */
export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen bg-cyber-gradient text-white" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
          <Header />
          <XPToast />
          <AuthModal />
          <EmployerAuthModal />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/xp-guide" element={<XPGuide />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/employer" element={<EmployerWelcome />} />
            <Route path="/employer-welcome" element={<EmployerWelcomePage />} />
            <Route path="/employer-hub" element={<EmployerHub />} />
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
            <Route path="/my-xp" element={<MyXP />} />
            <Route path="/job-seeker-welcome" element={<JobSeekerWelcome />} />
          </Routes>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}

// Scroll observer hook
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
}

function EmployerAuthModal() {
  const { showEmployerAuthModal, setShowEmployerAuthModal, login, setShowAuthModal } = useApp();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData.email, formData.password, 'employer');
    setTimeout(() => {
      navigate('/employer-welcome');
    }, 100);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowEmployerAuthModal(false);
      setIsClosing(false);
    }, 300);
  };

  if (!showEmployerAuthModal) return null;

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`} onClick={handleClose}>
      <div className={`bg-gray-900 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}`} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
          {isSignUp ? 'Create Employer Account' : 'Employer Sign In'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required={isSignUp}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-white/30"
                placeholder="Enter your company name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-white/30"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-white/30"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-cyan-300 hover:text-cyan-200 transition-colors text-sm"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-gray-400 text-sm mb-2">Are you a job seeker?</p>
            <button
              onClick={() => {
                setShowEmployerAuthModal(false);
                setShowAuthModal(true);
              }}
              className="text-cyan-300 hover:text-cyan-200 transition-colors text-sm"
            >
              Click here to sign in as a job seeker
            </button>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

function EmployerWelcomePage() {
  const { isLoggedIn, userType } = useApp();
  const nav = useNavigate();
  const [headerRef, headerVisible] = useScrollAnimation();
  const [featuresRef, featuresVisible] = useScrollAnimation();
  const [actionsRef, actionsVisible] = useScrollAnimation();

  // Redirect if not logged in as employer
  if (!isLoggedIn || userType !== 'employer') {
    return (
      <div className="px-6 py-24 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Employer Access</h1>
        <p className="text-gray-300">Please sign in as an employer to access this page.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-24 max-w-7xl mx-auto">
      <div ref={headerRef} className={`text-center mb-16 ${headerVisible ? 'animate-on-scroll animate-in' : 'animate-on-scroll'}`}>
        <h1 className="text-5xl font-extrabold mb-6">Welcome, <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Employer</span></h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Find the best talent with ZeroXP's gamified job platform. Post jobs, review applications, and hire faster.
            </p>
          </div>

      {/* Features */}
      <div ref={featuresRef} className={`grid md:grid-cols-3 gap-8 mb-16 ${featuresVisible ? 'animate-on-scroll-scale animate-in' : 'animate-on-scroll-scale'}`}>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📝</span>
        </div>
          <h3 className="text-xl font-semibold text-white mb-3">Post Jobs</h3>
          <p className="text-gray-300">Create detailed job postings that attract qualified candidates</p>
    </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">👥</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Review Applications</h3>
          <p className="text-gray-300">See candidates automatically ranked by XP - higher XP users appear first!</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🎯</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Hire Faster</h3>
          <p className="text-gray-300">Connect with motivated candidates who are actively job hunting</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div ref={actionsRef} className={`grid md:grid-cols-2 gap-8 mb-16 ${actionsVisible ? 'animate-on-scroll-scale animate-in' : 'animate-on-scroll-scale'}`}>
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Post Your First Job</h3>
          <p className="text-gray-300 mb-6">
            Create a job posting and start receiving applications from qualified candidates.
          </p>
          <button 
            onClick={() => nav('/post-job')}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
          >
            Post Job
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">View Applications</h3>
          <p className="text-gray-300 mb-6">
            Review and manage job applications from candidates with different XP levels.
          </p>
          <button 
            onClick={() => nav('/employer-dashboard')}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold border border-white/20 transition-all duration-300"
          >
            View Applications
          </button>
        </div>
      </div>

      {/* How XP Helps */}
      <div className={`bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-8 ${actionsVisible ? 'animate-on-scroll-left animate-in' : 'animate-on-scroll-left'}`}>
        <h2 className="text-3xl font-bold text-white mb-6 text-center">How XP Helps You Hire</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center mt-1">
                <span className="text-emerald-300 text-xs">✓</span>
              </div>
              <div>
                <h4 className="text-white font-semibold">Smart Sorting</h4>
                <p className="text-gray-300 text-sm">Higher XP candidates automatically appear first</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mt-1">
                <span className="text-cyan-300 text-xs">✓</span>
              </div>
              <div>
                <h4 className="text-white font-semibold">Quality Filter</h4>
                <p className="text-gray-300 text-sm">XP shows dedication and persistence</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-1">
                <span className="text-purple-300 text-xs">✓</span>
              </div>
              <div>
                <h4 className="text-white font-semibold">Faster Hiring</h4>
                <p className="text-gray-300 text-sm">Connect with motivated candidates quickly</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center mt-1">
                <span className="text-pink-300 text-xs">✓</span>
              </div>
              <div>
                <h4 className="text-white font-semibold">Better Matches</h4>
                <p className="text-gray-300 text-sm">Find candidates who fit your culture</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Employer Dashboard Component
const EmployerDashboard = () => {
  const { userProfile, isLoggedIn, userType } = useApp();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn && userType === 'employer' && userProfile?.id) {
      loadEmployerJobs();
    }
  }, [isLoggedIn, userType, userProfile]);

  const loadEmployerJobs = async () => {
    try {
      setLoading(true);
      const response = await employerAPI.getEmployerJobs(userProfile.id);
      setJobs(response);
    } catch (error) {
      setError('Failed to load jobs');
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobApplications = async (jobId) => {
    try {
      setLoading(true);
      const response = await employerAPI.getJobApplications(jobId, userProfile.id);
      setApplications(response.applications);
      setSelectedJob(response);
    } catch (error) {
      setError('Failed to load applications');
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicantId, newStatus) => {
    try {
      await employerAPI.updateApplicationStatus(selectedJob._id, applicantId, newStatus, userProfile.id);
      // Reload applications to get updated data
      await loadJobApplications(selectedJob._id);
    } catch (error) {
      setError('Failed to update application status');
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'reviewed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'declined': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'reviewed': return 'Under Review';
      case 'declined': return 'Declined';
      case 'accepted': return 'Accepted';
      default: return 'Unknown';
    }
  };

  if (!isLoggedIn || userType !== 'employer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4 sm:px-6 py-12 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">Access Denied</h1>
          <p className="text-lg sm:text-xl text-gray-300">Please sign in as an employer to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4 sm:px-6 py-12 sm:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">Employer Dashboard</h1>
          <p className="text-lg sm:text-xl text-gray-300">Manage your job postings and review applications</p>
          
          {/* Credit Status */}
          <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 max-w-2xl mx-auto mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-300 font-semibold">Available Credits: {userCredits || 0}</p>
                <p className="text-gray-400 text-sm">1 credit per job posting</p>
              </div>
              <Link 
                to="/pricing" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Buy Credits
              </Link>
            </div>
          </div>
          
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 max-w-2xl mx-auto">
            <p className="text-cyan-300 text-sm">
              💡 <strong>Smart Sorting:</strong> Applications are automatically sorted by XP - higher XP candidates appear first until you review or decline them!
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {/* Credit Management Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Recent Job Postings</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-400">Loading jobs...</div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">No job postings yet</div>
                  <Link 
                    to="/post-job" 
                    className="bg-gradient-to-r from-cyan-600 to-purple-700 hover:from-cyan-500 hover:to-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job) => (
                    <div key={job._id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">{job.title}</h3>
                          <p className="text-gray-400 text-sm">{job.company}</p>
                        </div>
                        <button
                          onClick={() => loadJobApplications(job._id)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          View Applications
                        </button>
                      </div>
                    </div>
                  ))}
                  {jobs.length > 3 && (
                    <div className="text-center pt-4">
                      <Link 
                        to="/employer-hub" 
                        className="text-cyan-400 hover:text-cyan-300 text-sm"
                      >
                        View all {jobs.length} jobs →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Credit Management</h2>
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-300 mb-2">{userCredits || 0}</div>
                  <div className="text-emerald-200 text-sm">Available Credits</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Free credits used:</span>
                  <span className="text-white">2/2</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Paid credits used:</span>
                  <span className="text-white">{Math.max(0, (userCredits || 0) - 2)}</span>
                </div>
              </div>

              <Link 
                to="/pricing" 
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white py-3 rounded-lg font-semibold text-center block transition-all"
              >
                Buy More Credits
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Jobs List */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">Your Jobs</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                </div>
              ) : jobs.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No jobs posted yet</p>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      onClick={() => loadJobApplications(job._id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-white/5 ${
                        selectedJob?._id === job._id 
                          ? 'border-cyan-500/50 bg-cyan-500/10' 
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <h3 className="font-semibold text-white mb-2">{job.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">{job.company}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{job.pendingApplications} pending</span>
                        <span>{job.totalApplications} total</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Applications View */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8">
              {!selectedJob ? (
                <div className="text-center py-12">
                  <h3 className="text-xl text-gray-400 mb-2">Select a Job</h3>
                  <p className="text-gray-500">Choose a job from the left to view applications</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold">{selectedJob.jobTitle}</h2>
                      <p className="text-gray-400">{selectedJob.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Applications</p>
                      <p className="text-2xl font-bold text-cyan-500">{applications.length}</p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                    </div>
                  ) : applications.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No applications yet</p>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div
                          key={application._id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-white text-lg">
                                {application.user.firstName} {application.user.lastName}
                              </h3>
                              <p className="text-gray-400">{application.user.email}</p>
                            </div>
                            <div className="text-right">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                                {getStatusText(application.status)}
                              </div>
                              <div className="mt-2 text-center">
                                <div className="text-2xl font-bold text-cyan-500">
                                  {application.user.jobHuntXP}
                                </div>
                                <div className="text-xs text-gray-500">XP</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                            <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                            {application.reviewedAt && (
                              <span>Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}</span>
                            )}
                          </div>

                          {application.status === 'pending' && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => updateApplicationStatus(application._id, 'reviewed')}
                                className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                              >
                                Mark as Reviewed
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(application._id, 'declined')}
                                className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(application._id, 'accepted')}
                                className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
                              >
                                Accept
                              </button>
                            </div>
                          )}

                          {application.status === 'reviewed' && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => updateApplicationStatus(application._id, 'declined')}
                                className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(application._id, 'accepted')}
                                className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
                              >
                                Accept
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

