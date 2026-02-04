import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface NextPrayerTimerProps {
  // Timer Data (optional, if null, we show date info)
  nextPrayer?: {
    name: string;
    time: Date;
  };
  hijriDate: string;
  onComplete?: () => void;

  // Navigation Props
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  isToday: boolean;
}

const NextPrayerTimer: React.FC<NextPrayerTimerProps> = ({ 
  nextPrayer, hijriDate, onComplete,
  currentDate, onPrev, onNext, onReset, isToday
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!nextPrayer) {
      setTimeLeft('');
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = nextPrayer.time.getTime() - now;

      if (distance <= 0) {
        setTimeLeft('الآن');
        if (distance > -1000 && onComplete) { 
           onComplete();
        }
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const pad = (n: number) => n.toString().padStart(2, '0');
        setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    };

    calculateTime(); // Initial call
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer, onComplete]);

  const formattedDate = currentDate.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="flex flex-col bg-emerald-600 dark:bg-emerald-700 rounded-3xl text-white shadow-lg shadow-emerald-200/50 dark:shadow-none relative overflow-hidden transition-all duration-500 w-full mb-3">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-emerald-500 dark:bg-emerald-600 opacity-30 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-20 h-20 rounded-full bg-emerald-400 dark:bg-emerald-500 opacity-20 blur-xl"></div>
      
      {/* Main Content - Compacted */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-4 pb-3 px-4 min-h-[110px]">
        {nextPrayer ? (
          <>
            <h3 className="text-emerald-100 font-medium text-[10px] tracking-wider uppercase mb-0.5">الصلاة القادمة</h3>
            <h2 className="text-2xl sm:text-3xl font-bold mb-0.5 capitalize">{nextPrayer.name}</h2>
            <div className="text-3xl sm:text-4xl font-mono font-light tracking-tight tabular-nums" dir="ltr">{timeLeft}</div>
          </>
        ) : (
          <>
             <h3 className="text-emerald-100 font-medium text-[10px] tracking-wider uppercase mb-1">جدول الصلوات</h3>
             <h2 className="text-xl font-bold mb-1">{hijriDate}</h2>
          </>
        )}
      </div>

      {/* Navigation Footer - Compacted */}
      <div className="relative z-10 bg-emerald-800/20 backdrop-blur-md border-t border-white/10 p-1.5 flex items-center justify-between" dir="rtl">
          <button 
            onClick={onNext}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors active:scale-95"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>

          <div className="flex flex-col items-center justify-center -space-y-0.5">
            <span className="text-xs font-bold">{formattedDate}</span>
            {!isToday && (
              <button 
                onClick={onReset}
                className="text-[9px] bg-white/90 hover:bg-white text-emerald-700 px-2 py-px rounded-full font-bold shadow-sm transition-colors mt-0.5"
              >
                اليوم
              </button>
            )}
          </div>

          <button 
            onClick={onPrev}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
      </div>
    </div>
  );
};

export default NextPrayerTimer;