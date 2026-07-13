import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, ChevronLeft, ChevronRight, Check, X, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';

export default function Monthly() {
  const { challenges, apiFetch, refreshData, user } = useApp();
  
  // Current Date defaults
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-indexed: 1-12
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Editing state
  const [editingCell, setEditingCell] = useState(null); // { challenge, dateStr, currentStatus }
  const [newStatus, setNewStatus] = useState(''); // 'completed' | 'missed' | 'clear'
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const months = [
    { val: 1, name: 'January' },
    { val: 2, name: 'February' },
    { val: 3, name: 'March' },
    { val: 4, name: 'April' },
    { val: 5, name: 'May' },
    { val: 6, name: 'June' },
    { val: 7, name: 'July' },
    { val: 8, name: 'August' },
    { val: 9, name: 'September' },
    { val: 10, name: 'October' },
    { val: 11, name: 'November' },
    { val: 12, name: 'December' }
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const daysCount = getDaysInMonth(selectedYear, selectedMonth);
  const datesArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  const restarts = React.useMemo(() => {
    try {
      return user?.restarts ? JSON.parse(user.restarts) : [];
    } catch (e) {
      return [];
    }
  }, [user?.restarts]);

  const getIsRestartDay = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return restarts.includes(dateStr);
  };

  const fetchMonthlyCheckins = async () => {
    setLoading(true);
    setError(null);
    try {
      const yearMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      const data = await apiFetch(`/api/checkins/monthly/${yearMonthStr}`);
      setCheckins(data || []);
    } catch (err) {
      console.error(err);
      setError('Could not load monthly logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyCheckins();
  }, [selectedYear, selectedMonth]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const isDateInChallengeRange = (challenge, day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cellDate = new Date(dateStr + 'T00:00:00');
    
    const start = new Date(challenge.startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(challenge.endDate);
    end.setHours(23, 59, 59, 999);
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return cellDate >= start && cellDate <= end && cellDate <= today;
  };

  // Helper: map challenge + day to check-in status
  const getCellStatus = (challengeId, day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const match = checkins.find(c => c.challengeId === challengeId && c.date === dateStr);
    return match ? match : null;
  };

  const handleCellClick = (challenge, day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const checkin = getCellStatus(challenge.id, day);
    setEditingCell({ challenge, dateStr, checkin });
    setNewStatus(checkin ? checkin.status : 'clear');
    setReason(checkin?.reason || '');
  };

  const handleSaveCell = async () => {
    if (!editingCell) return;
    setSaving(true);
    try {
      if (newStatus === 'clear') {
        // Delete check-in
        await apiFetch(`/api/checkins/${editingCell.challenge.id}/${editingCell.dateStr}`, {
          method: 'DELETE'
        });
      } else {
        // Create or update check-in
        await apiFetch('/api/checkins', {
          method: 'POST',
          body: JSON.stringify({
            challengeId: editingCell.challenge.id,
            date: editingCell.dateStr,
            status: newStatus,
            reason: newStatus === 'missed' ? reason : undefined
          })
        });
      }
      
      // Refresh AppContext and local logs
      await refreshData();
      await fetchMonthlyCheckins();
      setEditingCell(null);
    } catch (err) {
      console.error(err);
      alert('Could not update log: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Calculations for Analytics Summary at Bottom ---
  const challengeStats = challenges.map(ch => {
    const chCheckins = checkins.filter(c => c.challengeId === ch.id);
    const completedCount = chCheckins.filter(c => c.status === 'completed').length;
    const missedCount = chCheckins.filter(c => c.status === 'missed').length;
    const totalLogged = chCheckins.length;
    const successRate = totalLogged > 0 ? Math.round((completedCount / totalLogged) * 100) : 0;
    
    return {
      id: ch.id,
      title: ch.title,
      icon: ch.icon || '🎯',
      completedCount,
      missedCount,
      totalLogged,
      successRate
    };
  });

  // Identify Strongest vs Weakest habits
  const activeStats = challengeStats.filter(c => c.totalLogged > 0);
  let strongest = null;
  let weakest = null;

  if (activeStats.length > 0) {
    // Sort by success rate
    const sorted = [...activeStats].sort((a, b) => b.successRate - a.successRate);
    strongest = sorted[0];
    weakest = sorted[sorted.length - 1];
  }

  return (
    <div className="flex flex-col font-sans">
      
      {/* Month Navigation Selector Bar */}
      <div className="flex justify-between items-center bg-white border border-sage-100 rounded-3xl p-4 shadow-sm mb-6 mt-2">
        <button 
          onClick={handlePrevMonth}
          className="p-2 hover:bg-cream-50 active:scale-95 rounded-xl transition-all border border-cream-100 text-sage-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="font-serif text-base font-semibold text-sage-900 leading-snug">
            {months[selectedMonth - 1].name} {selectedYear}
          </span>
          <span className="text-[9px] text-cream-500 font-bold uppercase tracking-widest font-sans mt-0.5">
            Analysis grid
          </span>
        </div>

        <button 
          onClick={handleNextMonth}
          className="p-2 hover:bg-cream-50 active:scale-95 rounded-xl transition-all border border-cream-100 text-sage-800"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Loader / Error alerts */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-2 text-cream-500 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-sage-500" />
          <span>Synchronizing logs...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-xs p-4 rounded-2xl mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Spreadsheet Tabular Grid */}
      {!loading && !error && (
        <div className="bg-white border border-sage-100 rounded-3xl p-5 shadow-premium mb-6">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 border-b border-cream-50 pb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sage-500" />
            <span>Monthly Grid Sheet</span>
          </h3>

          {challenges.length === 0 ? (
            <p className="text-xs text-cream-400 font-sans italic text-center py-8">
              No active challenges. Add challenges to see history grid.
            </p>
          ) : (
            <div className="w-full overflow-x-auto border border-cream-150 rounded-2xl">
              <table className="w-full text-left border-collapse table-fixed select-none">
                <thead>
                  <tr className="bg-cream-50/50 border-b border-cream-150 text-[10px] text-cream-600 font-bold uppercase tracking-wider">
                    <th className="bg-cream-50 border-r border-cream-150 p-2.5 w-[110px] min-w-[110px] text-[9px]">
                      Challenge
                    </th>
                    {datesArray.map(day => {
                      const isRestart = getIsRestartDay(day);
                      return (
                        <th 
                          key={day} 
                          className={`p-2 border-r border-cream-150 text-center w-9 min-w-[36px] ${
                            isRestart ? 'border-l-2 border-l-rose-500 font-extrabold bg-rose-50/50 text-rose-700' : ''
                          }`}
                        >
                          {day}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {challenges.map(ch => (
                    <tr key={ch.id} className="border-b border-cream-100 hover:bg-cream-50/20 text-xs transition-colors">
                      <td className="bg-white border-r border-cream-150 p-2.5 font-semibold text-sage-900 flex items-center gap-1.5 truncate">
                        <span className="text-sm">{ch.icon || '🎯'}</span>
                        <span className="truncate">{ch.title}</span>
                      </td>
                      {datesArray.map(day => {
                        const cell = getCellStatus(ch.id, day);
                        const inRange = isDateInChallengeRange(ch, day);
                        const isRestart = getIsRestartDay(day);
                        return (
                          <td 
                            key={day}
                            onClick={() => inRange && handleCellClick(ch, day)}
                            className={`p-1 border-r border-cream-100 text-center transition-all w-9 h-10 align-middle ${
                              inRange 
                                ? 'cursor-pointer hover:bg-cream-50 active:scale-95' 
                                : 'bg-gray-100 text-gray-400/60 cursor-not-allowed'
                            } ${
                              isRestart ? 'border-l-2 border-l-rose-500 bg-rose-50/20' : ''
                            }`}
                          >
                            <div className="w-full h-full flex items-center justify-center rounded-lg">
                              {cell ? (
                                cell.status === 'completed' ? (
                                  <span className="text-emerald-600 bg-emerald-50 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] border border-emerald-100/50">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="text-rose-600 bg-rose-50 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] border border-rose-100/50">
                                    ✕
                                  </span>
                                )
                              ) : (
                                <span className="text-cream-300 font-semibold">—</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-[9px] text-cream-400 font-sans mt-3 text-center italic">
            💡 Tap on any cell to log or adjust that day's challenge response.
          </p>
        </div>
      )}

      {/* Visual Analytics Summary & charts */}
      {!loading && !error && activeStats.length > 0 && (
        <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sage-500" />
            <span>Monthly Performance Chart</span>
          </h3>

          {/* Inner scroll wrapper encompassing both progress bars and recommendation alert box */}
          <div className="max-h-[300px] overflow-y-auto space-y-5 pr-1.5 font-sans">
            {/* SVG Progress Bars */}
            <div className="space-y-4 text-xs">
              {activeStats.map(stat => (
                <div key={stat.id} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-sage-800 flex items-center gap-1">
                      <span>{stat.icon}</span>
                      <span>{stat.title}</span>
                    </span>
                    <span className="font-bold text-sage-600">{stat.successRate}% Success</span>
                  </div>
                  
                  {/* Horizontal Progress Track */}
                  <div className="w-full bg-cream-50 border border-cream-200 rounded-full h-3 flex overflow-hidden">
                    <div 
                      style={{ width: `${stat.successRate}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        stat.successRate > 70 
                          ? 'bg-sage-500' 
                          : stat.successRate > 40 
                          ? 'bg-sage-350' 
                          : 'bg-rose-400'
                      }`}
                    />
                  </div>
                  
                  <div className="flex justify-between text-[9px] text-cream-400 font-semibold font-mono">
                    <span>{stat.completedCount} completed</span>
                    <span>{stat.totalLogged} days tracked</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Suggestion Focus alert */}
            <div className="bg-sage-50/40 border border-sage-100 rounded-2xl p-4 text-xs text-sage-800 space-y-2">
              <h4 className="font-serif font-bold text-sage-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <span>🎯 Focus Area Recommendations</span>
              </h4>
              
              {strongest && (
                <p className="leading-relaxed">
                  🎉 Your strongest habit this month is <strong>{strongest.icon} {strongest.title}</strong> with a solid <strong>{strongest.successRate}%</strong> completion score! Keep that streak alive.
                </p>
              )}
              
              {weakest && weakest.successRate < 70 ? (
                <p className="border-t border-cream-100/50 pt-2 mt-2 leading-relaxed text-rose-800">
                  ⚡ <strong>Needs Work:</strong> You are experiencing friction with <strong>{weakest.icon} {weakest.title}</strong> (only <strong>{weakest.successRate}%</strong> completion). Consider setting an alarm or writing a clearer motivation on why you started it!
                </p>
              ) : weakest && (
                <p className="border-t border-cream-100/50 pt-2 mt-2 leading-relaxed text-sage-800 font-semibold">
                  ✨ Incredible work! All of your active challenges are tracking above 70% success rates. You are building ultimate consistency.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editing Cell Popover Modal */}
      {editingCell && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-sage-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-left relative animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-serif text-lg font-bold text-sage-900 pr-8">
              Update Challenge Log
            </h4>
            <p className="text-xs text-cream-500 font-sans mt-0.5">
              Change status for {new Date(editingCell.dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <button 
              onClick={() => setEditingCell(null)}
              className="absolute right-5 top-5 p-1 text-cream-400 hover:text-cream-600 rounded-xl"
              disabled={saving}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="my-5 space-y-4">
              <div className="flex items-center gap-2 p-3 bg-cream-50/50 border border-cream-100 rounded-2xl text-xs font-sans">
                <span className="text-2xl">{editingCell.challenge.icon || '🎯'}</span>
                <div>
                  <strong className="text-sage-900 block font-semibold">{editingCell.challenge.title}</strong>
                  <span className="text-cream-500 text-[10px]">Penalty: ₹{editingCell.challenge.penaltyAmount}</span>
                </div>
              </div>

              {/* Toggling Selection Buttons */}
              <div className="flex gap-2">
                {[
                  { label: 'Completed', val: 'completed', bg: 'bg-emerald-500 text-white', inactive: 'bg-cream-50/50 border-cream-200 text-emerald-700 hover:bg-emerald-50' },
                  { label: 'Missed', val: 'missed', bg: 'bg-rose-500 text-white', inactive: 'bg-cream-50/50 border-cream-200 text-rose-700 hover:bg-rose-50' },
                  { label: 'Clear log', val: 'clear', bg: 'bg-sage-600 text-white', inactive: 'bg-cream-50/50 border-cream-200 text-cream-600 hover:bg-cream-100' }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setNewStatus(opt.val)}
                    disabled={saving}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold font-sans transition-all active:scale-[0.98] ${
                      newStatus === opt.val
                        ? opt.bg + ' border-transparent shadow-sm'
                        : opt.inactive
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Missing Reason Text input */}
              {newStatus === 'missed' && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-cream-500 uppercase tracking-wider ml-1">
                    Reason for missing (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Woke up late, busy day..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={saving}
                    className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 font-sans"
                  />
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                disabled={saving}
                className="px-4 py-2 border border-cream-250 text-cream-600 font-semibold text-xs rounded-xl hover:bg-cream-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCell}
                disabled={saving}
                className="px-5 py-2 bg-sage-500 hover:bg-sage-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Log</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
