import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, Calendar } from 'lucide-react';

export default function AnnouncementsModal({ onClose }) {
  const { announcements, markAllAnnouncementsRead } = useApp();

  useEffect(() => {
    // When opened, mark all as read
    markAllAnnouncementsRead();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-cream-100 w-full max-w-[420px] rounded-[32px] border border-cream-200 shadow-premium flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-cream-200 flex justify-between items-center bg-white rounded-t-[32px] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-sage-900 leading-none">
                System Updates
              </h2>
              <span className="text-[10px] text-cream-500 font-sans tracking-wide">
                Broadcasting to all Rise21 users
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream-50 border border-cream-200 flex items-center justify-center text-cream-500 hover:text-sage-850 hover:bg-cream-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {announcements.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-white border border-cream-200 rounded-full flex items-center justify-center mx-auto text-cream-300 mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-serif text-sage-800 italic">
                No announcements posted yet
              </p>
              <p className="text-xs text-cream-400 font-sans mt-1">
                You will see system updates here when they are sent.
              </p>
            </div>
          ) : (
            announcements.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-sage-100 rounded-2xl p-5 shadow-sm hover:shadow-premium transition-shadow duration-200 text-left"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-serif text-md font-bold text-sage-900 leading-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-sage-700 font-sans leading-relaxed whitespace-pre-wrap">
                  {item.message}
                </p>
                <div className="flex items-center gap-1 text-[9px] text-cream-400 font-sans mt-3 pt-2 border-t border-cream-50">
                  <Calendar className="w-3 h-3 text-cream-300" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-white border-t border-cream-200 shrink-0 text-center rounded-b-[32px]">
          <button
            onClick={onClose}
            className="w-full bg-sage-500 hover:bg-sage-600 text-white font-medium py-3 rounded-2xl text-xs transition-colors shadow-sm active:scale-[0.99]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
