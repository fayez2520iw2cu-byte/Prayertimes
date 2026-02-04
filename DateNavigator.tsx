import React from 'react';
import { ChevronRight, ChevronLeft, CalendarCheck } from 'lucide-react';

interface DateNavigatorProps {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  isToday: boolean;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ date, onPrev, onNext, onReset, isToday }) => {
  
  const formattedDate = date.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="flex items-center justify-between bg-emerald-600 dark:bg-emerald-800 rounded-2xl p-1.5 mb-4 shrink-0 shadow-lg shadow-emerald-200/50 dark:shadow-none text-white relative">
      <button 
        onClick={onNext}
        className="p-2 rounded-xl text-emerald-100 hover:bg-emerald-500/50 hover:text-white transition-all active:scale-95"
        aria-label="اليوم التالي"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center">
        <span className="text-base font-bold tracking-wide">{formattedDate}</span>
        {!isToday && (
          <button 
            onClick={onReset}
            className="absolute left-1/2 -translate-x-1/2 -bottom-2.5 bg-white text-emerald-700 text-[10px] font-bold px-3 py-0.5 rounded-full shadow-md hover:bg-emerald-50 transition-colors flex items-center gap-1 z-10"
          >
            <CalendarCheck className="w-3 h-3" />
            <span>اليوم</span>
          </button>
        )}
      </div>

      <button 
        onClick={onPrev}
        className="p-2 rounded-xl text-emerald-100 hover:bg-emerald-500/50 hover:text-white transition-all active:scale-95"
        aria-label="اليوم السابق"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
  );
};

export default DateNavigator;