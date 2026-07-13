import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Flame, Target, DollarSign, Calendar, TrendingUp, User, Smile } from 'lucide-react';
import Monthly from './Monthly';

export default function Insights() {
  const { insights, setActiveTab } = useApp();
  const [subTab, setSubTab] = useState('overview'); // 'overview' | 'monthly'

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

    <div className="flex-1 w-full pb-10">
      {subTab === 'overview' ? (
        <div className="w-full px-0.5">
        {/* Achievement Rank Level Horizontal Scroll Carousel */}
        <div className="mb-6 w-full overflow-hidden">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-bold text-cream-600 uppercase tracking-wider block">
              Discipline Rank Gallery
            </span>
            <span className="text-[10px] text-cream-400 font-sans">
              Swipe to explore ranks →
            </span>
          </div>

          <div 
            className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 px-1 scrollbar-none"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {(() => {
              const ranks = [
                {
                  id: 'beginner',
                  title: 'Beginner Gem',
                  description: 'Every great journey starts with a single step. Welcome to Sadhna.',
                  reqDays: 0,
                  reqText: 'Always unlocked',
                  color: 'from-emerald-400 to-teal-500',
                  shadowColor: 'rgba(16, 185, 129, 0.5)',
                  ownedRate: '99%'
                },
                {
                  id: 'consistent',
                  title: 'Consistent Gem',
                  description: 'A string of focus. Your habits are starting to settle.',
                  reqDays: 4,
                  reqText: 'Reach a 4-day active streak',
                  color: 'from-orange-400 to-amber-500',
                  shadowColor: 'rgba(245, 158, 11, 0.5)',
                  ownedRate: '88%'
                },
                {
                  id: 'disciplined',
                  title: 'Disciplined Gem',
                  description: 'Forging steel. Consistency is becoming your nature.',
                  reqDays: 8,
                  reqText: 'Reach an 8-day active streak',
                  color: 'from-blue-400 to-indigo-500',
                  shadowColor: 'rgba(59, 130, 246, 0.5)',
                  ownedRate: '54%'
                },
                {
                  id: 'master',
                  title: 'Master Gem',
                  description: 'Unbreakable focus. You have mastered your daily mind.',
                  reqDays: 15,
                  reqText: 'Reach a 15-day active streak',
                  color: 'from-purple-500 to-pink-500',
                  shadowColor: 'rgba(168, 85, 247, 0.5)',
                  ownedRate: '12%'
                }
              ];

              return ranks.map((r) => {
                const isUnlocked = insights.bestStreak >= r.reqDays;
                return (
                  <div 
                    key={r.id}
                    className="w-[260px] shrink-0 snap-center bg-gradient-to-b from-[#0c0e12] to-[#141820] text-white rounded-3xl p-5 border border-sage-800/10 shadow-xl flex flex-col justify-between relative overflow-hidden"
                    style={{ minHeight: '320px' }}
                  >
                    {/* Cave background light effect */}
                    <div className="absolute top-[-30px] left-[50%] transform translate-x-[-50%] w-[160px] h-[160px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Top info */}
                    <div className="text-center z-10">
                      <h3 className="font-serif text-sm font-bold tracking-tight">{r.title}</h3>
                      <p className="text-[9px] text-zinc-400 leading-normal mt-1 px-1">{r.description}</p>
                      
                      {/* Owned percentage badge */}
                      <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 mt-2 text-[8px] text-sky-300 font-sans font-medium">
                        <span>👥 Owned by {r.ownedRate}</span>
                      </div>
                    </div>

                    {/* Center Gem Display */}
                    <div className="my-5 relative flex flex-col items-center justify-center z-10">
                      {/* Gem stand shadow */}
                      <div className="absolute bottom-[-4px] w-16 h-8 bg-black/60 rounded-full blur-sm" />

                      {/* Gem sphere */}
                      {isUnlocked ? (
                        <div 
                          className={`w-16 h-20 rounded-[50%_50%_50%_50%_/_45%_45%_55%_55%] bg-gradient-to-tr ${r.color} shadow-2xl relative animate-pulse flex items-center justify-center`}
                          style={{
                            boxShadow: `0 0 25px ${r.shadowColor}, inset 0 -8px 15px rgba(0,0,0,0.4)`,
                            animationDuration: '3s'
                          }}
                        >
                          {/* Highlighting sheen reflections */}
                          <div className="absolute top-2 left-3.5 w-3 h-6 bg-white/30 rounded-full rotate-[15deg] blur-[1px]" />
                          <div className="absolute bottom-2 right-3.5 w-1.5 h-3 bg-white/20 rounded-full rotate-[15deg] blur-[1px]" />
                        </div>
                      ) : (
                        <div 
                          className="w-16 h-20 rounded-[50%_50%_50%_50%_/_45%_45%_55%_55%] bg-zinc-800/70 border border-zinc-700 relative flex items-center justify-center opacity-60 filter blur-[0.5px]"
                          style={{
                            boxShadow: 'inset 0 -8px 15px rgba(0,0,0,0.6)'
                          }}
                        >
                          {/* Lock Icon */}
                          <span className="text-base">🔒</span>
                        </div>
                      )}

                      {/* Stone pedestal stand */}
                      <div className="w-14 h-2.5 bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-700 rounded-md shadow-md border-t border-zinc-600/50 mt-2.5" />
                    </div>

                    {/* Bottom validation status */}
                    <div className="text-center z-10 mt-auto">
                      {isUnlocked ? (
                        <div className="flex items-center justify-center gap-1.5 text-[9px] text-emerald-400 font-semibold font-sans">
                          <span>✓ Unlocked</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Milestone</span>
                          <span className="text-[9px] text-amber-400 font-semibold font-sans">{r.reqText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
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
      ) : (
        <div className="w-full px-0.5">
          <Monthly />
        </div>
      )}
    </div>
  </div>
);
}
