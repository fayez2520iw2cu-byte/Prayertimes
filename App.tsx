import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PrayerService } from './services/prayerService';
import { FormattedPrayer } from './types';
import { useSettings } from './contexts/SettingsContext';
import PrayerCard from './components/PrayerCard';
import NextPrayerTimer from './components/NextPrayerTimer';
import SettingsScreen from './components/SettingsScreen';
import QiblaModal from './components/QiblaModal';
import { Settings, Calendar, AlertCircle, Moon, Sun, Compass } from 'lucide-react';

const App: React.FC = () => {
  // Use Global State
  const { 
    settings, location, prayerTimes, selectedDate,
    updateSettings, refreshLocation, togglePrayerAlert, checkNotifications, toggleTheme,
    changeDate, resetDate
  } = useSettings();
  
  // Local UI State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentScreen, setCurrentScreen] = useState<'home' | 'settings'>('home');
  const [isQiblaOpen, setIsQiblaOpen] = useState(false);

  // Check if selected date is Today
  const isToday = useMemo(() => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() &&
           selectedDate.getMonth() === today.getMonth() &&
           selectedDate.getFullYear() === today.getFullYear();
  }, [selectedDate]);

  // Clock & Notification Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      checkNotifications(); // Check for alerts every second
    }, 1000);
    return () => clearInterval(timer);
  }, [checkNotifications]);

  const handleTimerComplete = useCallback(() => {
    console.log("Prayer time reached, refreshing...");
    if (isToday) {
       refreshLocation();
    }
  }, [refreshLocation, isToday]);

  // Derived Data: Formatted Prayer List
  const formattedPrayers: FormattedPrayer[] = useMemo(() => {
    if (!prayerTimes) return [];
    
    // Arabic Mapping
    const prayerNames: Record<string, string> = {
      fajr: 'الفجر',
      sunrise: 'الشروق',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء'
    };

    const prayers = [
      { id: 'fajr', name: prayerNames.fajr, time: prayerTimes.fajr },
      { id: 'sunrise', name: prayerNames.sunrise, time: prayerTimes.sunrise },
      { id: 'dhuhr', name: prayerNames.dhuhr, time: prayerTimes.dhuhr },
      { id: 'asr', name: prayerNames.asr, time: prayerTimes.asr },
      { id: 'maghrib', name: prayerNames.maghrib, time: prayerTimes.maghrib },
      { id: 'isha', name: prayerNames.isha, time: prayerTimes.isha },
    ];

    let nextId: string | undefined;
    
    if (isToday) {
      const nextPrayerData = PrayerService.getNextPrayer(
        prayerTimes, 
        location.latitude, 
        location.longitude, 
        settings
      );
      nextId = nextPrayerData?.nextPrayer;
    }

    return prayers.map(p => ({
      ...p,
      isNext: p.id === nextId,
      isCurrent: false, 
      notificationEnabled: settings.prayerAlerts?.[p.id] ?? false,
    }));
  }, [prayerTimes, currentTime, settings.prayerAlerts, location, settings, isToday]); 

  // Next Prayer Target (For Timer)
  const nextPrayerTarget = useMemo(() => {
    if (!prayerTimes || !isToday) return null;
    return PrayerService.getNextPrayer(prayerTimes, location.latitude, location.longitude, settings);
  }, [prayerTimes, location, settings, currentTime, isToday]);

  const nextPrayerObj = formattedPrayers.find(p => p.id === nextPrayerTarget?.nextPrayer);
  
  // Calculate Hijri Date with Offset
  const getHijriDateString = (baseDate: Date, offset: number) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + offset);
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
  };

  const displayHijriDate = getHijriDateString(selectedDate, settings.hijriOffset);
  const headerHijriDate = getHijriDateString(new Date(), settings.hijriOffset);

  // Gregorian Date (Header)
  const headerGregorianDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl relative flex flex-col transition-colors duration-300 overflow-hidden">
      
      {/* Route: Home Screen */}
      {currentScreen === 'home' && (
        <>
          {/* Header Section */}
          <header className="px-5 pt-8 pb-3 bg-white dark:bg-slate-900 shrink-0 z-20">
            <div className="flex justify-between items-center mb-4">
              {/* Qibla Button (Replacing Location) */}
              <button
                onClick={() => setIsQiblaOpen(true)}
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-[#2D6A4F] dark:hover:text-emerald-400 transition-colors group px-1"
              >
                 <div className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-slate-700 transition-colors">
                    <Compass className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-bold">القبلة</span>
              </button>
              
              {/* Settings & Theme */}
              <div className="flex gap-2">
                <button 
                  onClick={toggleTheme}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-300 active:scale-95"
                >
                  {settings.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setCurrentScreen('settings')}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-300 active:scale-95"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs bg-[#F8F9FA] dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider mb-0.5">ميلادي</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{headerGregorianDate}</span>
              </div>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
              <div className="flex flex-col items-end">
                <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider mb-0.5">هجري</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{headerHijriDate}</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-5 pb-5 flex flex-col min-h-0 overflow-hidden">
            
            {location.error && (
              <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-start text-xs shrink-0">
                <AlertCircle className="w-4 h-4 ms-2 shrink-0" />
                <p>{location.error}</p>
              </div>
            )}

            {location.loading && !prayerTimes ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-sm animate-pulse">جاري حساب الأوقات...</p>
                </div>
            ) : prayerTimes ? (
              <div className="flex flex-col h-full">
                
                {/* 1. Hero Section (Timer & Navigation) */}
                <div className="shrink-0 transition-all duration-300">
                   <NextPrayerTimer 
                      nextPrayer={isToday && nextPrayerObj && nextPrayerTarget ? {
                        name: nextPrayerObj.name,
                        time: new Date(new Date().getTime() + nextPrayerTarget.timeDiff)
                      } : undefined}
                      hijriDate={displayHijriDate}
                      onComplete={handleTimerComplete}
                      currentDate={selectedDate}
                      onPrev={() => changeDate(-1)}
                      onNext={() => changeDate(1)}
                      onReset={resetDate}
                      isToday={isToday}
                    />
                </div>

                {/* 2. Prayers List */}
                <div className="flex-1 flex flex-col justify-between min-h-0">
                  <h3 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5 ms-1 shrink-0">
                    {isToday ? "مواقيت اليوم" : "المواقيت"}
                  </h3>
                  
                  <div className="flex-1 flex flex-col justify-between gap-1.5 overflow-y-auto no-scrollbar">
                    {formattedPrayers.map(prayer => (
                      <PrayerCard 
                        key={prayer.id} 
                        prayer={prayer} 
                        onToggleAlert={() => togglePrayerAlert(prayer.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>تعذر تحميل أوقات الصلاة</p>
              </div>
            )}
          </main>
          
          {/* Qibla Modal */}
          <QiblaModal 
             isOpen={isQiblaOpen} 
             onClose={() => setIsQiblaOpen(false)} 
             latitude={location.latitude} 
             longitude={location.longitude} 
          />
        </>
      )}

      {/* Route: Settings Screen */}
      {currentScreen === 'settings' && (
        <SettingsScreen 
          currentSettings={settings}
          onSave={updateSettings} // Directly update on changes (Auto-save)
          onBack={() => setCurrentScreen('home')}
          onRefreshLocation={refreshLocation}
        />
      )}

    </div>
  );
};

export default App;