import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Smile, AlertCircle, ChevronDown, ChevronUp, Plus, Trash2, CheckCircle2, User, Flame, Bell } from 'lucide-react';

export default function Journal() {
  const {
    apiFetch,
    fetchWallet,
    fetchInsights,
    getTodayDateString,
    setActiveTab,
    insights,
    unreadCount,
    setShowAnnouncementsModal
  } = useApp();

  const todayStr = getTodayDateString();

  // Triggers state (saved in localStorage)
  const [triggers, setTriggers] = useState(() => {
    const saved = localStorage.getItem('rise21_mind_triggers');
    return saved ? JSON.parse(saved) : [
      { name: 'Negative thought', amount: 10 },
      { name: 'Anger', amount: 20 },
      { name: 'Wasted time', amount: 50 },
      { name: 'Excess social media', amount: 30 }
    ];
  });

  // Track state
  const [showManageTriggers, setShowManageTriggers] = useState(false);
  const [newTriggerName, setNewTriggerName] = useState('');
  const [newTriggerAmount, setNewTriggerAmount] = useState('');
  const [todayLogs, setTodayLogs] = useState([]);
  const [submittingTrigger, setSubmittingTrigger] = useState(null);

  // Reflection form state
  const [goodThing, setGoodThing] = useState('');
  const [mistake, setMistake] = useState('');
  const [improvement, setImprovement] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [mood, setMood] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Reflection history
  const [reflectionsHistory, setReflectionsHistory] = useState([]);

  // Save triggers to localStorage
  useEffect(() => {
    localStorage.setItem('rise21_mind_triggers', JSON.stringify(triggers));
  }, [triggers]);

  // Fetch today's mind logs
  const fetchTodayLogs = async () => {
    try {
      const data = await apiFetch(`/api/journal/mindcheck/${todayStr}`);
      setTodayLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch reflection for today
  const fetchTodayReflection = async () => {
    try {
      const data = await apiFetch(`/api/journal/reflection/${todayStr}`);
      if (data) {
        setGoodThing(data.goodThing || '');
        setMistake(data.mistake || '');
        setImprovement(data.improvement || '');
        setGratitude(data.gratitude || '');
        setMood(data.mood || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch reflections history
  const fetchReflectionsHistory = async () => {
    try {
      const data = await apiFetch('/api/journal/reflection');
      setReflectionsHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTodayLogs();
    fetchTodayReflection();
    fetchReflectionsHistory();
  }, []);

  // Mind check trigger log
  const handleLogTrigger = async (trigger) => {
    setSubmittingTrigger(trigger.name);
    try {
      await apiFetch('/api/journal/mindcheck', {
        method: 'POST',
        body: JSON.stringify({
          date: todayStr,
          triggerName: trigger.name,
          penaltyAmount: trigger.amount
        })
      });
      await fetchTodayLogs();
      await fetchWallet();
      await fetchInsights();
    } catch (err) {
      console.error(err);
      alert('Could not log thought trigger');
    } finally {
      setSubmittingTrigger(null);
    }
  };

  // Delete log trigger from today
  const handleDeleteTodayLog = async (id) => {
    try {
      await apiFetch(`/api/journal/mindcheck/${id}`, { method: 'DELETE' });
      await fetchTodayLogs();
      await fetchWallet();
      await fetchInsights();
    } catch (err) {
      console.error(err);
    }
  };

  // Add custom trigger
  const handleAddCustomTrigger = (e) => {
    e.preventDefault();
    if (!newTriggerName || !newTriggerAmount) return;
    
    const newTrig = {
      name: newTriggerName.trim(),
      amount: parseFloat(newTriggerAmount)
    };

    // Check if exists
    if (triggers.some(t => t.name.toLowerCase() === newTrig.name.toLowerCase())) {
      alert('Trigger already exists');
      return;
    }

    setTriggers([...triggers, newTrig]);
    setNewTriggerName('');
    setNewTriggerAmount('');
  };

  // Remove custom trigger
  const handleRemoveTrigger = (name) => {
    setTriggers(triggers.filter(t => t.name !== name));
  };

  // Submit Reflection
  const handleSaveReflection = async (e) => {
    e.preventDefault();
    setSavingReflection(true);
    setReflectionSaved(false);
    try {
      await apiFetch('/api/journal/reflection', {
        method: 'POST',
        body: JSON.stringify({
          date: todayStr,
          goodThing,
          mistake,
          improvement,
          gratitude,
          mood
        })
      });
      setReflectionSaved(true);
      await fetchReflectionsHistory();
      setTimeout(() => setReflectionSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Could not save reflection');
    } finally {
      setSavingReflection(false);
    }
  };

  // Helper to count how many times a trigger was clicked today
  const getTriggerCount = (name) => {
    return todayLogs.filter(l => l.triggerName === name).length;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-6 pt-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-sage-900 tracking-tight">
            Journal
          </h1>
          <p className="text-sm text-cream-500 font-sans mt-1">
            Notice yourself with kindness.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {insights && (
            <div className="flex items-center gap-1 bg-orange-50 border border-orange-200/50 px-2.5 py-1.5 rounded-full text-orange-700 font-bold font-sans text-xs shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{insights.currentStreak}d</span>
            </div>
          )}
          <button 
            onClick={() => setShowAnnouncementsModal(true)}
            className="relative w-10 h-10 rounded-full border border-cream-300 bg-white flex items-center justify-center text-sage-600 hover:bg-cream-50 transition-colors shadow-sm"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full border border-cream-300 bg-white flex items-center justify-center text-sage-600 hover:bg-cream-50 transition-colors shadow-sm"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mind Check Trigger log */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <h2 className="font-serif text-lg font-bold text-sage-800 mb-1">
          Mind check
        </h2>
        <p className="text-xs text-cream-500 font-sans mb-4">
          Tap the moments that pulled you off center today.
        </p>

        {/* Triggers click layout */}
        <div className="flex flex-wrap gap-2 mb-4">
          {triggers.map(t => {
            const count = getTriggerCount(t.name);
            const isClicking = submittingTrigger === t.name;

            return (
              <button
                key={t.name}
                onClick={() => handleLogTrigger(t)}
                disabled={isClicking}
                className={`py-2 px-3 rounded-full border text-xs font-medium font-sans transition-all flex items-center gap-1.5 active:scale-95 ${
                  count > 0
                    ? 'bg-sage-100 border-sage-200 text-sage-800 font-semibold'
                    : 'bg-cream-50 border-cream-200 text-cream-700 hover:bg-cream-100'
                }`}
              >
                <span>{t.name}</span>
                <span className="text-[10px] text-cream-400 font-normal">+₹{t.amount}</span>
                {count > 0 && (
                  <span className="bg-sage-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold font-mono text-[10px]">
                    {count}
                  </span>
                )}
                {isClicking && (
                  <span className="w-3 h-3 border border-sage-500 border-t-transparent rounded-full animate-spin"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Today's logs list */}
        {todayLogs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-cream-100">
            <h4 className="text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
              Slip-ups Logged Today
            </h4>
            <div className="space-y-2">
              {todayLogs.map(log => (
                <div key={log.id} className="flex justify-between items-center bg-cream-50 rounded-xl px-3 py-2 text-xs">
                  <span className="font-sans text-cream-700">
                    Logged <strong>{log.triggerName}</strong> (₹{log.penaltyAmount})
                  </span>
                  <button
                    onClick={() => handleDeleteTodayLog(log.id)}
                    className="text-red-500 hover:text-red-700 font-semibold font-sans px-1"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manage Triggers foldout */}
        <div className="mt-4">
          <button
            onClick={() => setShowManageTriggers(!showManageTriggers)}
            className="flex items-center gap-1.5 text-xs text-sage-600 hover:text-sage-700 font-medium font-sans focus:outline-none"
          >
            {showManageTriggers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>Manage triggers</span>
          </button>

          {showManageTriggers && (
            <div className="mt-4 p-4 border border-cream-200 rounded-2xl bg-cream-50/50">
              <h4 className="text-xs font-semibold text-sage-800 mb-3 font-sans">
                Active Mind Check Triggers
              </h4>
              
              {/* List current triggers */}
              <div className="space-y-2 mb-4">
                {triggers.map(t => (
                  <div key={t.name} className="flex justify-between items-center bg-white border border-cream-100 rounded-xl px-3 py-2 text-xs font-sans">
                    <span>{t.name} (₹{t.amount})</span>
                    <button
                      onClick={() => handleRemoveTrigger(t.name)}
                      className="text-cream-400 hover:text-red-600 rounded"
                      title="Remove Trigger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Trigger Form */}
              <form onSubmit={handleAddCustomTrigger} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Trigger Name"
                  value={newTriggerName}
                  onChange={(e) => setNewTriggerName(e.target.value)}
                  className="flex-1 p-2 bg-white border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-sage-300 font-sans"
                  required
                />
                <input
                  type="number"
                  placeholder="₹ Cost"
                  value={newTriggerAmount}
                  onChange={(e) => setNewTriggerAmount(e.target.value)}
                  className="w-20 p-2 bg-white border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-sage-300 font-sans"
                  min="0"
                  required
                />
                <button
                  type="submit"
                  className="bg-sage-500 hover:bg-sage-600 text-white rounded-xl px-3 flex items-center justify-center shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Evening Reflection Card */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <h2 className="font-serif text-lg font-bold text-sage-800 mb-1">
          Evening reflection
        </h2>
        <p className="text-xs text-cream-500 font-sans mb-6">
          Review your self-awareness diary for today.
        </p>

        <form onSubmit={handleSaveReflection} className="space-y-5 text-left">
          {/* Mood Selector Buttons */}
          <div>
            <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
              How do you feel today?
            </label>
            <div className="flex gap-2">
              {[
                { label: '😌 Peaceful', val: 'Peaceful' },
                { label: '🙂 Good', val: 'Good' },
                { label: '😐 Average', val: 'Average' },
                { label: '😔 Bad', val: 'Bad' }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setMood(opt.val)}
                  className={`flex-1 py-2.5 rounded-xl border text-[11px] font-semibold font-sans transition-all active:scale-[0.98] ${
                    mood === opt.val
                      ? 'bg-sage-50 border-sage-500 text-sage-800 shadow-sm'
                      : 'bg-cream-50/50 border-cream-200 text-cream-600 hover:bg-cream-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
              One good thing you did
            </label>
            <textarea
              rows={2}
              placeholder="Write freely..."
              value={goodThing}
              onChange={(e) => setGoodThing(e.target.value)}
              className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
              A mistake you made
            </label>
            <textarea
              rows={2}
              placeholder="Write freely..."
              value={mistake}
              onChange={(e) => setMistake(e.target.value)}
              className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
              What will you improve tomorrow
            </label>
            <textarea
              rows={2}
              placeholder="Write freely..."
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
              What are you grateful for today
            </label>
            <textarea
              rows={2}
              placeholder="Write freely..."
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={savingReflection}
            className="w-full bg-sage-500 hover:bg-sage-600 text-white font-medium py-3 rounded-2xl text-xs transition-all shadow-sm flex items-center justify-center font-sans active:scale-98"
          >
            {savingReflection ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : reflectionSaved ? (
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved Successfully</span>
            ) : (
              'Save Reflection'
            )}
          </button>
        </form>
      </div>

      {/* Reflections History section */}
      {reflectionsHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-semibold text-sage-800 mb-2 border-b border-cream-200 pb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sage-500" />
            <span>Reflection History</span>
          </h3>

          <div className="space-y-4">
            {reflectionsHistory.map(history => (
              <div key={history.id} className="bg-white border border-sage-50 rounded-3xl p-5 shadow-premium">
                <div className="flex justify-between items-center mb-3 text-xs text-cream-500 font-sans">
                  <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-sage-400" />
                    <span>{new Date(history.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {history.mood && (
                    <span className="bg-sage-100 text-sage-800 border border-sage-200/50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                      {history.mood === 'Peaceful' ? '😌 Peaceful' : history.mood === 'Good' ? '🙂 Good' : history.mood === 'Average' ? '😐 Average' : '😔 Bad'}
                    </span>
                  )}
                </div>
                
                <div className="space-y-3 text-xs font-sans">
                  {history.goodThing && (
                    <div>
                      <strong className="text-sage-800">Good deed:</strong>
                      <p className="text-cream-600 mt-0.5">{history.goodThing}</p>
                    </div>
                  )}
                  {history.mistake && (
                    <div>
                      <strong className="text-red-700">Mistake:</strong>
                      <p className="text-cream-600 mt-0.5">{history.mistake}</p>
                    </div>
                  )}
                  {history.improvement && (
                    <div>
                      <strong className="text-sage-700">Improvement plan:</strong>
                      <p className="text-cream-600 mt-0.5">{history.improvement}</p>
                    </div>
                  )}
                  {history.gratitude && (
                    <div>
                      <strong className="text-sage-800">Grateful for:</strong>
                      <p className="text-cream-600 mt-0.5">{history.gratitude}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
