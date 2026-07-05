import React from 'react';
import { useApp } from '../context/AppContext';
import { User, LogOut, Calendar, Shield, Award, Sparkles, Smartphone, Download } from 'lucide-react';

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
    triggerPwaInstall
  } = useApp();

  if (!user) return null;

  // Format joined date
  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-24 pt-6">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-sage-900 tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-cream-500 font-sans mt-1">
          Review your discipline records.
        </p>
      </div>

      {/* User Info Avatar block */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center border border-sage-200 mb-3">
          <User className="w-8 h-8 text-sage-600" />
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

      {/* Profile statistics */}
      <div className="bg-white border border-sage-100 rounded-3xl p-6 shadow-premium mb-6">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-cream-500 mb-4 border-b border-cream-50 pb-2">
          Sadhna Stats
        </h3>

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
            <p className="opacity-90 mt-1 leading-snug text-cream-600">Sadhna is fully installed and optimized for home screen usage!</p>
          </div>
        ) : isInstallable ? (
          <div className="text-xs font-sans space-y-4">
            <p className="text-cream-600 leading-relaxed">
              Install Sadhna on your home screen for quick mobile access, offline tracking, and native notifications.
            </p>
            <button
              onClick={triggerPwaInstall}
              className="w-full bg-sage-500 hover:bg-sage-600 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Install Sadhna App</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="text-xs font-sans space-y-3 text-cream-700">
            <p className="font-semibold text-sage-900">To install on iPhone / iPad:</p>
            <ol className="list-decimal list-inside space-y-1.5 leading-snug text-cream-600">
              <li>Tap the <strong className="text-sage-850">Share</strong> icon at the bottom of Safari.</li>
              <li>Scroll down the menu and tap <strong className="text-sage-850">"Add to Home Screen"</strong>.</li>
              <li>Name it "Sadhna" and tap <strong className="text-sage-850">Add</strong>.</li>
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

      {/* Rules of engagement reference card */}
      <div className="bg-sage-50/50 border border-sage-100 rounded-3xl p-5 mb-6 text-xs leading-relaxed text-sage-800">
        <div className="flex items-center gap-1.5 font-semibold text-sage-900 mb-2">
          <Shield className="w-4 h-4 text-sage-500" />
          <span>Rules of Accountability</span>
        </div>
        <p className="font-sans">
          Sadhna is designed to build discipline. Every time you miss a target or fall off center, a small charge is logged. 
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
