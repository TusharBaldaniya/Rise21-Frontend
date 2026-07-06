import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Book, Sparkles, Plus, AlertCircle, User } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Wallet() {
  const {
    wallet,
    apiFetch,
    fetchWallet,
    fetchInsights,
    getTodayDateString,
    setActiveTab
  } = useApp();

  const [category, setCategory] = useState('Charity'); // 'Charity' | 'Books' | 'Help' | 'Custom'
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle redirection submit
  const handleRedirect = async (e) => {
    e.preventDefault();
    setError('');

    const redirectVal = parseFloat(amount);
    if (isNaN(redirectVal) || redirectVal <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    if (redirectVal > wallet.balance) {
      setError(`Insufficient balance. Current balance is ₹${wallet.balance}.`);
      return;
    }

    if (!purpose) {
      setError('Please explain the purpose of this redirection.');
      return;
    }

    const finalCategory = category === 'Custom' ? customCategory : category;
    if (!finalCategory) {
      setError('Please choose or enter a category.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/api/wallet/redirect', {
        method: 'POST',
        body: JSON.stringify({
          date: getTodayDateString(),
          amount: redirectVal,
          category: finalCategory,
          description: purpose
        })
      });

      // Spark positive feedback confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a3b497', '#c5d0bc', '#ffffff']
      });

      // Clear Form & Refresh
      setAmount('');
      setPurpose('');
      setCustomCategory('');
      
      await fetchWallet();
      await fetchInsights();
    } catch (err) {
      console.error(err);
      setError(err.message);
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
            Wallet
          </h1>
          <p className="text-sm text-cream-500 font-sans mt-1">
            Turn slip-ups into good deeds.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-10 h-10 rounded-full border border-cream-300 bg-white flex items-center justify-center text-sage-600 hover:bg-cream-50 transition-colors shadow-sm"
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      {/* Accountability Balance Card - Matching mockup banner */}
      <div className="bg-sage-500 text-white rounded-3xl p-6 shadow-premium mb-6 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">
            Accountability Balance
          </span>
          <h2 className="font-serif text-4xl font-bold mt-1 tracking-tight">
            ₹{wallet.balance}
          </h2>
        </div>
        <div className="flex gap-4 mt-6 pt-4 border-t border-white/20 text-xs font-sans opacity-95">
          <span>Collected <strong>₹{wallet.collected}</strong></span>
          <span>•</span>
          <span>Redirected <strong>₹{wallet.redirected}</strong></span>
        </div>
      </div>

      {/* Habit Impact / Redirect summaries */}
      {wallet.redirected > 0 && (
        <div className="bg-sage-50/50 border border-sage-100 rounded-3xl p-4 shadow-sm mb-6 text-xs text-sage-800 font-sans leading-relaxed">
          <div className="font-semibold text-sage-900 mb-1.5 flex items-center gap-1.5">
            <span>✨ Redirected Savings</span>
          </div>
          <ul className="space-y-1.5">
            {Object.entries(
              wallet.transactions
                .filter(t => t.type === 'redirection')
                .reduce((acc, t) => {
                  acc[t.category] = (acc[t.category] || 0) + t.amount;
                  return acc;
                }, {})
            ).map(([cat, amt]) => {
              const icons = { 'Books': '📚', 'Charity': '💖', 'Help': '🤝' };
              const icon = icons[cat] || '🌱';
              return (
                <li key={cat} className="flex items-center gap-1.5">
                  <span>{icon}</span>
                  <span>Redirected <strong>₹{amt}</strong> to {cat.toLowerCase()}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Redirection Tool */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <h3 className="font-serif text-lg font-bold text-sage-800 mb-1">
          Redirect to good
        </h3>
        <p className="text-xs text-cream-500 font-sans mb-5 leading-relaxed">
          Give this money a positive purpose — charity, books, or helping someone.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-1.5 font-sans">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRedirect} className="space-y-4">
          
          {/* Category selection */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'Charity', label: 'Charity', icon: Heart },
              { id: 'Books', label: 'Books', icon: Book },
              { id: 'Help', label: 'Help', icon: Sparkles },
              { id: 'Custom', label: 'Custom', icon: Plus }
            ].map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCategory(opt.id)}
                  className={`py-2.5 px-1 rounded-2xl border flex flex-col items-center justify-center gap-1 text-[10px] font-semibold font-sans transition-all ${
                    category === opt.id
                      ? 'bg-sage-50 border-sage-500 text-sage-800'
                      : 'bg-cream-50/50 border-cream-200 text-cream-600 hover:bg-cream-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sage-500" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {category === 'Custom' && (
            <input
              type="text"
              placeholder="Enter custom category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 font-sans"
              required
            />
          )}

          <div className="grid grid-cols-3 gap-2">
            {/* Amount input */}
            <div className="col-span-1">
              <input
                type="number"
                placeholder="Amount (₹)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 font-sans"
                min="1"
                required
              />
            </div>
            
            {/* Purpose input */}
            <div className="col-span-2 relative">
              <input
                type="text"
                placeholder="Purpose (e.g. donated to PM Care)"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-3 bg-cream-50 border border-cream-200 rounded-2xl text-xs focus:outline-none focus:border-sage-300 font-sans pr-10"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1 top-1 bottom-1 w-9 bg-sage-500 hover:bg-sage-600 text-white rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Transaction Breakdown Logs */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 border-b border-cream-50 pb-2">
          Breakdown logs
        </h3>

        {wallet.transactions.length === 0 ? (
          <p className="text-xs text-cream-400 font-sans italic text-center py-6">
            No accountability charges yet. Keep it up.
          </p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {wallet.transactions.map(t => {
              const formattedDate = new Date(t.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3.5 border border-cream-200 rounded-2xl bg-cream-50/20 text-xs font-sans"
                >
                  <div className="pr-4">
                    <div className="text-[9px] text-cream-400 font-bold uppercase tracking-wider mb-1 font-mono">
                      {formattedDate}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">
                        {t.type === 'charge' ? '❌' : '✅'}
                      </span>
                      <span className={`font-semibold ${t.type === 'charge' ? 'text-red-700' : 'text-sage-800'}`}>
                        {t.type === 'charge' ? 'Missed Habit' : `Redirected to ${t.category}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-cream-655 mt-1 leading-snug font-medium">{t.description}</p>
                  </div>
                  <span className={`font-mono font-bold text-sm ${t.type === 'charge' ? 'text-red-600' : 'text-sage-600'}`}>
                    {t.type === 'charge' ? '+' : '-'}₹{t.amount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
