import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Archive, Calendar, DollarSign, Target, AlignLeft, Check, User, Pencil } from 'lucide-react';

export default function Challenges() {
  const {
    challenges,
    apiFetch,
    fetchChallenges,
    fetchTodayCheckIns,
    fetchInsights,
    getTodayDateString,
    setActiveTab
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationPreset, setDurationPreset] = useState('21'); // '7' | '21' | '30' | 'custom'
  const [customDays, setCustomDays] = useState('21');
  const [dailyTarget, setDailyTarget] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState('50');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');

  // Icon & Motivation State
  const [icon, setIcon] = useState('🎯');
  const [whyStarted, setWhyStarted] = useState('');

  // Edit State
  const [editModal, setEditModal] = useState({ show: false, challenge: null });
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDailyTarget, setEditDailyTarget] = useState('');
  const [editPenaltyAmount, setEditPenaltyAmount] = useState('');
  const [editIcon, setEditIcon] = useState('🎯');
  const [editWhyStarted, setEditWhyStarted] = useState('');

  const emojiOptions = ['🎯', '📚', '🙏', '☀️', '⏰', '💪', '🏃‍♂️', '🥦', '💧', '🧘‍♂️', '🚭', '🍎', '💰', '🧠'];

  // Calculate End Date automatically based on Start Date and Duration
  useEffect(() => {
    if (!startDate) return;
    const days = durationPreset === 'custom' ? parseInt(customDays, 10) : parseInt(durationPreset, 10);
    if (isNaN(days) || days <= 0) return;

    const start = new Date(startDate);
    const end = new Date(start.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
    
    // Format YYYY-MM-DD
    const yyyy = end.getFullYear();
    const mm = String(end.getMonth() + 1).padStart(2, '0');
    const dd = String(end.getDate()).padStart(2, '0');
    setEndDate(`${yyyy}-${mm}-${dd}`);
  }, [startDate, durationPreset, customDays]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !dailyTarget || !startDate || !endDate) return;

    setLoading(true);
    const duration = durationPreset === 'custom' ? parseInt(customDays, 10) : parseInt(durationPreset, 10);

    try {
      await apiFetch('/api/challenges', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          durationDays: duration,
          dailyTarget,
          penaltyAmount: parseFloat(penaltyAmount || 0),
          icon,
          whyStarted
        })
      });

      // Clear Form & Refresh
      setTitle('');
      setDescription('');
      setDailyTarget('');
      setPenaltyAmount('50');
      setIcon('🎯');
      setWhyStarted('');
      setStartDate(getTodayDateString());
      setShowModal(false);
      
      await fetchChallenges();
      await fetchTodayCheckIns();
      await fetchInsights();
    } catch (err) {
      console.error(err);
      alert('Error creating challenge: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('Are you sure you want to end/archive this challenge early?')) return;
    try {
      await apiFetch(`/api/challenges/${id}/archive`, { method: 'PUT' });
      await fetchChallenges();
      await fetchTodayCheckIns();
      await fetchInsights();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this challenge permanently? This will delete all its check-in records.')) return;
    try {
      await apiFetch(`/api/challenges/${id}`, { method: 'DELETE' });
      await fetchChallenges();
      await fetchTodayCheckIns();
      await fetchInsights();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (c) => {
    setEditModal({ show: true, challenge: c });
    setEditTitle(c.title || '');
    setEditDescription(c.description || '');
    setEditDailyTarget(c.dailyTarget || '');
    setEditPenaltyAmount(c.penaltyAmount?.toString() || '50');
    setEditIcon(c.icon || '🎯');
    setEditWhyStarted(c.whyStarted || '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle || !editDailyTarget) return;

    setLoading(true);
    try {
      await apiFetch(`/api/challenges/${editModal.challenge.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          dailyTarget: editDailyTarget,
          penaltyAmount: parseFloat(editPenaltyAmount || 0),
          icon: editIcon,
          whyStarted: editWhyStarted
        })
      });

      setEditModal({ show: false, challenge: null });
      await fetchChallenges();
      await fetchTodayCheckIns();
      await fetchInsights();
    } catch (err) {
      console.error(err);
      alert('Error updating challenge: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-24 pt-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-sage-900 tracking-tight">
            Challenges
          </h1>
          <p className="text-sm text-cream-500 font-sans mt-1">
            Build habits. Keep your commitments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-sage-500 hover:bg-sage-600 text-white font-medium py-2 px-3 rounded-xl text-xs transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-9 h-9 rounded-full border border-cream-300 bg-white flex items-center justify-center text-sage-600 hover:bg-cream-50 transition-colors shadow-sm"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active and Past Challenges */}
      {challenges.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-cream-300 rounded-3xl bg-cream-50/50 p-10 text-center my-6">
          <Target className="w-8 h-8 text-sage-400 mb-3" />
          <h3 className="font-serif text-lg font-medium text-sage-800">No challenges created</h3>
          <p className="text-xs text-cream-600 max-w-xs mb-4 mt-1 font-sans">
            Start a new streak. Commit to a 21-day self-discipline journey.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Active Challenges */}
          <div>
            <h2 className="font-serif text-lg font-semibold text-sage-800 mb-4 border-b border-cream-200 pb-2">
              Active Journeys
            </h2>
            
            {challenges.filter(c => c.isActive).length === 0 ? (
              <p className="text-xs text-cream-400 font-sans italic">No active challenges. Start one to begin.</p>
            ) : (
              <div className="space-y-4">
                {challenges.filter(c => c.isActive).map(c => (
                  <div key={c.id} className="bg-white border border-sage-50 rounded-3xl p-5 shadow-premium">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-sage-800 flex items-center gap-2">
                          <span className="text-xl">{c.icon || '🎯'}</span>
                          <span>{c.title}</span>
                        </h3>
                        {c.description && <p className="text-xs text-cream-500 font-sans mt-1">{c.description}</p>}
                        {c.whyStarted && (
                          <p className="text-[11px] text-sage-600 bg-sage-50/50 border border-sage-100/50 rounded-xl px-3 py-1.5 mt-2 font-sans italic">
                            "Why: {c.whyStarted}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-cream-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-all"
                          title="Edit Challenge"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleArchive(c.id)}
                          className="p-1.5 text-cream-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-all"
                          title="Complete & Archive Challenge"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-cream-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Challenge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-4 pt-4 border-t border-cream-50 text-xs font-sans text-cream-600">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-sage-400" />
                        <span>Target: <strong>{c.dailyTarget}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sage-400" />
                        <span>Duration: <strong>{c.durationDays} Days</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-sage-400" />
                        <span>Penalty: <strong>₹{c.penaltyAmount} / miss</strong></span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-cream-400">
                        <span>{new Date(c.startDate).toLocaleDateString()} — {new Date(c.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past / Archived Challenges */}
          {challenges.filter(c => !c.isActive).length > 0 && (
            <div>
              <h2 className="font-serif text-lg font-semibold text-cream-500 mb-4 border-b border-cream-200 pb-2">
                Completed & Archived
              </h2>
              <div className="space-y-4 opacity-75">
                {challenges.filter(c => !c.isActive).map(c => (
                  <div key={c.id} className="bg-cream-50 border border-cream-200 rounded-3xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-serif text-base font-bold text-cream-600 line-through flex items-center gap-2">
                          <span>{c.icon || '🎯'}</span>
                          <span>{c.title}</span>
                        </h3>
                        <p className="text-[11px] text-cream-400 font-sans mt-0.5">Archived Journey</p>
                      </div>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-cream-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-4 mt-3 pt-3 border-t border-cream-200 text-xs font-sans text-cream-500">
                      <span>Completed {c.durationDays} Days</span>
                      <span>•</span>
                      <span>Penalty: ₹{c.penaltyAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-sage-100 p-6 shadow-premium max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <h2 className="font-serif text-xl font-semibold text-sage-950 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-sage-500" />
              <span>Create New Challenge</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Challenge Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wake Up at 5 AM"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Choose Icon / Emoji
                </label>
                <div className="flex flex-wrap gap-2 p-2 bg-cream-50 border border-cream-200 rounded-2xl">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`w-9 h-9 text-base rounded-xl flex items-center justify-center transition-all ${
                        icon === emoji 
                          ? 'bg-sage-500 text-white scale-110 shadow-sm' 
                          : 'hover:bg-cream-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Why you started (Motivation statement)
                </label>
                <input
                  type="text"
                  placeholder="e.g. I want to build focus and be healthy"
                  value={whyStarted}
                  onChange={(e) => setWhyStarted(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Build daily routine"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Daily Target Rule
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wake up before 5:00 AM every single day"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                    End Date (Auto)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    disabled
                    className="w-full p-3 bg-cream-100 border border-cream-200 rounded-2xl text-sm text-cream-500 font-sans cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['7', '21', '30', 'custom'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDurationPreset(opt)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize font-sans transition-all ${
                        durationPreset === opt
                          ? 'bg-sage-500 border-sage-500 text-white shadow-sm'
                          : 'bg-cream-50 border-cream-200 text-cream-600 hover:bg-cream-100'
                      }`}
                    >
                      {opt === 'custom' ? 'Custom' : `${opt} Days`}
                    </button>
                  ))}
                </div>

                {durationPreset === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="number"
                      placeholder="Enter number of days"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                      min="1"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Self-Accountability Charge (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-cream-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-cream-200 rounded-xl text-xs text-cream-600 hover:bg-cream-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-sage-500 hover:bg-sage-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-sage-100 p-6 shadow-premium max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <h2 className="font-serif text-xl font-semibold text-sage-950 mb-6 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-sage-500" />
              <span>Edit Challenge</span>
            </h2>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Challenge Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Choose Icon / Emoji
                </label>
                <div className="flex flex-wrap gap-2 p-2 bg-cream-50 border border-cream-200 rounded-2xl">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditIcon(emoji)}
                      className={`w-9 h-9 text-base rounded-xl flex items-center justify-center transition-all ${
                        editIcon === emoji 
                          ? 'bg-sage-500 text-white scale-110 shadow-sm' 
                          : 'hover:bg-cream-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Why you started (Motivation statement)
                </label>
                <input
                  type="text"
                  value={editWhyStarted}
                  onChange={(e) => setEditWhyStarted(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Daily Target Rule
                </label>
                <input
                  type="text"
                  value={editDailyTarget}
                  onChange={(e) => setEditDailyTarget(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 ml-1">
                  Self-Accountability Charge (₹)
                </label>
                <input
                  type="number"
                  value={editPenaltyAmount}
                  onChange={(e) => setEditPenaltyAmount(e.target.value)}
                  className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 font-sans"
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-cream-100 mt-6">
                <button
                  type="button"
                  onClick={() => setEditModal({ show: false, challenge: null })}
                  className="px-4 py-2 border border-cream-200 rounded-xl text-xs text-cream-600 hover:bg-cream-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-sage-500 hover:bg-sage-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
