import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Plus, Check, X, AlertCircle, Calendar, User } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Today() {
  const {
    challenges,
    todayCheckIns,
    dailyQuote,
    setActiveTab,
    apiFetch,
    fetchTodayCheckIns,
    fetchWallet,
    fetchInsights,
    getTodayDateString
  } = useApp();

  const [excuseModal, setExcuseModal] = useState({ show: false, challenge: null });
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Helper to calculate challenge current streak
  const calculateChallengeStreak = (c) => {
    if (!c.checkIns || c.checkIns.length === 0) return 0;
    const sorted = [...c.checkIns].sort((a, b) => new Date(b.date) - new Date(a.date));
    const todayStr = getTodayDateString();
    
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
    
    const hasToday = sorted.find(ci => ci.date === todayStr);
    const hasYesterday = sorted.find(ci => ci.date === yStr);
    
    const isTodayCompleted = hasToday && hasToday.status === 'completed';
    const isYesterdayCompleted = hasYesterday && hasYesterday.status === 'completed';
    
    if (!isTodayCompleted && !isYesterdayCompleted) return 0;
    
    let streak = 0;
    let checkDate = isTodayCompleted ? new Date() : y;
    while (true) {
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const ci = sorted.find(item => item.date === dateStr);
      if (ci && ci.status === 'completed') {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Format today's date header (e.g. "Sunday", "5 July 2026")
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateName = today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  // Get active challenges
  const activeChallenges = challenges.filter(c => c.isActive);

  // Map checkin statuses by challenge ID for quick lookup
  const checkInMap = {};
  todayCheckIns.forEach(c => {
    checkInMap[c.challengeId] = c;
  });

  // Calculate today's penalty amount
  const todayPenalty = todayCheckIns.reduce((sum, c) => sum + c.penaltyCharged, 0);

  // Perform check-in status update
  const handleCheckIn = async (challenge, status, excuseReason = '') => {
    setSubmitting(true);
    try {
      await apiFetch('/api/checkins', {
        method: 'POST',
        body: JSON.stringify({
          challengeId: challenge.id,
          date: getTodayDateString(),
          status,
          reason: excuseReason
        })
      });

      // Trigger Confetti on completion!
      if (status === 'completed') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#5a7255', '#c5d0bc', '#a3b497']
        });
      }

      // Re-fetch context stats
      await fetchTodayCheckIns();
      await fetchWallet();
      await fetchInsights();
      setExcuseModal({ show: false, challenge: null });
      setReason('');
    } catch (error) {
      console.error(error);
      alert('Error updating check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const openMissedModal = (challenge) => {
    setExcuseModal({ show: true, challenge });
  };

  // Helper to calculate day number (e.g., Day 8 of 21)
  const getDayNumber = (challenge) => {
    const start = new Date(challenge.startDate);
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const diffTime = todayZero - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(diffDays, challenge.durationDays));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-24 pt-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-sage-900 tracking-tight leading-none">
            {dayName}
          </h1>
          <p className="text-sm text-cream-500 font-sans mt-2">
            {dateName}
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-10 h-10 rounded-full border border-cream-300 bg-white flex items-center justify-center text-sage-600 hover:bg-cream-50 transition-colors shadow-sm"
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      {/* Daily Thought / Quote card */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-sage-600 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Daily Thought</span>
        </div>
        <p className="font-serif text-lg italic text-sage-800 leading-snug">
          "{dailyQuote?.text}"
        </p>
        {dailyQuote?.author && (
          <p className="text-right text-xs text-cream-500 font-sans mt-2">
            — {dailyQuote?.author}
          </p>
        )}
      </div>

      {/* Today's Discipline Score Circular Progress */}
      {activeChallenges.length > 0 && (
        <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6 flex items-center justify-between">
          <div className="flex-1 pr-4">
            <span className="text-[10px] font-semibold text-cream-400 uppercase tracking-wider block mb-1">
              🎯 Today's Discipline Score
            </span>
            <h3 className="font-serif text-xl font-bold text-sage-900 tracking-tight">
              {activeChallenges.filter(c => checkInMap[c.id]?.status === 'completed').length} / {activeChallenges.length} Completed
            </h3>
            <p className="text-xs text-cream-500 font-sans mt-1">
              {activeChallenges.filter(c => checkInMap[c.id]?.status === 'completed').length === activeChallenges.length 
                ? 'Perfect score today! Keep it up! 🌟' 
                : 'Complete all targets to stay disciplined.'}
            </p>
          </div>
          
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                strokeWidth="5"
                stroke="#f3f1e9"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                strokeWidth="5"
                stroke="#5a7255"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - (activeChallenges.filter(c => checkInMap[c.id]?.status === 'completed').length / activeChallenges.length))}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-xs font-bold text-sage-800 font-mono">
              {Math.round((activeChallenges.filter(c => checkInMap[c.id]?.status === 'completed').length / activeChallenges.length) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Main Checklist / Habits Card */}
      {activeChallenges.length === 0 ? (
        // Empty State matching mockup
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-cream-300 rounded-3xl bg-cream-50/50 p-10 text-center my-6">
          <div className="w-14 h-14 bg-sage-100/50 rounded-full flex items-center justify-center mb-4 text-sage-600">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-medium text-sage-800 mb-2">
            Start your first challenge
          </h3>
          <p className="text-sm text-cream-600 max-w-xs leading-relaxed mb-6 font-sans">
            Pick a habit, commit for 21 days, and hold yourself accountable.
          </p>
          <button
            onClick={() => setActiveTab('challenges')}
            className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white font-medium py-3 px-6 rounded-2xl text-sm transition-all shadow-premium hover:shadow-premium-hover active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create challenge</span>
          </button>
        </div>
      ) : (
        // Active Checklist list
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl font-medium text-sage-800">
              Today's Discipline Checklist
            </h2>
            {todayPenalty > 0 && (
              <span className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
                Today's Penalty: ₹{todayPenalty}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {activeChallenges.map(challenge => {
              const checkIn = checkInMap[challenge.id];
              const dayNum = getDayNumber(challenge);
              const completedCount = challenge.checkIns ? challenge.checkIns.filter(ci => ci.status === 'completed').length : 0;
              const streakCount = calculateChallengeStreak(challenge);
              
              return (
                <div 
                  key={challenge.id}
                  className="bg-white border border-sage-50 rounded-3xl p-5 shadow-premium flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xl">{challenge.icon || '🎯'}</span>
                        <h4 className="font-serif text-base font-semibold text-sage-800">
                          {challenge.title}
                        </h4>
                        <span className="text-[10px] bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full font-medium font-sans">
                          Day {dayNum} of {challenge.durationDays}
                        </span>
                      </div>
                      <p className="text-xs text-cream-500 font-sans line-clamp-1">
                        Target: {challenge.dailyTarget}
                      </p>
                      {checkIn?.status === 'missed' && checkIn.reason && (
                        <p className="text-[11px] text-red-500 italic mt-1 font-sans">
                          Excuse: "{checkIn.reason}"
                        </p>
                      )}
                    </div>

                    {/* Complete / Miss Actions */}
                    <div className="flex gap-2">
                      {/* Missed Checkbox Button */}
                      <button
                        onClick={() => {
                          if (checkIn?.status === 'missed') return;
                          openMissedModal(challenge);
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          checkIn?.status === 'missed'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-cream-50 text-cream-400 border border-cream-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                        }`}
                        title="Mark as Missed"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Completed Checkbox Button */}
                      <button
                        onClick={() => {
                          if (checkIn?.status === 'completed') return;
                          handleCheckIn(challenge, 'completed');
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          checkIn?.status === 'completed'
                            ? 'bg-sage-500 text-white shadow-sm'
                            : 'bg-cream-50 text-cream-400 border border-cream-200 hover:bg-sage-50 hover:text-sage-500 hover:border-sage-200'
                        }`}
                        title="Mark as Completed"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Why You Started Statement */}
                  {challenge.whyStarted && (
                    <p className="text-[10px] text-sage-600 bg-sage-50/50 border border-sage-100/50 rounded-2xl px-3 py-1.5 font-sans italic">
                      Why I started: "{challenge.whyStarted}"
                    </p>
                  )}

                  {/* Streak & Progress indicators */}
                  <div className="border-t border-cream-50 pt-2">
                    <div className="w-full bg-cream-50 rounded-full h-2 overflow-hidden border border-cream-200">
                      <div 
                        className="bg-sage-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (completedCount / challenge.durationDays) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-cream-500 font-sans mt-2">
                      <span>Progress: {completedCount} / {challenge.durationDays} days ({Math.round((completedCount / challenge.durationDays) * 100)}%)</span>
                      {streakCount > 0 && (
                        <span className="font-semibold text-orange-600 flex items-center gap-0.5 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                          🔥 Streak: {streakCount} {streakCount === 1 ? 'day' : 'days'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missed Reflection/Excuse Modal */}
      {excuseModal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl border border-sage-100 p-6 shadow-premium animate-in fade-in zoom-in-95 duration-250">
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-serif text-lg font-semibold">Self-Accountability Charge</h3>
            </div>
            
            <p className="text-sm text-cream-600 mb-4 leading-relaxed font-sans">
              Missing this habit will collect a penalty of <strong>₹{excuseModal.challenge?.penaltyAmount}</strong>. Use this slip-up for self-reflection:
            </p>

            <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
              Why did I miss this today?
            </label>
            <textarea
              rows={3}
              placeholder="e.g. I slept late yesterday / I was feeling lazy"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 transition-all font-sans mb-6"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setExcuseModal({ show: false, challenge: null });
                  setReason('');
                }}
                disabled={submitting}
                className="px-4 py-2 border border-cream-200 rounded-xl text-xs text-cream-600 hover:bg-cream-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCheckIn(excuseModal.challenge, 'missed', reason)}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                {submitting ? 'Logging...' : `Charge ₹${excuseModal.challenge?.penaltyAmount}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
