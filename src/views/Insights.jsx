import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Flame, Target, DollarSign, Calendar, TrendingUp, User, Smile } from 'lucide-react';
import Monthly from './Monthly';

export default function Insights() {
  const { insights, setActiveTab } = useApp();
  const [subTab, setSubTab] = useState('overview'); // 'overview' | 'monthly'

  const ranks = React.useMemo(() => [
    {
      id: 'seed',
      title: '🌱 Seed',
      rarity: 'Common',
      description: 'Every great journey starts with one disciplined day.',
      reqDays: 0,
      reqText: 'Always unlocked',
      color: 'from-emerald-400 to-teal-500',
      shadowColor: 'rgba(16, 185, 129, 0.4)',
      bgGradient: 'from-[#070b19] to-[#0f172a]',
      reward: '✓ Default Theme & Profile Border',
      particles: '⭐',
      quote: '"A seed grows with silence, a tree falls with noise."'
    },
    {
      id: 'sprout',
      title: '🍃 Sprout',
      rarity: 'Common',
      description: 'Nurture your habits daily; a giant oak starts as a tiny sprout.',
      reqDays: 2,
      reqText: 'Reach a 2-day active streak',
      color: 'from-teal-400 to-green-500',
      shadowColor: 'rgba(34, 197, 94, 0.4)',
      bgGradient: 'from-[#041215] to-[#0b2428]',
      reward: '✓ Sprout Profile Badge',
      particles: '🍃',
      quote: '"Nurture your habits daily, they will sustain you tomorrow."'
    },
    {
      id: 'beginner_gem',
      title: '💎 Beginner Gem',
      rarity: 'Uncommon',
      description: 'Consistency is the foundation of character.',
      reqDays: 4,
      reqText: 'Reach a 4-day active streak',
      color: 'from-orange-400 to-amber-500',
      shadowColor: 'rgba(245, 158, 11, 0.4)',
      bgGradient: 'from-[#0e071b] to-[#1e1035]',
      reward: '✓ Saffron Theme & Bronze Border',
      particles: '✨',
      quote: '"Consistency is the foundation of character."'
    },
    {
      id: 'disciplined',
      title: '🛡️ Disciplined',
      rarity: 'Rare',
      description: 'Self-discipline is the bridge between goals and accomplishment.',
      reqDays: 8,
      reqText: 'Reach an 8-day active streak',
      color: 'from-blue-400 to-indigo-500',
      shadowColor: 'rgba(59, 130, 246, 0.4)',
      bgGradient: 'from-[#111827] to-[#1f2937]',
      reward: '✓ Sage Theme & Silver Border',
      particles: '🔥',
      quote: '"Self-discipline is the bridge between goals and accomplishment."'
    },
    {
      id: 'ascetic',
      title: '🏔️ Ascetic',
      rarity: 'Epic',
      description: 'The mind is a superb instrument if used rightly.',
      reqDays: 15,
      reqText: 'Reach a 15-day active streak',
      color: 'from-purple-500 to-pink-500',
      shadowColor: 'rgba(168, 85, 247, 0.4)',
      bgGradient: 'from-[#021c15] to-[#093526]',
      reward: '✓ Forest Theme & Gold Border',
      particles: '❄️',
      quote: '"Mastering others is strength; mastering yourself is true power."'
    },
    {
      id: 'monk',
      title: '🧘 Monk',
      rarity: 'Legendary',
      description: 'Quiet the mind, and the soul will speak.',
      reqDays: 21,
      reqText: 'Reach a 21-day active streak',
      color: 'from-yellow-400 to-orange-500',
      shadowColor: 'rgba(234, 88, 12, 0.4)',
      bgGradient: 'from-[#1c0d02] to-[#3a1d05]',
      reward: '✓ Monk Profile Banner & Saffron Sannyasi Theme',
      particles: '☀️',
      quote: '"True power lies in quiet control and inner silence."'
    },
    {
      id: 'master',
      title: '👑 Master of Discipline',
      rarity: 'Mythic',
      description: 'He who conquers himself is mightier than he who conquers a city.',
      reqDays: 30,
      reqText: 'Reach a 30-day active streak',
      color: 'from-pink-500 to-rose-600',
      shadowColor: 'rgba(244, 63, 94, 0.4)',
      bgGradient: 'from-[#16001e] to-[#2f003e]',
      reward: '✓ Cosmic Theme & Mythic Glowing Avatar Frame',
      particles: '🌌',
      quote: '"He who conquers himself is mightier than he who conquers a city."'
    }
  ], []);

  const currentRankIdx = React.useMemo(() => {
    if (!insights) return 0;
    const activeRankIndex = [...ranks].reverse().findIndex(r => insights.bestStreak >= r.reqDays);
    return activeRankIndex !== -1 ? (ranks.length - 1 - activeRankIndex) : 0;
  }, [insights?.bestStreak, ranks]);

  const [activeRankIdx, setActiveRankIdx] = useState(currentRankIdx);

  // Sync state on load
  React.useEffect(() => {
    setActiveRankIdx(currentRankIdx);
  }, [currentRankIdx]);

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
        {/* Achievement Rank Level Collectible Card */}
        <div 
          className="bg-white border border-sage-100 rounded-3xl p-5 shadow-premium mb-6 flex flex-col justify-between relative overflow-hidden text-sage-800 transition-all duration-500"
          style={{ minHeight: '345px' }}
        >
          {/* Subtle background leaves/stars animation layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10 select-none">
            <span className="absolute text-[10px] animate-pulse" style={{ top: '15%', left: '10%', animationDelay: '0.5s' }}>{ranks[activeRankIdx].particles}</span>
            <span className="absolute text-[10px] animate-pulse" style={{ top: '50%', left: '15%', animationDelay: '1.2s' }}>{ranks[activeRankIdx].particles}</span>
            <span className="absolute text-[10px] animate-pulse" style={{ top: '25%', right: '12%', animationDelay: '0.8s' }}>{ranks[activeRankIdx].particles}</span>
            <span className="absolute text-[10px] animate-pulse" style={{ top: '65%', right: '20%', animationDelay: '2s' }}>{ranks[activeRankIdx].particles}</span>
          </div>

          {/* Top Header Row */}
          <div className="flex items-center justify-between z-10 select-none border-b border-cream-100 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🏆</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cream-600 font-sans">Your Discipline Journey</span>
            </div>
            <span className={`text-[8px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase border ${
              ranks[activeRankIdx].rarity === 'Common' ? 'bg-zinc-50 text-zinc-500 border-zinc-100' :
              ranks[activeRankIdx].rarity === 'Uncommon' ? 'bg-blue-50 text-blue-500 border-blue-100' :
              ranks[activeRankIdx].rarity === 'Rare' ? 'bg-indigo-50 text-indigo-500 border-indigo-100' :
              ranks[activeRankIdx].rarity === 'Epic' ? 'bg-purple-50 text-purple-500 border-purple-100' :
              ranks[activeRankIdx].rarity === 'Legendary' ? 'bg-orange-50 text-orange-500 border-orange-100' :
              'bg-rose-50 text-rose-500 border-rose-100 animate-pulse'
            }`}>
              {ranks[activeRankIdx].rarity}
            </span>
          </div>

          {/* Centered Gem Display with Premium Glow */}
          <div className="my-3.5 relative flex flex-col items-center justify-center z-10">
            {/* Soft radial glow behind the gem */}
            <div 
              className="absolute w-24 h-24 rounded-full filter blur-2xl transition-all duration-500 opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${ranks[activeRankIdx].shadowColor.replace('0.4', '0.9')} 0%, transparent 70%)`
              }}
            />

            {/* Floating Gem Orb */}
            {insights.bestStreak >= ranks[activeRankIdx].reqDays ? (
              <div 
                className={`w-14 h-16 rounded-[50%_50%_50%_50%_/_45%_45%_55%_55%] bg-gradient-to-tr ${ranks[activeRankIdx].color} shadow-lg relative flex items-center justify-center animate-float`}
                style={{
                  boxShadow: `0 8px 24px -4px ${ranks[activeRankIdx].shadowColor}, inset 0 -6px 12px rgba(0,0,0,0.4)`
                }}
              >
                {/* Moving sheen sweep highlight */}
                <div className="absolute inset-0 overflow-hidden rounded-[50%_50%_50%_50%_/_45%_45%_55%_55%]">
                  <div className="absolute top-0 w-[20px] h-full bg-white/40 skew-x-[-25deg] blur-[1px] animate-sweep" />
                </div>
                {/* Highlighting reflections */}
                <div className="absolute top-1.5 left-2.5 w-1.5 h-4 bg-white/30 rounded-full rotate-[15deg] blur-[0.5px]" />
              </div>
            ) : (
              <div 
                className="w-14 h-16 rounded-[50%_50%_50%_50%_/_45%_45%_55%_55%] bg-cream-50 border border-cream-200 relative flex items-center justify-center opacity-65 animate-float"
                style={{
                  boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.1)'
                }}
              >
                <span className="text-[10px] text-cream-400">🔒</span>
              </div>
            )}

            {/* Premium Pedestal stand */}
            <div className="w-12 h-2 bg-gradient-to-r from-cream-200 via-cream-300 to-cream-200 rounded-md border-t border-cream-100 shadow-xs mt-3.5 z-10" />
          </div>

          {/* Centered Gem Details */}
          <div className="text-center z-10 space-y-1 px-4 mb-3">
            <div className="flex items-center justify-center gap-1.5">
              <h4 className="font-serif text-base font-bold text-sage-900 tracking-wide">
                {ranks[activeRankIdx].title}
              </h4>
              <span className="text-[9px] bg-cream-100 px-2 py-0.5 rounded-md text-sage-700 font-semibold font-mono">
                Level {activeRankIdx + 1}
              </span>
            </div>
            <p className="text-[10px] text-cream-600 leading-relaxed italic max-w-xs mx-auto">
              {ranks[activeRankIdx].quote}
            </p>
          </div>

          {/* XP progress metrics (Surface integrated) */}
          {(() => {
            const hasNextRank = activeRankIdx + 1 < ranks.length;
            const nextRank = hasNextRank ? ranks[activeRankIdx + 1] : null;
            
            const targetXP = 600;
            const ratio = Math.min(1, insights.bestStreak / (nextRank?.reqDays || 30));
            const currentXP = Math.round(ratio * 520) + 40;
            const neededXP = targetXP - currentXP;
            const xpPercent = Math.round((currentXP / targetXP) * 100);

            return (
              <div className="space-y-1.5 z-10 px-4 mb-3.5">
                <div className="flex justify-between text-[9px] font-bold tracking-wider uppercase text-cream-500">
                  <span>Progression</span>
                  <span className="font-mono text-sage-800">{currentXP} / {targetXP} XP ({xpPercent}%)</span>
                </div>
                <div className="w-full bg-cream-50 h-2 rounded-full overflow-hidden border border-cream-150">
                  <div 
                    className={`h-full bg-gradient-to-r ${ranks[activeRankIdx].color} transition-all duration-500`}
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] text-cream-500 font-sans">
                  <span>
                    {hasNextRank ? `${neededXP} XP to reach ${nextRank.title.split(' ').slice(1).join(' ')}` : 'Max Milestone Reached!'}
                  </span>
                  {hasNextRank && (
                    <span className="font-bold text-orange-600">
                      ({nextRank.reqDays - insights.bestStreak} days left)
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Rewards details (Surface Integrated) */}
          <div className="border-t border-cream-100 pt-2 flex items-center justify-between text-[9px] text-cream-700 px-4 mb-3 z-10">
            <span className="flex items-center gap-1.5">
              <span>🎁 Reward:</span>
              <span className="font-semibold text-sage-600">{ranks[activeRankIdx].reward}</span>
            </span>
            <span className="text-[8px] text-cream-500 font-semibold font-mono uppercase tracking-wider">
              {insights.bestStreak >= ranks[activeRankIdx].reqDays ? 'Claimed ✓' : 'Locked 🔒'}
            </span>
          </div>

          {/* Interactive Duolingo style Visual Journey Track */}
          <div className="relative flex items-center justify-between w-full px-4 mt-1.5 mb-1.5 select-none z-10">
            {/* Track line background */}
            <div className="absolute top-[50%] left-6 right-6 h-[2px] bg-cream-100 z-0 pointer-events-none" />
            
            {/* Progress line fill */}
            <div 
              className="absolute top-[50%] left-6 h-[2px] bg-sage-500 z-0 pointer-events-none transition-all duration-500" 
              style={{
                width: `calc(${(currentRankIdx / (ranks.length - 1)) * 100}% - ${currentRankIdx === 0 ? 0 : 8}px)`
              }}
            />

            {ranks.map((r, idx) => {
              const isUnlocked = insights.bestStreak >= r.reqDays;
              const isActive = idx === activeRankIdx;
              const isCurrent = idx === currentRankIdx;
              
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveRankIdx(idx);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-sm border-2 transition-all duration-300 relative focus:outline-none z-10 ${
                    isActive 
                      ? 'bg-sage-600 border-sage-600 text-white scale-120 ring-4 ring-sage-100 shadow-md'
                      : isUnlocked
                      ? `bg-sage-50 border-sage-200 text-sage-700 hover:scale-110`
                      : 'bg-cream-50 border-cream-100 text-cream-400 hover:scale-105'
                  } ${isCurrent && !isActive ? 'ring-2 ring-orange-400 animate-pulse' : ''}`}
                >
                  <span className="text-[11px]">{r.title.split(' ')[0]}</span>
                  
                  {/* Under-node You are here tag */}
                  {isCurrent && (
                    <span className="absolute bottom-[-14px] text-[6px] uppercase tracking-wider font-bold text-orange-600 block whitespace-nowrap bg-orange-50 px-1 py-0.5 rounded-sm shadow-xs border border-orange-100">
                      Here
                    </span>
                  )}
                </button>
              );
            })}
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
