import React from 'react';
import { useApp } from './context/AppContext';
import Auth from './views/Auth';
import Today from './views/Today';
import Challenges from './views/Challenges';
import Journal from './views/Journal';
import Wallet from './views/Wallet';
import Insights from './views/Insights';
import Profile from './views/Profile';
import { Home, Target, BookOpen, Wallet as WalletIcon, BarChart2 } from 'lucide-react';

export default function App() {
  const { token, activeTab, setActiveTab } = useApp();

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
    { id: 'insights', label: 'Insights', icon: BarChart2 }
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex justify-center items-center">
      {/* Mobile-first app container with mock device border */}
      <div className="w-full max-w-[420px] h-[100vh] sm:h-[880px] bg-cream-100 sm:rounded-[40px] sm:border-[8px] sm:border-sage-800 flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderView()}
        </div>

        {/* Bottom Navigation Bar - Glass Panel matching the mockup */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-cream-50 border-t border-cream-200 flex items-center justify-around px-4 z-40">
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

      </div>
    </div>
  );
}
