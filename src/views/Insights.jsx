import React from 'react';
import { useApp } from '../context/AppContext';
import { Award, Flame, Target, DollarSign, Calendar, TrendingUp, User } from 'lucide-react';

export default function Insights() {
  const { insights, setActiveTab } = useApp();

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
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-10 h-10 rounded-full border border-cream-300 bg-white flex items-center justify-center text-sage-600 hover:bg-cream-50 transition-colors shadow-sm"
        >
          <User className="w-5 h-5" />
        </button>
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
          <span>Last 7 Days</span>
        </h3>

        {/* Custom SVG Bar Chart */}
        <div className="relative h-[160px] w-full pt-4 font-sans text-[10px]">
          {/* Y-axis Guideline markers */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-cream-300 pr-1 select-none">
            <div className="border-b border-dashed border-cream-100 w-full text-right pb-1">100%</div>
            <div className="border-b border-dashed border-cream-100 w-full text-right pb-1">50%</div>
            <div className="border-b border-dashed border-cream-100 w-full text-right pb-1">0%</div>
          </div>

          {/* Bar Chart Container */}
          <div className="absolute inset-0 flex justify-between items-end px-6 pt-3">
            {insights.last7Days.map((dayItem, idx) => {
              // Calculate percentage height
              const heightPct = dayItem.rate;
              const barHeight = `${Math.max(5, heightPct)}%`;
              
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-sage-800 text-white rounded px-2 py-0.5 text-[9px] absolute mb-12 transform -translate-y-8 pointer-events-none font-mono">
                    {dayItem.rate}% ({dayItem.completed} check-ins)
                  </div>
                  
                  {/* Visual Bar */}
                  <div 
                    style={{ height: barHeight }}
                    className={`w-4 rounded-full transition-all duration-300 ${
                      heightPct > 70 
                        ? 'bg-sage-500 group-hover:bg-sage-600' 
                        : heightPct > 30 
                        ? 'bg-sage-300 group-hover:bg-sage-400'
                        : heightPct > 0
                        ? 'bg-red-300 group-hover:bg-red-400'
                        : 'bg-cream-200'
                    }`}
                  />
                  {/* Label */}
                  <span className="text-[10px] text-cream-500 font-semibold mt-2">
                    {dayItem.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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
  );
}
