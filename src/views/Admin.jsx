import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Sparkles, Megaphone, Trash2, Shield, 
  RotateCcw, Search, Plus, Edit2, Check, X, AlertTriangle, Calendar
} from 'lucide-react';

export default function Admin() {
  const {
    fetchAdminUsers,
    updateUserRole,
    resetUserData,
    deleteUserAccount,
    fetchAdminQuotes,
    addQuote,
    updateQuote,
    deleteQuote,
    broadcastAnnouncement,
    deleteAnnouncement,
    announcements,
    apiFetch
  } = useApp();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'quotes' | 'notifications'

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Quotes State
  const [quotesList, setQuotesList] = useState([]);
  const [quotesSearch, setQuotesSearch] = useState('');
  const [quoteCategoryFilter, setQuoteCategoryFilter] = useState('');
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quoteModal, setQuoteModal] = useState({ show: false, quote: null, isEdit: false });
  const [quoteForm, setQuoteForm] = useState({ text: '', author: '', category: 'discipline' });

  // Notifications State
  const [notifyForm, setNotifyForm] = useState({ title: '', message: '' });
  const [sendingNotify, setSendingNotify] = useState(false);

  // Danger Action Confirmation Modal States
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: '', // 'reset' | 'delete'
    targetId: '',
    targetName: '',
    doubleConfirmText: ''
  });

  // Fetch Users
  const handleFetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchAdminUsers();
      setUsersList(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Quotes
  const handleFetchQuotes = async () => {
    setLoadingQuotes(true);
    try {
      const data = await fetchAdminQuotes();
      setQuotesList(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching quotes');
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      handleFetchUsers();
    } else if (activeTab === 'quotes') {
      handleFetchQuotes();
    }
  }, [activeTab]);

  // Handle user role update
  const handleToggleRole = async (user) => {
    const targetRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(user.id, targetRole);
      // Reload list
      handleFetchUsers();
    } catch (err) {
      alert(err.message || 'Error updating user role');
    }
  };

  // Reset or Delete Action Trigger
  const triggerDangerAction = (type, user) => {
    setConfirmModal({
      show: true,
      type,
      targetId: user.id,
      targetName: user.name || user.username,
      doubleConfirmText: ''
    });
  };

  const handleDangerConfirm = async () => {
    const { type, targetId } = confirmModal;
    try {
      if (type === 'reset') {
        await resetUserData(targetId);
        alert('All tracking data related to the user has been reset.');
      } else if (type === 'delete') {
        await deleteUserAccount(targetId);
        alert('User account and all data have been fully deleted.');
      }
      setConfirmModal({ show: false, type: '', targetId: '', targetName: '', doubleConfirmText: '' });
      handleFetchUsers();
    } catch (err) {
      alert(err.message || `Error during ${type}`);
    }
  };

  // Handle Quote submit (Add / Edit)
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quoteForm.text || !quoteForm.author) return;

    try {
      if (quoteModal.isEdit && quoteModal.quote) {
        await updateQuote(quoteModal.quote.id, quoteForm);
        alert('Quote updated successfully.');
      } else {
        await addQuote(quoteForm);
        alert('Quote added successfully.');
      }
      setQuoteModal({ show: false, quote: null, isEdit: false });
      setQuoteForm({ text: '', author: '', category: 'discipline' });
      handleFetchQuotes();
    } catch (err) {
      alert(err.message || 'Error saving quote');
    }
  };

  // Open Edit Quote modal
  const handleOpenEditQuote = (quote) => {
    setQuoteForm({ text: quote.text, author: quote.author, category: quote.category || 'discipline' });
    setQuoteModal({ show: true, quote, isEdit: true });
  };

  // Handle delete quote
  const handleDeleteQuote = async (quoteId) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      await deleteQuote(quoteId);
      handleFetchQuotes();
    } catch (err) {
      alert('Error deleting quote');
    }
  };

  // Send Broadcast Announcement
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifyForm.title || !notifyForm.message) return;

    setSendingNotify(true);
    try {
      await broadcastAnnouncement(notifyForm);
      alert('Announcement broadcasted successfully to all users.');
      setNotifyForm({ title: '', message: '' });
    } catch (err) {
      alert(err.message || 'Error broadcasting announcement');
    } finally {
      setSendingNotify(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement? It will disappear from users feeds.')) return;
    try {
      await deleteAnnouncement(id);
    } catch (err) {
      alert('Error deleting announcement');
    }
  };

  // Filter Users
  const filteredUsers = usersList.filter(user => {
    const q = usersSearch.toLowerCase();
    return (user.name && user.name.toLowerCase().includes(q)) || 
           (user.username && user.username.toLowerCase().includes(q));
  });

  // Filter Quotes
  const filteredQuotes = quotesList.filter(quote => {
    const q = quotesSearch.toLowerCase();
    const matchesQuery = (quote.text && quote.text.toLowerCase().includes(q)) || 
                         (quote.author && quote.author.toLowerCase().includes(q));
    const matchesCategory = !quoteCategoryFilter || quote.category === quoteCategoryFilter;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-6 pt-6 text-left">
      
      {/* Header */}
      <div className="mb-6 shrink-0">
        <h1 className="font-serif text-3xl font-semibold text-sage-900 tracking-tight flex items-center gap-2">
          <Shield className="w-8 h-8 text-sage-600" />
          <span>Admin Panel</span>
        </h1>
        <p className="text-sm text-cream-500 font-sans mt-1">
          Configure users, quotes, and broadcast system notifications.
        </p>
      </div>

      {/* Admin Panel Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-cream-250 mb-6 shrink-0 shadow-sm font-sans">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center justify-center gap-2 flex-1 py-3 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'users' 
              ? 'bg-sage-100 text-sage-800 shadow-sm' 
              : 'text-cream-500 hover:text-sage-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users</span>
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center justify-center gap-2 flex-1 py-3 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'quotes' 
              ? 'bg-sage-100 text-sage-800 shadow-sm' 
              : 'text-cream-500 hover:text-sage-500'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Quotes</span>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center justify-center gap-2 flex-1 py-3 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'notifications' 
              ? 'bg-sage-100 text-sage-800 shadow-sm' 
              : 'text-cream-500 hover:text-sage-500'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast</span>
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="flex-1 min-h-0">
        
        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="flex flex-col h-full space-y-4">
            {/* Search inputs */}
            <div className="relative shrink-0 font-sans">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cream-400" />
              <input
                type="text"
                placeholder="Search users by name or username..."
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 shadow-sm transition-all"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingUsers ? (
                <div className="py-12 text-center text-xs text-cream-500 font-sans">
                  Loading users list...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-xs text-cream-500 font-sans italic bg-white rounded-3xl border border-sage-100 p-6">
                  No users found
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="bg-white border border-sage-100 rounded-3xl p-5 shadow-premium flex flex-col gap-4 font-sans">
                    <div className="flex justify-between items-start border-b border-cream-50 pb-3">
                      <div>
                        <h3 className="font-serif text-md font-bold text-sage-900 leading-snug">
                          {user.name}
                        </h3>
                        <p className="text-xs text-cream-500 mt-0.5">
                          @{user.username}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        user.role === 'admin' 
                          ? 'bg-sage-100 text-sage-800' 
                          : 'bg-cream-50 border border-cream-200 text-cream-600'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-cream-500 font-sans">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cream-300" />
                        <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span>Challenges: <strong>{user._count.challenges}</strong></span>
                      </div>
                      <div>
                        <span>Check-ins: <strong>{user._count.checkIns}</strong></span>
                      </div>
                      <div>
                        <span>Selfies: <strong>{user._count.selfies}</strong></span>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-cream-50 pt-3 mt-1 text-[11px] font-semibold">
                      <button
                        onClick={() => handleToggleRole(user)}
                        className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1 transition-colors ${
                          user.role === 'admin'
                            ? 'bg-cream-50 border-cream-200 text-cream-600 hover:bg-cream-100'
                            : 'bg-sage-50 border-sage-150 text-sage-700 hover:bg-sage-100'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}</span>
                      </button>

                      <button
                        onClick={() => triggerDangerAction('reset', user)}
                        className="py-2 px-3 rounded-xl border border-orange-100 bg-orange-50 hover:bg-orange-100 text-orange-700 flex items-center justify-center gap-1 transition-colors"
                        title="Wipe user tracking data but keep account"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Data</span>
                      </button>

                      <button
                        onClick={() => triggerDangerAction('delete', user)}
                        className="py-2 px-3 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center gap-1 transition-colors"
                        title="Delete user completely"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- QUOTES TAB --- */}
        {activeTab === 'quotes' && (
          <div className="flex flex-col h-full space-y-4">
            
            {/* Search and Filters bar */}
            <div className="flex gap-2 shrink-0 font-sans">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cream-400" />
                <input
                  type="text"
                  placeholder="Search quotes or authors..."
                  value={quotesSearch}
                  onChange={(e) => setQuotesSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 shadow-sm transition-all"
                />
              </div>

              <select
                value={quoteCategoryFilter}
                onChange={(e) => setQuoteCategoryFilter(e.target.value)}
                className="bg-white border border-cream-200 rounded-2xl px-3 py-3 text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 shadow-sm transition-all text-cream-600 font-semibold"
              >
                <option value="">All Categories</option>
                <option value="discipline">Discipline</option>
                <option value="spirituality">Spirituality</option>
                <option value="wisdom">Wisdom</option>
                <option value="general">General</option>
              </select>

              <button
                onClick={() => {
                  setQuoteForm({ text: '', author: '', category: 'discipline' });
                  setQuoteModal({ show: true, quote: null, isEdit: false });
                }}
                className="bg-sage-500 hover:bg-sage-600 text-white rounded-2xl px-4 py-3 text-xs font-semibold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            {/* Quotes List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingQuotes ? (
                <div className="py-12 text-center text-xs text-cream-500 font-sans">
                  Loading quotes list...
                </div>
              ) : filteredQuotes.length === 0 ? (
                <div className="py-12 text-center text-xs text-cream-500 font-sans italic bg-white rounded-3xl border border-sage-100 p-6">
                  No quotes found
                </div>
              ) : (
                filteredQuotes.map(quote => (
                  <div key={quote.id} className="bg-white border border-sage-100 rounded-3xl p-5 shadow-premium flex flex-col justify-between gap-3 text-left">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cream-50 border border-cream-250 text-cream-500 font-sans mb-3">
                        {quote.category || 'general'}
                      </span>
                      <p className="font-serif text-sm italic text-sage-800 leading-relaxed">
                        "{quote.text}"
                      </p>
                      <p className="text-xs text-cream-500 font-sans font-medium mt-2">
                        — {quote.author}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-cream-50 pt-3 mt-1 text-[11px] font-semibold font-sans">
                      <button
                        onClick={() => handleOpenEditQuote(quote)}
                        className="py-1.5 px-3 rounded-lg bg-cream-50 border border-cream-200 text-cream-600 hover:bg-cream-100 flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="py-1.5 px-3 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- BROADCAST NOTIFICATIONS TAB --- */}
        {activeTab === 'notifications' && (
          <div className="flex flex-col h-full space-y-6">
            
            {/* Form */}
            <form onSubmit={handleSendNotification} className="bg-white border border-sage-100 rounded-3xl p-5 shadow-premium space-y-4 font-sans text-xs">
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 border-b border-cream-50 pb-2 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-sage-500" />
                <span>Broadcast Announcement</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., App Update 2.0 or Challenge Reminder"
                  value={notifyForm.title}
                  onChange={(e) => setNotifyForm({ ...notifyForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
                  Message Details
                </label>
                <textarea
                  placeholder="Type the message body details that will display to all users..."
                  value={notifyForm.message}
                  onChange={(e) => setNotifyForm({ ...notifyForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans resize-none leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sendingNotify}
                className="w-full bg-sage-500 hover:bg-sage-600 text-white font-medium py-3 rounded-2xl text-xs transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center font-sans"
              >
                {sendingNotify ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Send Broadcast Update'
                )}
              </button>
            </form>

            {/* History of Past Announcements */}
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 ml-1">
                Announcement History
              </h4>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {announcements.length === 0 ? (
                  <div className="py-12 text-center text-xs text-cream-500 font-sans italic bg-white rounded-3xl border border-sage-100 p-6">
                    No broadcast history
                  </div>
                ) : (
                  announcements.map(ann => (
                    <div key={ann.id} className="bg-white border border-sage-100 rounded-3xl p-5 shadow-premium flex flex-col justify-between gap-3 text-left font-sans">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h5 className="font-serif text-md font-bold text-sage-950 leading-tight">
                            {ann.title}
                          </h5>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="text-cream-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete announcement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-sage-800 leading-relaxed whitespace-pre-wrap">
                          {ann.message}
                        </p>
                      </div>
                      <div className="text-[9px] text-cream-400 border-t border-cream-50 pt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cream-300" />
                        <span>Broadcasted on {new Date(ann.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD / EDIT QUOTE DIALOG MODAL --- */}
      {quoteModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-cream-100 w-full max-w-[420px] rounded-[32px] border border-cream-250 shadow-premium flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={quoteSubmit => handleQuoteSubmit(quoteSubmit)}>
              <div className="px-6 pt-6 pb-4 border-b border-cream-200 flex justify-between items-center bg-white rounded-t-[32px]">
                <h3 className="font-serif text-lg font-bold text-sage-900 leading-none">
                  {quoteModal.isEdit ? 'Edit Quote 📝' : 'Add Daily Quote 🌟'}
                </h3>
                <button 
                  type="button"
                  onClick={() => setQuoteModal({ show: false, quote: null, isEdit: false })}
                  className="w-8 h-8 rounded-full bg-cream-50 border border-cream-200 flex items-center justify-center text-cream-500 hover:bg-cream-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 font-sans text-xs">
                <div>
                  <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
                    Quote Category
                  </label>
                  <select
                    value={quoteForm.category}
                    onChange={(e) => setQuoteForm({ ...quoteForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans font-semibold text-cream-600"
                  >
                    <option value="discipline">Discipline</option>
                    <option value="spirituality">Spirituality</option>
                    <option value="wisdom">Wisdom</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
                    Quote text
                  </label>
                  <textarea
                    placeholder="Type quote text in English, Gujarati, Hindi, etc..."
                    value={quoteForm.text}
                    onChange={(e) => setQuoteForm({ ...quoteForm, text: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans leading-relaxed resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
                    Author / Source
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bhagavad Gita, Swami Vivekananda..."
                    value={quoteForm.author}
                    onChange={(e) => setQuoteForm({ ...quoteForm, author: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans"
                    required
                  />
                </div>
              </div>

              <div className="p-6 bg-white border-t border-cream-200 flex gap-3 rounded-b-[32px]">
                <button
                  type="button"
                  onClick={() => setQuoteModal({ show: false, quote: null, isEdit: false })}
                  className="flex-1 bg-cream-50 border border-cream-250 text-cream-600 hover:bg-cream-100 font-medium py-3 rounded-2xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sage-500 hover:bg-sage-600 text-white font-medium py-3 rounded-2xl text-xs transition-colors shadow-sm active:scale-[0.98]"
                >
                  Save Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM RESET / DELETE USERS DANGER ACTION MODAL --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-[400px] rounded-[32px] border border-red-100 shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-500 mb-4 animate-bounce">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="font-serif text-lg font-bold text-red-800 mb-2 leading-tight">
              {confirmModal.type === 'reset' ? 'Reset User Tracking Data?' : 'Delete User Account Permanently?'}
            </h3>

            <p className="text-xs text-cream-600 leading-relaxed px-2 mb-6">
              {confirmModal.type === 'reset' ? (
                <span>
                  This action will permanently delete all challenges, check-ins, mind check logs, reflections, wallet history, and selfies logged by <strong>{confirmModal.targetName}</strong>. This account itself will remain active, but all tracking data will be completely wiped.
                </span>
              ) : (
                <span>
                  This will completely delete the user <strong>{confirmModal.targetName}</strong> and all their tracking history from Rise21 databases. This action is irreversible.
                </span>
              )}
            </p>

            {/* Double verification input */}
            <div className="mb-6 text-left">
              <label className="block text-[10px] font-bold text-cream-500 uppercase tracking-wide mb-2 ml-1">
                Type <strong className="text-red-700 select-all font-mono">CONFIRM</strong> below to verify
              </label>
              <input
                type="text"
                placeholder="CONFIRM"
                value={confirmModal.doubleConfirmText}
                onChange={(e) => setConfirmModal({ ...confirmModal, doubleConfirmText: e.target.value })}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-xs text-center font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all"
              />
            </div>

            <div className="flex gap-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setConfirmModal({ show: false, type: '', targetId: '', targetName: '', doubleConfirmText: '' })}
                className="flex-1 bg-cream-50 border border-cream-250 text-cream-600 hover:bg-cream-100 py-3 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmModal.doubleConfirmText !== 'CONFIRM'}
                onClick={handleDangerConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-2xl transition-colors shadow-sm active:scale-[0.98]"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
