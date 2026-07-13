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

  // Reminder Notification State
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    return localStorage.getItem('sadhna_reminders_enabled') === 'true';
  });
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem('sadhna_reminder_time') || '20:00';
  });
  const [inAppToast, setInAppToast] = useState({ show: false, message: '' });

  // Online/Offline State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handle PWA installation prompts
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect iOS
    const userAgent = window.navigator.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Detect standalone mode
    const standalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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

  // Patch local caches for offline modifications
  const patchLocalCache = (url, method, body) => {
    try {
      console.log(`Patching cache offline for ${method} ${url}`, body);
      
      // 1. Check-in updates: POST /api/checkins
      if (url === '/api/checkins' && method === 'POST') {
        const { challengeId, date, status, reason } = body;
        const cacheKey = `cache_/api/checkins/date/${date}`;
        const cached = localStorage.getItem(cacheKey);
        const list = cached ? JSON.parse(cached) : [];
        
        const index = list.findIndex(c => c.challengeId === challengeId);
        
        let challengePenalty = 50;
        const challengesCached = localStorage.getItem('cache_/api/challenges');
        if (challengesCached) {
          const challengesList = JSON.parse(challengesCached);
          const foundCh = challengesList.find(c => c.id === challengeId);
          if (foundCh) {
            challengePenalty = foundCh.penaltyAmount || 0;
          }
        }

        const newCheckIn = {
          id: 'temp-' + Date.now(),
          challengeId,
          date,
          status,
          reason,
          penaltyCharged: status === 'missed' ? challengePenalty : 0,
          createdAt: new Date().toISOString()
        };

        if (index > -1) {
          list[index] = newCheckIn;
        } else {
          list.push(newCheckIn);
        }
        localStorage.setItem(cacheKey, JSON.stringify(list));

        if (status === 'missed') {
          const walletCached = localStorage.getItem('cache_/api/wallet');
          if (walletCached) {
            const walletObj = JSON.parse(walletCached);
            walletObj.balance = Math.max(0, walletObj.balance - challengePenalty);
            walletObj.transactions.unshift({
              id: 'temp-t-' + Date.now(),
              date,
              type: 'charge',
              amount: challengePenalty,
              category: 'Challenge Penalty',
              description: `Penalty for missing challenge`,
              createdAt: new Date().toISOString()
            });
            localStorage.setItem('cache_/api/wallet', JSON.stringify(walletObj));
          }
        }
      }

      // 2. New Challenge: POST /api/challenges
      if (url === '/api/challenges' && method === 'POST') {
        const cacheKey = 'cache_/api/challenges';
        const cached = localStorage.getItem(cacheKey);
        const list = cached ? JSON.parse(cached) : [];
        list.push({
          id: 'temp-c-' + Date.now(),
          title: body.title,
          description: body.description,
          startDate: body.startDate,
          endDate: body.endDate,
          durationDays: body.durationDays,
          dailyTarget: body.dailyTarget,
          penaltyAmount: body.penaltyAmount,
          icon: body.icon || '🎯',
          whyStarted: body.whyStarted,
          isActive: true,
          createdAt: new Date().toISOString(),
          checkIns: []
        });
        localStorage.setItem(cacheKey, JSON.stringify(list));
      }

      // 3. Edit Challenge: PUT /api/challenges/:id
      if (url.startsWith('/api/challenges/') && method === 'PUT' && !url.endsWith('/archive')) {
        const chId = url.split('/').pop();
        const cacheKey = 'cache_/api/challenges';
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const list = JSON.parse(cached);
          const index = list.findIndex(c => c.id === chId);
          if (index > -1) {
            list[index] = {
              ...list[index],
              title: body.title !== undefined ? body.title : list[index].title,
              description: body.description !== undefined ? body.description : list[index].description,
              dailyTarget: body.dailyTarget !== undefined ? body.dailyTarget : list[index].dailyTarget,
              penaltyAmount: body.penaltyAmount !== undefined ? body.penaltyAmount : list[index].penaltyAmount,
              icon: body.icon !== undefined ? body.icon : list[index].icon,
              whyStarted: body.whyStarted !== undefined ? body.whyStarted : list[index].whyStarted,
              durationDays: body.durationDays !== undefined ? body.durationDays : list[index].durationDays
            };
            localStorage.setItem(cacheKey, JSON.stringify(list));
          }
        }
      }

      // 4. Archive Challenge: PUT /api/challenges/:id/archive
      if (url.startsWith('/api/challenges/') && method === 'PUT' && url.endsWith('/archive')) {
        const parts = url.split('/');
        const chId = parts[parts.length - 2];
        const cacheKey = 'cache_/api/challenges';
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const list = JSON.parse(cached);
          const index = list.findIndex(c => c.id === chId);
          if (index > -1) {
            list[index].isActive = false;
            localStorage.setItem(cacheKey, JSON.stringify(list));
          }
        }
      }

      // 5. Delete Challenge: DELETE /api/challenges/:id
      if (url.startsWith('/api/challenges/') && method === 'DELETE') {
        const chId = url.split('/').pop();
        const cacheKey = 'cache_/api/challenges';
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const list = JSON.parse(cached);
          const filtered = list.filter(c => c.id !== chId);
          localStorage.setItem(cacheKey, JSON.stringify(filtered));
        }
      }

      // 6. Log Mind Check Trigger: POST /api/journal/mindcheck
      if (url === '/api/journal/mindcheck' && method === 'POST') {
        const { date, triggerName, penaltyAmount } = body;
        const cacheKey = `cache_/api/journal/mindcheck/${date}`;
        const cached = localStorage.getItem(cacheKey);
        const list = cached ? JSON.parse(cached) : [];
        list.push({
          id: 'temp-m-' + Date.now(),
          date,
          triggerName,
          penaltyAmount,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(cacheKey, JSON.stringify(list));

        const walletCached = localStorage.getItem('cache_/api/wallet');
        if (walletCached) {
          const walletObj = JSON.parse(walletCached);
          walletObj.balance = Math.max(0, walletObj.balance - penaltyAmount);
          walletObj.transactions.unshift({
            id: 'temp-t-' + Date.now(),
            date,
            type: 'charge',
            amount: penaltyAmount,
            category: 'Mind Check Trigger',
            description: `Mind check trigger: ${triggerName}`,
            createdAt: new Date().toISOString()
          });
          localStorage.setItem('cache_/api/wallet', JSON.stringify(walletObj));
        }
      }

      // 7. Delete Mind Check Log: DELETE /api/journal/mindcheck/:id
      if (url.startsWith('/api/journal/mindcheck/') && method === 'DELETE') {
        const logId = url.split('/').pop();
        const date = new Date().toISOString().split('T')[0];
        const cacheKey = `cache_/api/journal/mindcheck/${date}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const list = JSON.parse(cached);
          const found = list.find(l => l.id === logId);
          if (found) {
            const filtered = list.filter(l => l.id !== logId);
            localStorage.setItem(cacheKey, JSON.stringify(filtered));
            
            const walletCached = localStorage.getItem('cache_/api/wallet');
            if (walletCached) {
              const walletObj = JSON.parse(walletCached);
              walletObj.balance += found.penaltyAmount;
              walletObj.transactions = walletObj.transactions.filter(t => !t.id.includes(logId));
              localStorage.setItem('cache_/api/wallet', JSON.stringify(walletObj));
            }
          }
        }
      }

      // 8. Submit Journal Reflection: POST /api/journal/reflection
      if (url === '/api/journal/reflection' && method === 'POST') {
        const { date, goodThing, mistake, improvement, gratitude, mood } = body;
        const cacheKeySingle = `cache_/api/journal/reflection/${date}`;
        const reflectionData = {
          id: 'temp-r-' + Date.now(),
          date,
          goodThing,
          mistake,
          improvement,
          gratitude,
          mood,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(cacheKeySingle, JSON.stringify(reflectionData));

        const cacheKeyHistory = 'cache_/api/journal/reflection';
        const cachedHistory = localStorage.getItem(cacheKeyHistory);
        const list = cachedHistory ? JSON.parse(cachedHistory) : [];
        const todayIndex = list.findIndex(r => r.date === date);
        if (todayIndex > -1) {
          list[todayIndex] = reflectionData;
        } else {
          list.unshift(reflectionData);
        }
        localStorage.setItem(cacheKeyHistory, JSON.stringify(list));
      }

      // 9. Add Selfie: POST /api/selfies
      if (url === '/api/selfies' && method === 'POST') {
        const { date, imageBlob } = body;
        const cacheKey = 'cache_/api/selfies';
        const cached = localStorage.getItem(cacheKey);
        const list = cached ? JSON.parse(cached) : [];
        const index = list.findIndex(s => s.date === date);
        const newSelfie = {
          id: 'temp-s-' + Date.now(),
          date,
          imageBlob,
          createdAt: new Date().toISOString()
        };
        if (index > -1) {
          list[index] = newSelfie;
        } else {
          list.unshift(newSelfie);
        }
        localStorage.setItem(cacheKey, JSON.stringify(list));
      }
    } catch (e) {
      console.error('Error patching local storage cache:', e);
    }
  };

  const apiFetchRaw = async (url, options = {}) => {
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

  const apiFetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    const isGet = method === 'GET';
    const cacheKey = `cache_${url}`;

    // If browser navigator is offline
    if (!navigator.onLine) {
      if (isGet) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          console.log(`Offline: serving cached GET for ${url}`);
          return JSON.parse(cached);
        }
        throw new Error('You are offline, and this resource is not cached.');
      } else {
        console.log(`Offline: queueing mutation ${method} for ${url}`);
        const queueKey = 'sadhna_sync_queue';
        const savedQueue = localStorage.getItem(queueKey);
        const queue = savedQueue ? JSON.parse(savedQueue) : [];
        
        queue.push({
          id: 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          url,
          options,
          timestamp: Date.now()
        });
        localStorage.setItem(queueKey, JSON.stringify(queue));

        const parsedBody = options.body ? JSON.parse(options.body) : {};
        patchLocalCache(url, method, parsedBody);

        setInAppToast({
          show: true,
          message: 'Saved changes offline. Will sync when online! 📴'
        });

        return { success: true, offline: true };
      }
    }

    try {
      const data = await apiFetchRaw(url, options);
      if (isGet) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
      return data;
    } catch (err) {
      const isNetworkError = err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('load');
      
      if (isNetworkError) {
        if (isGet) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            console.log(`Fetch failed: serving cached GET for ${url}`);
            return JSON.parse(cached);
          }
        } else {
          console.log(`Mutation fetch failed: queueing ${method} for ${url}`);
          const queueKey = 'sadhna_sync_queue';
          const savedQueue = localStorage.getItem(queueKey);
          const queue = savedQueue ? JSON.parse(savedQueue) : [];
          
          queue.push({
            id: 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            url,
            options,
            timestamp: Date.now()
          });
          localStorage.setItem(queueKey, JSON.stringify(queue));

          const parsedBody = options.body ? JSON.parse(options.body) : {};
          patchLocalCache(url, method, parsedBody);

          setInAppToast({
            show: true,
            message: 'Saved changes offline. Will sync when online! 📴'
          });

          return { success: true, offline: true };
        }
      }
      throw err;
    }
  };

  const syncQueue = async () => {
    if (!navigator.onLine) return;
    const queueKey = 'sadhna_sync_queue';
    const savedQueue = localStorage.getItem(queueKey);
    if (!savedQueue) return;
    
    try {
      const queue = JSON.parse(savedQueue);
      if (queue.length === 0) return;

      console.log(`Syncing ${queue.length} offline actions...`);
      setInAppToast({ show: true, message: `Syncing ${queue.length} offline changes... 🔄` });

      const failedItems = [];
      for (const item of queue) {
        try {
          await apiFetchRaw(item.url, item.options);
        } catch (err) {
          console.error(`Failed to sync queued request: ${item.url}`, err);
          failedItems.push(item);
        }
      }

      if (failedItems.length > 0) {
        localStorage.setItem(queueKey, JSON.stringify(failedItems));
        setInAppToast({
          show: true,
          message: `Failed to sync ${failedItems.length} changes. Will retry. ⚠️`
        });
      } else {
        localStorage.removeItem(queueKey);
        setInAppToast({
          show: true,
          message: 'All offline changes synced successfully! 🎉'
        });

        // Force clean local caches
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('cache_/api/')) {
            localStorage.removeItem(key);
          }
        });

        await refreshData();
      }
    } catch (e) {
      console.error('Error during queue synchronization:', e);
    }
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

  const fetchDailyQuote = async () => {
    try {
      const data = await apiFetch('/api/quote');
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

  const refreshData = async () => {
    if (!token) return;
    try {
      await Promise.all([
        fetchChallenges(),
        fetchWallet(),
        fetchTodayCheckIns(),
        fetchInsights()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const restartSession = async () => {
    if (!token) return;
    try {
      const todayStr = getTodayDateString();
      const updatedUser = await apiFetch('/api/auth/restart', {
        method: 'POST',
        body: JSON.stringify({ date: todayStr })
      });
      setUser(updatedUser);
      localStorage.setItem('sadhna_user', JSON.stringify(updatedUser));
      
      // Update caches to sync immediately
      localStorage.setItem('cache_/api/auth/me', JSON.stringify(updatedUser));
      
      await refreshData();
      
      setInAppToast({
        show: true,
        message: 'Goal restarted successfully! Streaks reset. 🎯'
      });
    } catch (err) {
      console.error('Failed to restart session:', err);
      alert('Could not restart challenge: ' + err.message);
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

  // Request random quote on startup/login
  useEffect(() => {
    if (token) {
      fetchDailyQuote();
    }
  }, [token]);

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

  // Sync offline queue when online
  useEffect(() => {
    if (isOnline && token) {
      syncQueue();
    }
  }, [isOnline, token]);

  const updateReminderSettings = (enabled, time) => {
    setRemindersEnabled(enabled);
    setReminderTime(time);
    localStorage.setItem('sadhna_reminders_enabled', String(enabled));
    localStorage.setItem('sadhna_reminder_time', time);
    
    if (enabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const sendTestNotification = () => {
    if (!('Notification' in window)) {
      alert('Browser does not support notifications.');
      return;
    }
    
    const motivationalMessages = [
      "Discipline is choosing between what you want now and what you want most. 🎯",
      "A 21-day challenge is won day by day. Check in today! 💪",
      "Your streak is waiting for you. Let's make today count! ✨",
      "Do not break the chain! Consistency is the key to mastery. 🔥",
      "Every small action builds your character. Keep going! 🚀",
      "Sadhna is the journey to self-control. Open the app to log your progress! 🧘‍♂️",
      "Keep your daily commitments alive today. Let's stay disciplined! 🌟",
      "The only bad check-in is the one that didn't happen. Check in now! ⏰"
    ];

    const trigger = () => {
      const randomQuote = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      new Notification('Sadhna Habit Reminder 🎯', {
        body: `Test: ${randomQuote}`,
        icon: '/Rise21.png',
        badge: '/Rise21.png'
      });
    };

    if (Notification.permission === 'granted') {
      trigger();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          trigger();
        }
      });
    } else {
      alert('Notification permissions are denied. Please enable them in browser settings.');
    }
  };

  useEffect(() => {
    if (inAppToast.show) {
      const timer = setTimeout(() => {
        setInAppToast({ show: false, message: '' });
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [inAppToast.show]);

  // Periodic Daily Reminder & Morning Nudge Check
  useEffect(() => {
    if (!remindersEnabled || !token) return;

    const checkAndNotify = () => {
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = getTodayDateString();

      // Curated motivational messages
      const motivationalMessages = [
        "Discipline is choosing between what you want now and what you want most. 🎯",
        "A 21-day challenge is won day by day. Check in today! 💪",
        "Your streak is waiting for you. Let's make today count! ✨",
        "Do not break the chain! Consistency is the key to mastery. 🔥",
        "Every small action builds your character. Keep going! 🚀",
        "Sadhna is the journey to self-control. Open the app to log your progress! 🧘‍♂️",
        "Keep your daily commitments alive today. Let's stay disciplined! 🌟",
        "The only bad check-in is the one that didn't happen. Check in now! ⏰",
        "Discipline beats motivation every single time. Open Rise21 to check in! 💪"
      ];

      // 1. Morning Nudge (09:00 AM)
      if (currentTimeStr === '09:00') {
        const lastMorningNotified = localStorage.getItem('sadhna_last_morning_notified_date');
        if (lastMorningNotified !== todayStr) {
          const activeChallenges = challenges.filter(c => c.isActive);
          if (activeChallenges.length > 0) {
            const randomQuote = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
            try {
              new Notification('Morning Rise21 Nudge ☀️', {
                body: randomQuote,
                icon: '/Rise21.png',
                badge: '/Rise21.png'
              });
            } catch (err) {
              console.error('Failed to trigger morning nudge:', err);
            }
            localStorage.setItem('sadhna_last_morning_notified_date', todayStr);
          }
        }
      }

      // 2. Evening Check-In (set by user)
      if (currentTimeStr === reminderTime) {
        const lastNotified = localStorage.getItem('sadhna_last_notified_date');

        if (lastNotified !== todayStr) {
          const activeChallenges = challenges.filter(c => c.isActive);
          if (activeChallenges.length === 0) return;

          const uncheckedCount = activeChallenges.filter(c => {
            return !todayCheckIns.some(ci => ci.challengeId === c.id);
          }).length;

          if (uncheckedCount > 0) {
            const randomQuote = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
            const bodyText = `${randomQuote} You have ${uncheckedCount} challenge${uncheckedCount > 1 ? 's' : ''} left to update today.`;
            try {
              new Notification('Sadhna Habit Reminder 🎯', {
                body: bodyText,
                icon: '/Rise21.png',
                badge: '/Rise21.png'
              });
            } catch (err) {
              console.error('Failed to trigger evening reminder:', err);
            }

            setInAppToast({
              show: true,
              message: `Reminder: ${bodyText}`
            });

            localStorage.setItem('sadhna_last_notified_date', todayStr);
          }
        }
      }
    };

    // Run check immediately
    checkAndNotify();

    // Check every 30 seconds
    const checkInterval = setInterval(checkAndNotify, 30000);
    return () => clearInterval(checkInterval);
  }, [remindersEnabled, reminderTime, challenges, todayCheckIns, token]);

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
      triggerPwaInstall,
      remindersEnabled,
      reminderTime,
      inAppToast,
      setInAppToast,
      updateReminderSettings,
      sendTestNotification,
      refreshData,
      isOnline,
      restartSession
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
