import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Flame, Target, DollarSign, Calendar, TrendingUp, User, Smile } from 'lucide-react';
import Monthly from './Monthly';

export default function Insights() {
  const { insights, setActiveTab } = useApp();
  const [subTab, setSubTab] = useState('overview'); // 'overview' | 'monthly'

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchEndX = useRef(null);
  const touchEndY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      touchEndX.current === null ||
      touchEndY.current === null
    ) {
      return;
    }

    const diffX = touchEndX.current - touchStartX.current;
    const diffY = touchEndY.current - touchStartY.current;

    const thresholdX = 55; // minimum horizontal swipe distance (px)
    const ratio = 1.5; // X distance must be at least 1.5x of Y drift

    if (Math.abs(diffX) > thresholdX && Math.abs(diffX) > Math.abs(diffY) * ratio) {
      if (diffX < 0) {
        setSubTab('monthly');
      } else {
        setSubTab('overview');
      }
    }

    // Reset coordinates
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const scrollToTab = (tab) => {
    setSubTab(tab);
  };

  if (!insights) {
    return (
      <div className="flex items-center justify-center h-full text-cream-400 font-sans text-sm">
        Calculating insights...
      </div>
    );
  }

  // Define badge design mappings
  const badgeColors = {
    first_step: 'bg-orange-50 border-orange-200 text-orange-700',
    streak_7: 'bg-red-50 border-red-200 text-red-700',
    master_21: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    discipline_master: 'bg-green-50 border-green-200 text-green-700'
  };

  // Custom inline SVG rendering for visual stability and theme harmony
  const maxRate = 100;
  const chartHeight = 120;
  const paddingBottom = 20;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-24 pt-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-sage-900 tracking-tight">
            Insights
          </h1>
          <p className="text-sm text-cream-500 font-sans mt-1">
            Your discipline, in numbers.
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
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full border border-cream-300 bg-white flex items-center justify-center text-sage-600 hover:bg-cream-50 transition-colors shadow-sm"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

    {/* Sub-Tab Selector Overview vs Monthly */}
    <div className="flex bg-cream-50 border border-cream-150 p-1 rounded-2xl mb-6 font-sans">
      <button
        onClick={() => scrollToTab('overview')}
        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
          subTab === 'overview'
            ? 'bg-sage-500 text-white shadow-sm'
            : 'text-cream-600 hover:bg-cream-100/50'
        }`}
      >
        Overview
      </button>
      <button
        onClick={() => scrollToTab('monthly')}
        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
          subTab === 'monthly'
            ? 'bg-sage-500 text-white shadow-sm'
            : 'text-cream-600 hover:bg-cream-100/50'
        }`}
      >
        Monthly Log
      </button>
    </div>

    {/* CSS Stylesheet wrapper to hide horizontal scrollbar indicator lines */}
    <style>{`
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `}</style>

    <div 
      className="flex-1 w-full overflow-hidden pb-10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="w-[200%] flex items-start transition-transform duration-300 ease-out"
        style={{ transform: subTab === 'overview' ? 'translateX(0)' : 'translateX(-50%)' }}
      >
        {/* Slide 1: Overview */}
        <div className="w-1/2 shrink-0 px-0.5">
        {/* Achievement Rank Level Banner Card */}
        <div className="bg-gradient-to-r from-sage-500 to-sage-600 text-white rounded-3xl p-5 shadow-premium mb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90 block mb-1">
              Current Discipline Rank
            </span>
            <h2 className="font-serif text-2xl font-bold tracking-tight flex items-center gap-1.5">
              {insights.bestStreak >= 15 
                ? '👑 Master' 
                : insights.bestStreak >= 8 
                ? '⚔️ Disciplined' 
                : insights.bestStreak >= 4 
                ? '🔥 Consistent' 
                : '🌱 Beginner'}
            </h2>
            <p className="text-[10px] opacity-90 mt-1 font-sans">
              {insights.bestStreak >= 15 
                ? 'Incredible! You have mastered self-control.' 
                : insights.bestStreak >= 8 
                ? 'Keep going! Master rank unlocks at a 15-day streak.' 
                : insights.bestStreak >= 4 
                ? 'Great consistency! Disciplined rank unlocks at 8 days.' 
                : 'Maintain a 4-day streak to unlock Consistent rank!'}
            </p>
          </div>
          <div className="bg-white/15 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
            {insights.bestStreak >= 15 
              ? '👑' 
              : insights.bestStreak >= 8 
              ? '⚔️' 
              : insights.bestStreak >= 4 
              ? '🔥' 
              : '🌱'}
          </div>
        </div>

        {/* 4 Stat Boxes Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          
          {/* Best Streak */}
          <div className="bg-white border border-sage-50 rounded-3xl p-4 shadow-premium">
            <span className="text-[10px] font-semibold text-cream-400 uppercase tracking-wider block mb-1">
              Best Streak
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-bold text-sage-800">{insights.bestStreak}</span>
              <span className="text-xs text-cream-500 font-sans">days</span>
            </div>
            <p className="text-[10px] text-cream-400 mt-1 font-sans">
              Current: {insights.currentStreak} days
            </p>
          </div>

          {/* Success Rate */}
          <div className="bg-white border border-sage-50 rounded-3xl p-4 shadow-premium">
            <span className="text-[10px] font-semibold text-cream-400 uppercase tracking-wider block mb-1">
              Success Rate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-bold text-sage-800">{insights.successRate}%</span>
            </div>
            <p className="text-[10px] text-cream-400 mt-1 font-sans">
              Completed check-ins
            </p>
          </div>

          {/* Active Challenges */}
          <div className="bg-white border border-sage-50 rounded-3xl p-4 shadow-premium">
            <span className="text-[10px] font-semibold text-cream-400 uppercase tracking-wider block mb-1">
              Challenges
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-bold text-sage-800">{insights.activeChallengesCount}</span>
            </div>
            <p className="text-[10px] text-cream-400 mt-1 font-sans">
              Currently active
            </p>
          </div>

          {/* Total Penalty */}
          <div className="bg-white border border-sage-50 rounded-3xl p-4 shadow-premium">
            <span className="text-[10px] font-semibold text-cream-400 uppercase tracking-wider block mb-1">
              Total Penalty
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl font-bold text-sage-800">₹{insights.totalPenalty}</span>
            </div>
            <p className="text-[10px] text-cream-400 mt-1 font-sans">
              Charged from slips
            </p>
          </div>
        </div>

        {/* Last 7 Days Completion Rate Chart */}
        <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sage-500" />
            <span>Weekly Discipline (Last 7 Days)</span>
          </h3>

          <div className="flex justify-between items-end h-[160px] px-2 pt-6 font-sans">
            {insights.last7Days.map((dayItem, idx) => {
              const rate = dayItem.rate;
              const moodMap = {
                'Peaceful': '😌',
                'Good': '🙂',
                'Average': '😐',
                'Bad': '😔'
              };
              const matchingMoodObj = insights.recentMoods?.find(rm => rm.date === dayItem.date);
              const moodEmoji = matchingMoodObj ? moodMap[matchingMoodObj.mood] : null;

              return (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <span className="text-[9px] font-mono font-bold text-sage-800 mb-1">
                    {rate}%
                  </span>
                  
                  <div className="w-3 bg-cream-50 border border-cream-200 rounded-full h-24 flex items-end overflow-hidden">
                    <div 
                      style={{ height: `${rate}%` }}
                      className={`w-full rounded-full transition-all duration-500 ${
                        rate > 70 
                          ? 'bg-sage-500' 
                          : rate > 30 
                          ? 'bg-sage-300'
                          : rate > 0
                          ? 'bg-red-400'
                          : 'bg-transparent'
                      }`}
                    />
                  </div>
                  
                  <span className="text-[10px] text-cream-500 font-semibold mt-2">
                    {dayItem.day}
                  </span>

                  <span className="text-xs mt-1 min-h-[16px]" title={matchingMoodObj?.mood || 'No journal entry'}>
                    {moodEmoji || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mood Trends Summary Card */}
        <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 flex items-center gap-2">
            <Smile className="w-4 h-4 text-sage-500" />
            <span>Mood Trends</span>
          </h3>
          
          <div className="flex items-center justify-between bg-cream-50/50 border border-cream-100 rounded-2xl p-4">
            <div>
              <span className="text-[10px] font-semibold text-cream-400 uppercase tracking-wider block mb-0.5">
                Dominant Mood This Week
              </span>
              <strong className="text-sm font-bold text-sage-900 font-sans">
                {insights.dominantMood === 'Peaceful' 
                  ? '😌 Peaceful' 
                  : insights.dominantMood === 'Good' 
                  ? '🙂 Good' 
                  : insights.dominantMood === 'Average' 
                  ? '😐 Average' 
                  : insights.dominantMood === 'Bad' 
                  ? '😔 Bad' 
                  : 'No reflection logs yet'}
              </strong>
            </div>
            <div className="text-3xl">
              {insights.dominantMood === 'Peaceful' 
                ? '😌' 
                : insights.dominantMood === 'Good' 
                ? '🙂' 
                : insights.dominantMood === 'Average' 
                ? '😐' 
                : insights.dominantMood === 'Bad' 
                ? '😔' 
                : '📝'}
            </div>
          </div>
          <p className="text-[10px] text-cream-400 mt-3 leading-relaxed font-sans">
            Log your evening reflections in the Journal to see how your mood tracks with your habits.
          </p>
        </div>

        {/* Most Missed Habits */}
        <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4">
            Most Missed Habits
          </h3>
          
          {insights.mostMissed.length === 0 ? (
            <p className="text-xs text-cream-500 font-sans italic py-2">
              Nothing missed yet — beautiful.
            </p>
          ) : (
            <div className="space-y-3">
              {insights.mostMissed.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-sans">
                  <span className="text-cream-700 font-semibold">{item.name}</span>
                  <span className="bg-red-50 text-red-600 border border-red-100 font-mono font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {item.count} misses
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements / Badges system */}
        <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4">
            Achievements
          </h3>

          {insights.achievements.length === 0 ? (
            <p className="text-xs text-cream-400 font-sans italic text-center py-4">
              Earn discipline badges by building streaks.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {insights.achievements.map((badge, idx) => (
                <div
                  key={idx}
                  className={`border rounded-2xl p-3 flex flex-col items-center text-center ${
                    badgeColors[badge.id] || 'bg-cream-50 border-cream-200 text-cream-700'
                  }`}
                >
                  <span className="text-2xl mb-1">{badge.icon}</span>
                  <h4 className="font-serif text-xs font-bold leading-tight">{badge.title}</h4>
                  <p className="text-[9px] opacity-80 mt-1 leading-snug">{badge.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

        {/* Slide 2: Monthly Log */}
        <div className="w-1/2 shrink-0 px-0.5">
          <Monthly />
        </div>
      </div>
    </div>
  </div>
);
}
