import React, { useState } from 'react';
import { 
  X, Shield, Award, Flame, Heart, BookOpen, 
  ChevronRight, ChevronLeft, Sparkles, CheckCircle2, TrendingUp, Bell 
} from 'lucide-react';

export default function TourModal({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Rise21 🌱",
      subtitle: "21-Day Self-Discipline Accountability",
      description: "Rise21 is designed to build solid self-discipline and positive habits through financial accountability, mindful trigger tracking, and daily selfie logs. Commit to your goals for 21 days and observe your path to self-control.",
      // Custom logo render
      logo: true,
      visual: (
        <div className="w-full h-32 rounded-2xl bg-cream-50/50 border border-cream-250 flex items-center justify-center p-4 relative overflow-hidden font-sans">
          <div className="text-center z-10">
            <span className="text-[10px] font-bold text-cream-400 uppercase tracking-widest block mb-1">
              THE 21-DAY PATHWAY
            </span>
            <div className="flex justify-center gap-1.5 mt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-lg flex items-center justify-center border text-[9px] font-bold ${
                  i < 3 
                    ? 'bg-sage-500 border-sage-500 text-white shadow-sm' 
                    : 'bg-white border-cream-200 text-cream-400'
                }`}>
                  {i + 1}
                </div>
              ))}
              <div className="w-6 h-6 rounded-lg flex items-center justify-center border border-dashed border-cream-300 text-[9px] text-cream-450">
                ...
              </div>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-orange-50 border border-orange-200 text-orange-700 text-[9px] font-bold font-serif animate-pulse">
                👑
              </div>
            </div>
            <p className="text-[10px] text-cream-500 font-sans mt-3">
              1% better every single day.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Today's Commitments 🎯",
      subtitle: "Daily Habit Tracking & Excuses",
      description: "Under the 'Today' tab, you view and check in your active challenges daily. Complete them to maintain your streak. If you fall short, you must log an excuse and accept a self-accountability penalty.",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      visual: (
        <div className="w-full h-32 rounded-2xl bg-white border border-sage-100 flex items-center justify-between p-4 shadow-sm font-sans">
          <div className="text-left">
            <span className="text-[9px] text-cream-400 font-bold uppercase tracking-wider">
              DAILY TASK
            </span>
            <h4 className="font-serif text-sm font-bold text-sage-900 mt-0.5">
              Morning Prayer / Sadhna
            </h4>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-orange-600 font-bold">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
              <span>5 Day Streak</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="w-9 h-9 rounded-xl bg-sage-50 border border-sage-150 flex items-center justify-center text-sage-600">
              ✕
            </button>
            <button type="button" className="w-9 h-9 rounded-xl bg-sage-500 flex items-center justify-center text-white shadow-sm">
              ✓
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Self-Accountability Wallet 💸",
      subtitle: "Redirect Penalty Balances for Good",
      description: "Any missed challenges or journal triggers charge your self-imposed penalty fee. These compose in your 'Wallet' tab. Redirect these collected balances to sponsor books, charity, or self-improvement purchases!",
      icon: Heart,
      iconBg: "bg-red-50 text-red-500 border border-red-100",
      visual: (
        <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-sage-700 to-sage-850 border border-sage-800 flex items-center justify-between p-5 text-white relative overflow-hidden font-sans shadow-md">
          <div className="text-left z-10">
            <span className="text-[9px] text-sage-200/80 font-bold uppercase tracking-wider">
              Discipline Wallet
            </span>
            <div className="text-2xl font-serif font-bold mt-0.5 animate-pulse">
              ₹150
            </div>
            <p className="text-[9px] text-sage-200/75 mt-1 leading-snug">
              Turn slip-ups into good actions.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl flex items-center justify-center font-bold text-xs select-none">
            🤝 Redirect to Good
          </div>
        </div>
      )
    },
    {
      title: "Mind Check & Triggers 🧘‍♂️",
      subtitle: "Build Self-Awareness & Reflections",
      description: "Log occurrences of negative triggers (anger, wasted time, excess screen-time) on the 'Journal' page. Write daily evening reflections (good deeds, lessons, gratitude lists) to review your progress with kindness.",
      icon: BookOpen,
      iconBg: "bg-orange-50 text-orange-600 border border-orange-100",
      visual: (
        <div className="w-full h-32 rounded-2xl bg-white border border-sage-100 flex flex-col justify-between p-4 shadow-sm font-sans text-xs">
          <div className="flex justify-between items-center border-b border-cream-50 pb-2">
            <span className="font-serif font-bold text-sage-900">Today's Reflection</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Gratitude</span>
          </div>
          <p className="italic text-cream-600 text-[10px] leading-relaxed line-clamp-2">
            "Grateful for having completed all my challenges today and maintaining mindfulness..."
          </p>
        </div>
      )
    },
    {
      title: "Insights & Monthly Grid 📊",
      subtitle: "Performance Metrics & Achievements",
      description: "Review detailed performance charts, streak milestones, and unlocked badges under 'Insights'. The interactive 'Monthly Log' grid provides a spreadsheet-like view where you can review and tweak previous days' logs.",
      icon: TrendingUp,
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
      visual: (
        <div className="w-full h-32 rounded-2xl bg-white border border-cream-200 p-3 shadow-sm font-sans text-[10px] overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between border-b pb-1 font-semibold text-cream-500">
            <span>CHALLENGE</span>
            <div className="flex gap-1.5 font-mono"><span>1</span><span>2</span><span>3</span><span>4</span></div>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="font-medium text-sage-800">🏃‍♂️ Exercise</span>
            <div className="flex gap-1.5 font-mono text-[8px] font-bold text-emerald-600">
              <span>✓</span><span>✓</span><span className="text-red-500">✕</span><span>✓</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-1 border-t border-cream-50">
            <span className="font-medium text-sage-800">🧘‍♂️ Sadhna</span>
            <div className="flex gap-1.5 font-mono text-[8px] font-bold text-emerald-600">
              <span>✓</span><span>✓</span><span>✓</span><span>✓</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Security & Reminders 🔒",
      subtitle: "Biometrics, Reminders & Announcements",
      description: "Navigate to your 'Profile' view to schedule daily log reminders and receive broadcast announcements. Enroll biometric verification (Face ID / Touch ID) to secure your daily logs and accountability statistics.",
      icon: Shield,
      iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
      visual: (
        <div className="w-full h-32 rounded-2xl bg-white border border-sage-100 p-4 shadow-sm font-sans text-xs flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-sage-900 block">Biometric Login</span>
              <span className="text-[9px] text-cream-400">Lock access with FaceID</span>
            </div>
            <div className="w-10 h-5 bg-sage-500 rounded-full relative flex items-center px-0.5">
              <div className="w-4 h-4 bg-white rounded-full translate-x-5 shadow-sm" />
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-cream-50 pt-2.5">
            <div>
              <span className="font-bold text-sage-900 block">App Updates 🔔</span>
              <span className="text-[9px] text-cream-400">Receive announcements</span>
            </div>
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('rise21_tour_completed', 'true');
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-cream-100 w-full max-w-[420px] rounded-[36px] border border-cream-250 shadow-premium flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-cream-400 uppercase tracking-widest font-sans">
            <span>Rise21 Guide</span>
            <span>•</span>
            <span>Step {currentStep + 1} of {steps.length}</span>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white border border-cream-200 flex items-center justify-center text-cream-500 hover:text-sage-850 hover:bg-cream-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 flex-1 flex flex-col items-center text-center overflow-y-auto">
          {/* Card Icon Header or Custom Logo */}
          {steps[currentStep].logo ? (
            <img 
              src="/Rise21.png" 
              alt="Rise21 Logo" 
              className="w-20 h-20 object-contain rounded-2xl border border-cream-200 shadow-sm mb-4 animate-float"
            />
          ) : (
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${steps[currentStep].iconBg}`}>
              <StepIcon className="w-6 h-6 animate-pulse" />
            </div>
          )}

          <h2 className="font-serif text-xl font-bold text-sage-900 leading-snug">
            {steps[currentStep].title}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-wider text-sage-600 font-sans mt-1">
            {steps[currentStep].subtitle}
          </p>

          <p className="text-xs text-cream-600 font-sans leading-relaxed mt-4 mb-6 px-1">
            {steps[currentStep].description}
          </p>

          {/* Graphical/Visual representation */}
          {steps[currentStep].visual}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 bg-white border-t border-cream-200 flex flex-col items-center gap-4 shrink-0 rounded-b-[36px]">
          {/* Pagination Indicators Dots */}
          <div className="flex justify-center gap-1.5">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentStep === idx 
                    ? 'w-6 bg-sage-500' 
                    : 'w-1.5 bg-cream-300 hover:bg-cream-400'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex w-full gap-3 text-xs font-semibold font-sans">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-cream-50 border border-cream-250 text-cream-650 hover:bg-cream-100 py-3 rounded-2xl flex items-center justify-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-cream-50 border border-cream-250 text-cream-650 hover:bg-cream-100 py-3 rounded-2xl transition-colors"
              >
                Skip Tour
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-sage-500 hover:bg-sage-600 text-white py-3 rounded-2xl flex items-center justify-center gap-1 shadow-sm transition-all active:scale-[0.98]"
            >
              <span>{currentStep === steps.length - 1 ? 'Start Journey' : 'Next'}</span>
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
