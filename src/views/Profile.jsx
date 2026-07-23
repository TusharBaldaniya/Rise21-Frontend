import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, LogOut, Calendar, Shield, Award, Sparkles, Smartphone, Download, Bell, RefreshCw, X, ChevronLeft, ChevronRight, Sliders, Columns, Maximize2 } from 'lucide-react';

export default function Profile() {
  const {
    user,
    logout,
    challenges,
    wallet,
    insights,
    isInstallable,
    isIOS,
    isStandalone,
    triggerPwaInstall,
    apiFetch,
    getTodayDateString,
    remindersEnabled,
    reminderTime,
    updateReminderSettings,
    sendTestNotification,
    restartSession,
    enableBiometrics,
    setShowTour,
    exportUserDataCSV
  } = useApp();

  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    if (!('Notification' in window)) return;
    
    const updatePermission = () => {
      setNotificationPermissionStatus(Notification.permission);
    };

    window.addEventListener('focus', updatePermission);
    return () => window.removeEventListener('focus', updatePermission);
  }, []);

  const handleToggleReminders = () => {
    const nextVal = !remindersEnabled;
    if (nextVal && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermissionStatus(permission);
        if (permission === 'granted') {
          updateReminderSettings(true, reminderTime);
        } else {
          updateReminderSettings(false, reminderTime);
          if (permission === 'denied') {
            alert('Notification permissions are blocked. Please enable them in browser settings.');
          }
        }
      });
    } else {
      updateReminderSettings(nextVal, reminderTime);
    }
  };

  const handleTimeChange = (newTime) => {
    updateReminderSettings(remindersEnabled, newTime);
  };

  const [selfies, setSelfies] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Lightbox & Transformation State
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [showTransformationModal, setShowTransformationModal] = useState(false);
  const [compareIdx1, setCompareIdx1] = useState(0);
  const [compareIdx2, setCompareIdx2] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [comparisonMode, setComparisonMode] = useState('slider'); // 'slider' | 'side-by-side'

  const fetchSelfies = async () => {
    try {
      const data = await apiFetch('/api/selfies');
      setSelfies(data);
      if (data && data.length > 0) {
        setCompareIdx1(0);
        setCompareIdx2(data.length - 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSelfies();
  }, []);

  const handleSelfieChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const size = 300; 
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        try {
          await apiFetch('/api/selfies', {
            method: 'POST',
            body: JSON.stringify({
              date: getTodayDateString(),
              imageBlob: compressedBase64
            })
          });
          await fetchSelfies();
        } catch (err) {
          console.error(err);
          alert('Could not upload selfie: ' + err.message);
        } finally {
          setUploading(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  const joinedDate = new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-24 pt-4 font-serif text-sage-900 bg-cream-100">
      
      {/* User Header */}
      <div className="flex flex-col items-center text-center my-6 bg-white border border-sage-100 rounded-3xl p-6 shadow-premium">
        <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center border-2 border-sage-400 mb-3 text-sage-600 font-serif font-bold text-2xl shadow-sm">
          {user.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        
        <h2 className="font-serif text-xl font-bold text-sage-800">
          {user.name}
        </h2>
        <p className="text-xs text-cream-500 font-sans mt-1">
          @{user.username}
        </p>
        
        <div className="flex items-center gap-1.5 text-xs text-cream-400 font-sans mt-4">
          <Calendar className="w-3.5 h-3.5 text-sage-400" />
          <span>Joined in {joinedDate}</span>
        </div>
      </div>

      {/* 📸 Journey Gallery */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <div className="flex justify-between items-center mb-4 border-b border-cream-50 pb-2 flex-wrap gap-2">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-sage-500" />
            <span>📸 Journey Gallery</span>
          </h3>
          <div className="flex items-center gap-2">
            {selfies.length > 0 && (
              <button
                onClick={() => {
                  setCompareIdx1(0);
                  setCompareIdx2(Math.max(0, selfies.length - 1));
                  setShowTransformationModal(true);
                }}
                className="bg-cream-100 hover:bg-cream-200 text-sage-800 font-semibold py-1.5 px-3 rounded-xl text-[10px] transition-all flex items-center gap-1.5 border border-cream-200 active:scale-95 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                <span>Transformation View</span>
              </button>
            )}
            <label className={`cursor-pointer bg-sage-500 hover:bg-sage-600 text-white font-semibold py-1.5 px-3 rounded-xl text-[10px] transition-all flex items-center gap-1 shadow-sm active:scale-95 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span>{uploading ? 'Uploading...' : 'Capture Selfie'}</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="user" 
                className="hidden" 
                onChange={handleSelfieChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {selfies.length === 0 ? (
          <p className="text-xs text-cream-400 font-sans italic text-center py-6 leading-relaxed">
            No selfies captured yet. Capture a daily selfie to track your 21-day transformation!
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 pr-1">
            {selfies.map((s, idx) => (
              <div key={s.id} className="flex flex-col items-center">
                <div 
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className="w-full aspect-square rounded-2xl overflow-hidden border border-cream-200 shadow-sm relative group bg-cream-50 cursor-pointer hover:border-sage-400 hover:shadow-md transition-all"
                >
                  <img 
                    src={s.imageBlob} 
                    alt={`Day ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200 text-white gap-1">
                    <Maximize2 className="w-4 h-4 text-white drop-shadow-md" />
                    <span className="text-[9px] text-white font-semibold font-mono">
                      {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-cream-500 font-semibold mt-1 font-sans">
                  Day {idx + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔍 FULL-SIZE PHOTO LIGHTBOX MODAL */}
      {selectedPhotoIndex !== null && selfies[selectedPhotoIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn font-sans">
          {/* Header */}
          <div className="w-full max-w-lg flex justify-between items-center text-white py-2">
            <div className="flex items-center gap-2">
              <span className="bg-sage-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full font-mono shadow-sm">
                Day {selectedPhotoIndex + 1}
              </span>
              <span className="text-xs text-cream-300 font-mono">
                {new Date(selfies[selectedPhotoIndex].date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Photo Area */}
          <div className="relative w-full max-w-lg flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={selfies[selectedPhotoIndex].imageBlob}
              alt={`Day ${selectedPhotoIndex + 1}`}
              className="max-h-[70vh] max-w-full object-contain rounded-3xl shadow-2xl border border-white/10"
            />

            {/* Nav Arrows */}
            {selectedPhotoIndex > 0 && (
              <button
                onClick={() => setSelectedPhotoIndex(prev => prev - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all border border-white/10 active:scale-95 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {selectedPhotoIndex < selfies.length - 1 && (
              <button
                onClick={() => setSelectedPhotoIndex(prev => prev + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all border border-white/10 active:scale-95 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Footer Controls */}
          <div className="w-full max-w-lg flex flex-col items-center gap-3">
            <div className="text-xs text-cream-300 font-mono">
              {selectedPhotoIndex + 1} of {selfies.length} Photos
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCompareIdx1(0);
                  setCompareIdx2(selectedPhotoIndex);
                  setSelectedPhotoIndex(null);
                  setShowTransformationModal(true);
                }}
                className="bg-sage-500 hover:bg-sage-600 text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Compare with Day 1</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✨ TRANSFORMATION COMPARISON MODAL */}
      {showTransformationModal && selfies.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto animate-fadeIn font-sans">
          {/* Modal Header */}
          <div className="w-full max-w-xl flex justify-between items-center text-white pb-3 border-b border-white/10 mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>21-Day Transformation</span>
              </h3>
              <p className="text-[11px] text-cream-300 font-sans">
                Observe your identity shift and physical consistency
              </p>
            </div>
            <button
              onClick={() => setShowTransformationModal(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls: Mode Switcher & Date Pickers */}
          <div className="w-full max-w-xl bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 space-y-3">
            {/* View Mode Tabs */}
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-xs text-cream-300 font-semibold uppercase tracking-wider">Comparison Mode</span>
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setComparisonMode('slider')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                    comparisonMode === 'slider' ? 'bg-sage-500 text-white shadow-md' : 'text-cream-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Split Slider</span>
                </button>
                <button
                  onClick={() => setComparisonMode('side-by-side')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                    comparisonMode === 'side-by-side' ? 'bg-sage-500 text-white shadow-md' : 'text-cream-400 hover:text-white'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Side by Side</span>
                </button>
              </div>
            </div>

            {/* Photo Pickers */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="text-[10px] text-cream-400 block mb-1 font-semibold uppercase">Initial Photo (Before)</label>
                <select
                  value={compareIdx1}
                  onChange={(e) => setCompareIdx1(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-sage-400 font-mono text-xs"
                >
                  {selfies.map((s, i) => (
                    <option key={s.id} value={i} className="bg-slate-900 text-white">
                      Day {i + 1} — {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-cream-400 block mb-1 font-semibold uppercase">Current Photo (After)</label>
                <select
                  value={compareIdx2}
                  onChange={(e) => setCompareIdx2(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-sage-400 font-mono text-xs"
                >
                  {selfies.map((s, i) => (
                    <option key={s.id} value={i} className="bg-slate-900 text-white">
                      Day {i + 1} — {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Visualizer Area */}
          <div className="w-full max-w-xl flex flex-col items-center my-2">
            {selfies[compareIdx1] && selfies[compareIdx2] && (
              <>
                {comparisonMode === 'slider' ? (
                  /* SPLIT SLIDER VIEW */
                  <div className="relative w-full aspect-square max-h-[55vh] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 select-none bg-black">
                    {/* Before Image (Background - Right side visible) */}
                    <img
                      src={selfies[compareIdx2].imageBlob}
                      alt={`Day ${compareIdx2 + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* After Image (Clipped Left side) */}
                    <img
                      src={selfies[compareIdx1].imageBlob}
                      alt={`Day ${compareIdx1 + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
                      }}
                    />

                    {/* Slider Line & Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] z-20 pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-sage-800 font-bold text-xs flex items-center justify-center shadow-2xl border-2 border-sage-500">
                        <Sliders className="w-4 h-4 text-sage-700" />
                      </div>
                    </div>

                    {/* Transparent Range Input Overlay */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                    />

                    {/* Corner Labels */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-white font-mono font-semibold pointer-events-none z-10">
                      Day {compareIdx1 + 1} (Start)
                    </div>
                    <div className="absolute top-3 right-3 bg-sage-600/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-white font-mono font-semibold pointer-events-none z-10">
                      Day {compareIdx2 + 1} (Latest)
                    </div>
                    <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none z-10">
                      <span className="bg-black/70 backdrop-blur-md text-[10px] text-cream-300 font-sans px-3 py-1 rounded-full border border-white/10">
                        👈 Drag horizontally to compare 👉
                      </span>
                    </div>
                  </div>
                ) : (
                  /* SIDE BY SIDE VIEW */
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="flex flex-col items-center bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 border border-white/10">
                        <img
                          src={selfies[compareIdx1].imageBlob}
                          alt={`Day ${compareIdx1 + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded-md">
                          Start
                        </span>
                      </div>
                      <span className="text-white font-semibold text-xs font-serif">Day {compareIdx1 + 1}</span>
                      <span className="text-cream-400 text-[10px] font-mono">
                        {new Date(selfies[compareIdx1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex flex-col items-center bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 border border-white/10">
                        <img
                          src={selfies[compareIdx2].imageBlob}
                          alt={`Day ${compareIdx2 + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-sage-500 text-white text-[9px] font-mono px-2 py-0.5 rounded-md">
                          Current
                        </span>
                      </div>
                      <span className="text-white font-semibold text-xs font-serif">Day {compareIdx2 + 1}</span>
                      <span className="text-cream-400 text-[10px] font-mono">
                        {new Date(selfies[compareIdx2].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Transformation Stats Card */}
          <div className="w-full max-w-xl bg-sage-900/60 border border-sage-500/30 rounded-2xl p-4 mt-2 text-center text-xs font-sans">
            <div className="flex justify-around items-center divide-x divide-white/10 text-white">
              <div>
                <span className="text-[10px] text-cream-400 block uppercase">Days Elapsed</span>
                <span className="font-mono text-base font-bold text-amber-300">
                  {selfies[compareIdx1] && selfies[compareIdx2]
                    ? Math.max(1, Math.round(Math.abs(new Date(selfies[compareIdx2].date) - new Date(selfies[compareIdx1].date)) / (1000 * 60 * 60 * 24)))
                    : 1} Days
                </span>
              </div>
              <div className="pl-4">
                <span className="text-[10px] text-cream-400 block uppercase">Total Selfies Logged</span>
                <span className="font-mono text-base font-bold text-sage-300">
                  {selfies.length} Photos
                </span>
              </div>
            </div>
            <p className="text-[11px] text-cream-300 italic mt-2">
              "Consistency builds character. Look how far you have come." 🌟
            </p>
          </div>
        </div>
      )}

      {/* 🏅 Achievement Badges & Milestones */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 border-b border-cream-50 pb-2 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-sage-500" />
          <span>Achievement Badges</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-sans">
          {(() => {
            const currentStreak = insights?.currentStreak || 0;
            const bestStreak = insights?.bestStreak || 0;
            const totalSelfies = selfies.length;

            const badgeDefinitions = [
              { id: '7day', title: '7-Day Warrior', icon: '🥉', desc: '7-day streak', unlocked: bestStreak >= 7, progress: `${Math.min(bestStreak, 7)}/7d` },
              { id: '14day', title: '14-Day Alchemist', icon: '🥈', desc: '14-day streak', unlocked: bestStreak >= 14, progress: `${Math.min(bestStreak, 14)}/14d` },
              { id: '21day', title: 'Rise21 Master', icon: '🥇', desc: '21-day streak', unlocked: bestStreak >= 21, progress: `${Math.min(bestStreak, 21)}/21d` },
              { id: 'selfies', title: 'Visual Proof', icon: '📸', desc: '5 selfies logged', unlocked: totalSelfies >= 5, progress: `${Math.min(totalSelfies, 5)}/5 photos` },
              { id: 'flawless', title: 'Discipline Shield', icon: '🛡️', desc: 'Zero penalties logged', unlocked: wallet.balance === 0, progress: wallet.balance === 0 ? 'Flawless' : 'Charged' }
            ];

            return badgeDefinitions.map(b => (
              <div
                key={b.id}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                  b.unlocked
                    ? 'bg-sage-50/70 border-sage-200/80 shadow-sm'
                    : 'bg-cream-50/40 border-cream-200/60 opacity-60'
                }`}
              >
                <div className="text-2xl mb-1 drop-shadow-sm">{b.icon}</div>
                <span className="font-semibold text-[11px] text-sage-900 leading-tight block mb-0.5">{b.title}</span>
                <span className="text-[9px] text-cream-500 block leading-tight">{b.desc}</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full mt-2 font-bold ${
                  b.unlocked ? 'bg-sage-600 text-white' : 'bg-cream-200 text-cream-600'
                }`}>
                  {b.unlocked ? 'Unlocked ✓' : b.progress}
                </span>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Profile statistics & Data Export */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <div className="flex justify-between items-center mb-4 border-b border-cream-50 pb-2">
          <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500">
            Rise21 Stats
          </h3>
          <button
            onClick={exportUserDataCSV}
            className="bg-cream-100 hover:bg-cream-200 text-sage-800 font-semibold py-1 px-3 rounded-xl text-[10px] transition-all flex items-center gap-1 border border-cream-200 active:scale-95 shadow-sm"
          >
            <Download className="w-3 h-3 text-sage-600" />
            <span>Export Data (CSV)</span>
          </button>
        </div>

        <div className="space-y-4 text-xs font-sans">
          <div className="flex justify-between items-center py-1">
            <span className="text-cream-600">Total Challenges Started</span>
            <span className="font-semibold text-sage-800">{challenges.length}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-cream-600">Active Challenges</span>
            <span className="font-semibold text-sage-800">{challenges.filter(c => c.isActive).length}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-cream-600">Accountability Balance</span>
            <span className="font-semibold text-sage-800">₹{wallet.balance}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-cream-600">Total Redirected to Good</span>
            <span className="font-semibold text-sage-800">₹{wallet.redirected}</span>
          </div>
          {insights && (
            <>
              <div className="flex justify-between items-center py-1">
                <span className="text-cream-600">Best Streak Achieved</span>
                <span className="font-semibold text-sage-800">{insights.bestStreak} Days</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-cream-600">Unlocked Badges</span>
                <span className="font-semibold text-sage-800">{insights.achievements.length}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* PWA App Installation Info */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 border-b border-cream-50 pb-2 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-sage-500" />
          <span>App Installation</span>
        </h3>

        {isStandalone ? (
          <div className="bg-sage-50 border border-sage-200 text-sage-800 rounded-2xl p-4 text-xs flex flex-col items-center text-center">
            <span className="text-xl mb-1 text-sage-500 font-bold">✓</span>
            <strong className="font-semibold font-serif text-sage-900">Running as Mobile App</strong>
            <p className="opacity-90 mt-1 leading-snug text-cream-600">Rise21 is fully installed and optimized for home screen usage!</p>
          </div>
        ) : isInstallable ? (
          <div className="text-xs font-sans space-y-4">
            <p className="text-cream-600 leading-relaxed">
              Install Rise21 on your home screen for quick mobile access, offline tracking, and native notifications.
            </p>
            <button
              onClick={triggerPwaInstall}
              className="w-full bg-sage-500 hover:bg-sage-600 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Install Rise21 App</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="text-xs font-sans space-y-3 text-cream-700">
            <p className="font-semibold text-sage-900">To install on iPhone / iPad:</p>
            <ol className="list-decimal list-inside space-y-1.5 leading-snug text-cream-600">
              <li>Tap the <strong className="text-sage-850">Share</strong> icon at the bottom of Safari.</li>
              <li>Scroll down the menu and tap <strong className="text-sage-850">"Add to Home Screen"</strong>.</li>
              <li>Name it "Rise21" and tap <strong className="text-sage-850">Add</strong>.</li>
            </ol>
            <p className="text-[10px] text-cream-400 leading-snug pt-1">
              Note: This feature requires opening this website using the native iOS Safari browser.
            </p>
          </div>
        ) : (
          <div className="text-xs font-sans space-y-2 text-cream-600">
            <p className="leading-relaxed">
              To turn this application into a PWA on other platforms:
            </p>
            <ul className="list-disc list-inside space-y-1 leading-snug">
              <li>On Chrome/Edge: Click the install icon in the address bar.</li>
              <li>On Android (Firefox/Opera): Tap menu &gt; Add to Home Screen.</li>
            </ul>
          </div>
        )}
      </div>

      {/* 🔔 Daily Reminders Settings Card */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 border-b border-cream-50 pb-2 flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-sage-500" />
          <span>Daily Reminders</span>
        </h3>

        <div className="space-y-4 text-xs font-sans">
          <div className="flex justify-between items-center py-1">
            <div>
              <span className="text-cream-700 font-semibold block">Enable Reminders</span>
              <span className="text-[10px] text-cream-400">Get notified to update your habits</span>
            </div>
            <button
              onClick={handleToggleReminders}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center focus:outline-none ${
                remindersEnabled ? 'bg-sage-500' : 'bg-cream-200'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute transition-transform shadow-sm ${
                  remindersEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {remindersEnabled && (
            <>
              <div className="border-t border-cream-50 pt-3 space-y-2">
                <div className="text-cream-700 font-semibold block text-[11px]">Auto Quote Notifications</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-sage-50/60 border border-sage-100/80 rounded-xl p-2.5 flex items-center gap-2">
                    <span className="text-base">☀️</span>
                    <div>
                      <span className="font-semibold text-sage-800 text-[11px] block">Morning Quote</span>
                      <span className="text-[10px] text-sage-600 font-mono">07:00 AM Daily</span>
                    </div>
                  </div>
                  <div className="bg-sage-50/60 border border-sage-100/80 rounded-xl p-2.5 flex items-center gap-2">
                    <span className="text-base">🌙</span>
                    <div>
                      <span className="font-semibold text-sage-800 text-[11px] block">Evening Quote</span>
                      <span className="text-[10px] text-sage-600 font-mono">09:30 PM Daily</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-cream-50 pt-3">
                <div>
                  <span className="text-cream-700 font-semibold block">Additional Custom Reminder</span>
                  <span className="text-[10px] text-cream-400">Set an extra daily check-in time</span>
                </div>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="bg-cream-50 border border-cream-200 rounded-xl px-2.5 py-1.5 text-xs text-sage-800 focus:outline-none focus:border-sage-300 font-semibold font-mono"
                />
              </div>

              <div className="border-t border-cream-50 pt-3 flex justify-between items-center">
                <div>
                  <span className="text-cream-700 font-semibold block">Verification</span>
                  <span className="text-[10px] text-cream-400">Test if permissions are correct</span>
                </div>
                <button
                  onClick={sendTestNotification}
                  className="bg-sage-50 border border-sage-200 text-sage-700 hover:bg-sage-100 font-semibold py-1.5 px-3 rounded-xl text-[10px] transition-all"
                >
                  Send Test Notification
                </button>
              </div>
            </>
          )}

          {notificationPermissionStatus === 'denied' && (
            <p className="text-[10px] text-red-500 italic mt-2 leading-normal">
              ⚠️ Notifications are blocked by your browser. Please enable them in your browser settings to receive daily reminders.
            </p>
          )}

          {notificationPermissionStatus === 'unsupported' && (
            <p className="text-[10px] text-cream-500 italic mt-2 leading-normal">
              ℹ️ Your device does not support native push notifications in this browser.
            </p>
          )}
        </div>
      </div>

      {/* 🔒 Biometric FaceID / TouchID Card */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 border-b border-cream-50 pb-2 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-sage-500" />
          <span>Biometric Protection</span>
        </h3>

        <div className="space-y-4 text-xs font-sans">
          <div className="flex justify-between items-center py-1">
            <div>
              <span className="text-cream-700 font-semibold block">Face ID / Touch ID Login</span>
              <span className="text-[10px] text-cream-400">
                {localStorage.getItem('rise21_bio_credential_id') 
                  ? 'Configured on this device ✓' 
                  : 'Enroll quick login on this browser'}
              </span>
            </div>
            <button
              onClick={async () => {
                if (localStorage.getItem('rise21_bio_credential_id')) {
                  if (window.confirm("Do you want to disable biometric login on this browser?")) {
                    localStorage.removeItem('rise21_bio_credential_id');
                    localStorage.removeItem('rise21_bio_token');
                    window.location.reload();
                  }
                } else {
                  const enrolled = await enableBiometrics();
                  if (enrolled) {
                    window.location.reload();
                  }
                }
              }}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center focus:outline-none ${
                localStorage.getItem('rise21_bio_credential_id') ? 'bg-sage-500' : 'bg-cream-200'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute transition-transform shadow-sm ${
                  localStorage.getItem('rise21_bio_credential_id') ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 📖 Walkthrough Tour Settings Card */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 border-b border-cream-50 pb-2 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-sage-500" />
          <span>Onboarding Walkthrough</span>
        </h3>

        <div className="space-y-4 text-xs font-sans">
          <p className="text-cream-600 leading-relaxed">
            Need a refresher on how to navigate the app or how accountability penalties work? Launch the interactive walkthrough tour.
          </p>
          <button
            onClick={() => setShowTour(true)}
            className="w-full bg-sage-500 hover:bg-sage-600 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <span>📖</span>
            <span>View App Walkthrough Tour</span>
          </button>
        </div>
      </div>

      {/* 🔄 Restart Goal Settings Card */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 border-b border-cream-50 pb-2 flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-sage-500" />
          <span>Restart Rise21 Goal</span>
        </h3>

        <div className="space-y-4 text-xs font-sans">
          <p className="text-cream-600 leading-relaxed">
            Fell off track or want a clean slate? You can restart your Rise21 challenge. This will reset your active streaks, rank, and achievements, but keep all historical monthly logs.
          </p>

          {/* Session restart logs history list */}
          <div className="bg-cream-50/50 border border-cream-150 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] text-cream-500 font-bold uppercase tracking-wider block">
              Session Restart Timeline
            </span>
            <div className="space-y-1.5 pt-1 text-sage-800 font-medium">
              <div className="flex justify-between items-center text-[11px] border-b border-cream-100/50 pb-1">
                <span className="text-cream-500">🏁 Joined Account:</span>
                <span className="font-mono">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>
              </div>
              {(() => {
                let restartsList = [];
                try {
                  const parsed = user?.restarts ? JSON.parse(user.restarts) : [];
                  restartsList = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                  restartsList = [];
                }
                return restartsList.map((item, idx) => {
                  const rDate = typeof item === 'string' ? item : item.date;
                  const rReason = typeof item === 'string' ? 'Manual Restart' : item.reason;
                  return (
                    <div key={idx} className="flex justify-between items-start text-[11px] border-b border-cream-100/50 pb-1.5 pt-0.5 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="text-rose-600 font-bold flex items-center gap-1">🔄 Restart #{idx + 1}</span>
                        <span className="text-cream-500 text-[10px] mt-0.5 italic">Reason: "{rReason}"</span>
                      </div>
                      <span className="font-mono text-sage-800 font-semibold self-center">
                        {new Date(rDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <button
            onClick={() => {
              const confirmRestart = window.confirm(
                "Are you sure you want to restart your Rise21 challenge? This will reset your current streak, achievements, and discipline rank. Your historical monthly logs will be preserved."
              );
              if (confirmRestart) {
                const reason = window.prompt("Why are you restarting your goal? (Optional — enter a reason):");
                if (reason !== null) {
                  restartSession(reason || "Manual Restart");
                }
              }
            }}
            className="w-full bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-100 font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restart Goal Session</span>
          </button>
        </div>
      </div>

      {/* Rules of engagement reference card */}
      <div className="bg-sage-50/50 border border-sage-100 rounded-3xl p-5 mb-6 text-xs leading-relaxed text-sage-800">
        <div className="flex items-center gap-1.5 font-semibold text-sage-900 mb-2">
          <Shield className="w-4 h-4 text-sage-500" />
          <span>Rules of Accountability</span>
        </div>
        <p className="font-sans">
          Rise21 is designed to build discipline. Every time you miss a target or fall off center, a small charge is logged. 
          Use this money to buy books, help a neighbor, or donate to charity. 
          Become 1% better every day.
        </p>
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-100 font-semibold py-3.5 rounded-2xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 font-sans active:scale-[0.98]"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out Session</span>
      </button>

    </div>
  );
}
