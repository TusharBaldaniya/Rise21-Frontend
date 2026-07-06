import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('sadhna_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sadhna_user');
    return saved ? JSON.parse(saved) : null;
  });

  // App States
  const [challenges, setChallenges] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, collected: 0, redirected: 0, transactions: [] });
  const [todayCheckIns, setTodayCheckIns] = useState([]);
  const [insights, setInsights] = useState(null);
  const [dailyQuote, setDailyQuote] = useState({ text: "Loading daily guidance...", author: "" });
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Navigation Routing State
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'challenges' | 'journal' | 'wallet' | 'insights' | 'profile'
  
  // App Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle PWA installation prompts
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect iOS
    const userAgent = window.navigator.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Detect standalone mode
    const standalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const triggerPwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User install choice: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Base API URL configuration for deployments
  const API_BASE = import.meta.env.VITE_API_URL || '';

  // Fetch helper with auth headers
  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'API Request Failed');
    }
    return res.json();
  };

  // Auth Operations
  const login = async (username, password) => {
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('sadhna_token', data.token);
      localStorage.setItem('sadhna_user', JSON.stringify(data.user));
      setActiveTab('today');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password, name) => {
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, name })
      });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('sadhna_token', data.token);
      localStorage.setItem('sadhna_user', JSON.stringify(data.user));
      setActiveTab('today');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setChallenges([]);
    setWallet({ balance: 0, collected: 0, redirected: 0, transactions: [] });
    setTodayCheckIns([]);
    setInsights(null);
    localStorage.removeItem('sadhna_token');
    localStorage.removeItem('sadhna_user');
    setActiveTab('today');
  };

  // Helper to format Date as YYYY-MM-DD
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Data Fetching
  const fetchChallenges = async () => {
    if (!token) return;
    try {
      const data = await apiFetch('/api/challenges');
      setChallenges(data);
    } catch (err) {
      console.error('Fetch challenges error:', err);
    }
  };

  const fetchWallet = async () => {
    if (!token) return;
    try {
      const data = await apiFetch('/api/wallet');
      setWallet(data);
    } catch (err) {
      console.error('Fetch wallet error:', err);
    }
  };

  const fetchTodayCheckIns = async () => {
    if (!token) return;
    try {
      const todayStr = getTodayDateString();
      const data = await apiFetch(`/api/checkins/date/${todayStr}`);
      setTodayCheckIns(data);
    } catch (err) {
      console.error('Fetch checkins error:', err);
    }
  };

  const fetchInsights = async () => {
    if (!token) return;
    try {
      const data = await apiFetch('/api/insights');
      setInsights(data);
    } catch (err) {
      console.error('Fetch insights error:', err);
    }
  };

  const fetchDailyQuote = async (categories = '') => {
    try {
      const url = categories ? `${API_BASE}/api/quote?categories=${categories}` : `${API_BASE}/api/quote`;
      const data = await fetch(url).then(r => r.json());
      setDailyQuote(data);
    } catch (err) {
      console.error('Fetch quote error:', err);
    }
  };

  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const data = await apiFetch('/api/auth/me');
      setUser(data);
      localStorage.setItem('sadhna_user', JSON.stringify(data));
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  // Auto load user session details
  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchChallenges();
      fetchWallet();
      fetchTodayCheckIns();
      fetchInsights();
    }
  }, [token]);

  // Request categorized quote when challenges update
  useEffect(() => {
    if (token && challenges.length > 0) {
      const cats = [];
      challenges.filter(c => c.isActive).forEach(c => {
        const t = c.title.toLowerCase();
        if (t.includes('read') || t.includes('book') || t.includes('study') || t.includes('vanchan')) cats.push('wisdom');
        else if (t.includes('run') || t.includes('gym') || t.includes('walk') || t.includes('exercise') || t.includes('workout') || t.includes('suryanamaskar') || t.includes('sport')) cats.push('fitness');
        else if (t.includes('pray') || t.includes('prarthana') || t.includes('meditate') || t.includes('yoga') || t.includes('spiritual')) cats.push('spirituality');
        else if (t.includes('save') || t.includes('money') || t.includes('spend') || t.includes('budget') || t.includes('wallet')) cats.push('wealth');
        else cats.push('discipline');
      });
      const uniqueCats = Array.from(new Set(cats)).join(',');
      fetchDailyQuote(uniqueCats);
    } else if (token) {
      fetchDailyQuote();
    }
  }, [challenges, token]);

  // Periodic refresh when tab switches
  useEffect(() => {
    if (token) {
      fetchChallenges();
      fetchWallet();
      fetchTodayCheckIns();
      fetchInsights();
    }
  }, [activeTab]);

  // Keep-alive scheduler for free-tier backend hosting (pings health endpoint every 30 minutes)
  useEffect(() => {
    const keepAlive = () => {
      fetch(`${API_BASE}/api/health`)
        .then(r => r.json())
        .then(data => console.log('Keep-alive ping success:', data.status))
        .catch(err => console.error('Keep-alive ping failed:', err));
    };

    // Ping immediately on load
    keepAlive();

    // Ping every 30 minutes (30 * 60 * 1000 ms)
    const interval = setInterval(keepAlive, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider value={{
      token,
      user,
      challenges,
      wallet,
      todayCheckIns,
      insights,
      dailyQuote,
      activeTab,
      setActiveTab,
      loading,
      error,
      setError,
      login,
      register,
      logout,
      apiFetch,
      getTodayDateString,
      fetchChallenges,
      fetchWallet,
      fetchTodayCheckIns,
      fetchInsights,
      isInstallable,
      isIOS,
      isStandalone,
      triggerPwaInstall
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
