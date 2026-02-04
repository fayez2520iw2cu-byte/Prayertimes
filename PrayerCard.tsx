import React from 'react';
import { FormattedPrayer } from '../types';
import { Clock, Sun, Sunrise, Sunset, Moon, CloudSun, Bell, BellOff } from 'lucide-react';

interface PrayerCardProps {
  prayer: FormattedPrayer;
  onToggleAlert?: () => void;
}

const getIcon = (id: string, className: string) => {
  switch (id) {
    case 'fajr': return <Moon className={className} />;
    case 'sunrise': return <Sunrise className={className} />;
    case 'dhuhr': return <Sun className={className} />;
    case 'asr': return <CloudSun className={className} />; 
    case 'maghrib': return <Sunset className={className} />;
    case 'isha': return <Moon className={className} />;
    default: return <Clock className={className} />;
  }
};

const PrayerCard: React.FC<PrayerCardProps> = ({ prayer, onToggleAlert }) => {
  const { id, name, time, notificationEnabled } = prayer;
  
  // Format time (e.g., 04:30 م)
  const timeString = time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Uniform styling for all rows (No specific highlighting for next/current)
  const containerClass = "flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm w-full";
  const textClass = "font-medium text-base sm:text-lg text-slate-700 dark:text-slate-200";
  const iconContainerClass = "p-2 rounded-full bg-slate-50 dark:bg-slate-700";
  const iconClass = "w-5 h-5 text-slate-400 dark:text-slate-400";

  return (
    <div className={containerClass}>
      <div className="flex items-center">
        <div className={iconContainerClass}>
          {getIcon(id, iconClass)}
        </div>
        <span className={`ms-4 capitalize ${textClass}`}>{name}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={textClass} dir="ltr">{timeString}</span>
        
        {onToggleAlert && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleAlert(); }}
            className={`p-2 rounded-full transition-colors ${
              notificationEnabled 
                ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' 
                : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={notificationEnabled ? "إيقاف التنبيه" : "تفعيل التنبيه"}
          >
            {notificationEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default PrayerCard;