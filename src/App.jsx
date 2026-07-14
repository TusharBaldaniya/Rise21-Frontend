import React from 'react';
import { useApp } from './context/AppContext';
import Auth from './views/Auth';
import Today from './views/Today';
import Challenges from './views/Challenges';
import Journal from './views/Journal';
import Wallet from './views/Wallet';
import Insights from './views/Insights';
import Profile from './views/Profile';
import Admin from './views/Admin';
import AnnouncementsModal from './components/AnnouncementsModal';
import TourModal from './components/TourModal';
import { Home, Target, BookOpen, Wallet as WalletIcon, BarChart2, Settings } from 'lucide-react';

export default function App() {
  const { 
    token, 
    user, 
    activeTab, 
    setActiveTab, 
    inAppToast, 
    setInAppToast, 
    isOnline,
    showAnnouncementsModal,
    setShowAnnouncementsModal,
    showTour,
    setShowTour
  } = useApp();

  // If user is not authenticated, show Auth Page
  if (!token) {
    return <Auth />;
  }

  // Active View Router
  const renderView = () => {
    switch (activeTab) {
      case 'today':
        return <Today />;
      case 'challenges':
        return <Challenges />;
      case 'journal':
        return <Journal />;
      case 'wallet':
        return <Wallet />;
      case 'insights':
        return <Insights />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return user?.role === 'admin' ? <Admin /> : <Today />;
      default:
        return <Today />;
    }
  };

  // Nav Items array matching design mockup
  const navItems = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'wallet', label: 'Wallet', icon: WalletIcon },
    { id: 'insights', label: 'Insights', icon: BarChart2 },
    ...(user && user.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Settings }] : [])
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex justify-center items-center">
      {/* Mobile-first app container with mock device border */}
      <div className="w-full max-w-[420px] h-[100dvh] sm:h-[880px] bg-cream-100 sm:rounded-[40px] sm:border-[8px] sm:border-sage-800 flex flex-col relative shadow-2xl overflow-hidden overscroll-y-contain">
        
        {/* Offline Mode Banner */}
        {!isOnline && (
          <div className="bg-orange-500 text-white text-[10px] py-1 text-center font-semibold font-sans tracking-wide shrink-0 animate-in slide-in-from-top duration-300 z-50 flex items-center justify-center gap-1 shadow-sm">
            <span>📴</span>
            <span>Offline Mode — Changes will sync when connected</span>
          </div>
        )}
        {/* Global In-App Toast Notification */}
        {inAppToast && inAppToast.show && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-white border border-sage-100 rounded-2xl p-4 shadow-premium flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <p className="text-xs font-sans text-sage-800 font-semibold leading-snug">
                {inAppToast.message}
              </p>
            </div>
            <button
              onClick={() => setInAppToast({ show: false, message: '' })}
              className="text-cream-400 hover:text-sage-850 text-xs font-bold ml-2 p-1.5 focus:outline-none transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderView()}
        </div>

        {/* Bottom Navigation Bar - Glass Panel matching the mockup */}
        <div className="h-20 bg-cream-50/90 backdrop-blur-md border-t border-cream-200 flex items-center justify-around px-4 z-40 shrink-0">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center flex-1 py-1 focus:outline-none transition-all"
              >
                {/* Icon wrapper with soft green pill background when active */}
                <div 
                  className={`px-5 py-1.5 rounded-full mb-1 transition-all ${
                    isActive 
                      ? 'bg-sage-100 text-sage-800' 
                      : 'text-cream-500 hover:text-sage-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Text Label */}
                <span 
                  className={`text-[10px] font-sans font-medium transition-all ${
                    isActive 
                      ? 'text-sage-800 font-semibold' 
                      : 'text-cream-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Announcements Modal */}
        {showAnnouncementsModal && (
          <AnnouncementsModal onClose={() => setShowAnnouncementsModal(false)} />
        )}

        {/* Global Onboarding Walkthrough Tour Modal */}
        {showTour && (
          <TourModal onClose={() => setShowTour(false)} />
        )}

      </div>
    </div>
  );
}
