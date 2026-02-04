import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PrayerSettings, PrayerTimesData, LocationData } from '../types';
import { getSettings, saveSettings, getSavedLocation, saveLocation } from '../services/storageService';
import { LocationService, MAKKAH_COORDS } from '../services/locationService';
import { PrayerService } from '../services/prayerService';
import { NotificationService } from '../services/notificationService';

interface SettingsContextType {
  settings: PrayerSettings;
  location: LocationData;
  prayerTimes: PrayerTimesData | null;
  selectedDate: Date;
  updateSettings: (newSettings: PrayerSettings) => void;
  refreshLocation: () => Promise<void>;
  setManualLocation: (lat: number, lng: number, city: string) => void;
  togglePrayerAlert: (prayerId: string) => void;
  checkNotifications: () => void;
  toggleTheme: () => void;
  changeDate: (days: number) => void;
  resetDate: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [settings, setSettingsState] = useState<PrayerSettings>(getSettings());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [location, setLocation] = useState<LocationData>(() => {
    // Try to load cached location for immediate offline support
    const saved = getSavedLocation();
    return saved || {
      latitude: 0,
      longitude: 0,
      city: "جاري التحميل...",
      loading: true,
    };
  });
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);

  /**
   * Calculate prayer times based on current location, settings, and SELECTED DATE
   */
  const calculatePrayers = useCallback((lat: number, lng: number, currentSettings: PrayerSettings, date: Date) => {
    const times = PrayerService.getTodayPrays(lat, lng, currentSettings, date);
    setPrayerTimes(times);
  }, []);

  /**
   * Date Navigation
   */
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const resetDate = () => {
    setSelectedDate(new Date());
  };

  // Re-calculate when date changes
  useEffect(() => {
    if (location.latitude && location.longitude) {
      calculatePrayers(location.latitude, location.longitude, settings, selectedDate);
    }
  }, [selectedDate, location.latitude, location.longitude, settings, calculatePrayers]);


  /**
   * Apply Theme to DOM
   */
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    const newSettings = { ...settings, theme: newTheme };
    updateSettings(newSettings);
  };

  /**
   * Update settings and save locally
   */
  const updateSettings = (newSettings: PrayerSettings) => {
    const prevAutoLocation = settings.isAutoLocation;
    setSettingsState(newSettings);
    saveSettings(newSettings);
    
    // Recalculate prayers with existing location
    if (location.latitude && location.longitude) {
      calculatePrayers(location.latitude, location.longitude, newSettings, selectedDate);
    }

    // Trigger location refresh only if Auto was newly ENABLED
    if (newSettings.isAutoLocation && !prevAutoLocation) {
        refreshLocation();
    }
  };

  const setManualLocation = (lat: number, lng: number, city: string) => {
    const newLocation = {
        latitude: lat,
        longitude: lng,
        city: city,
        loading: false,
        error: undefined
    };
    setLocation(newLocation);
    saveLocation(newLocation);
    calculatePrayers(lat, lng, settings, selectedDate);
  };

  const togglePrayerAlert = (prayerId: string) => {
    const newSettings = {
      ...settings,
      prayerAlerts: {
        ...settings.prayerAlerts,
        [prayerId]: !settings.prayerAlerts[prayerId]
      }
    };
    updateSettings(newSettings);
    
    // Request permission if enabling
    if (newSettings.prayerAlerts[prayerId]) {
      NotificationService.getInstance().requestPermission();
    }
  };

  /**
   * Trigger notification check manually (called by app timer)
   */
  const checkNotifications = useCallback(() => {
    if (prayerTimes) {
      const isToday = selectedDate.toDateString() === new Date().toDateString();
      if (isToday) {
        NotificationService.getInstance().checkNotifications(prayerTimes, settings);
      }
    }
  }, [prayerTimes, settings, selectedDate]);

  /**
   * Refresh location and update prayer times
   */
  const refreshLocation = useCallback(async () => {
    // If Manual mode is on, DO NOT fetch GPS
    if (!settings.isAutoLocation) {
        const saved = getSavedLocation();
        if (saved) {
            setLocation({ ...saved, loading: false });
            calculatePrayers(saved.latitude, saved.longitude, settings, selectedDate);
        }
        return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      // 1. Get Coordinates
      const coords = await LocationService.getCurrentLocation();
      
      // 2. Get City Name
      let cityName = "موقع غير معروف";
      try {
        cityName = await LocationService.getAddressFromCoords(coords.latitude, coords.longitude);
      } catch (e) {
        console.warn("Could not fetch city name", e);
      }
      
      const newLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        city: cityName,
        loading: false,
      };

      // 3. Update State & Cache
      setLocation(newLocation);
      saveLocation(newLocation);
      
      // 4. Calculate Prayers
      calculatePrayers(coords.latitude, coords.longitude, settings, selectedDate);
      
    } catch (error: any) {
      console.error("Location Service Error:", error);
      
      const cached = getSavedLocation();
      if (cached) {
         setLocation({ ...cached, loading: false, error: "تعذر تحديث الموقع. نستخدم آخر موقع محفوظ." });
         calculatePrayers(cached.latitude, cached.longitude, settings, selectedDate);
      } else {
        const city = "مكة المكرمة (افتراضي)";
        setLocation({
          latitude: MAKKAH_COORDS.latitude,
          longitude: MAKKAH_COORDS.longitude,
          city,
          loading: false,
          error: error.message || "تعذر تحديد الموقع",
        });
        calculatePrayers(MAKKAH_COORDS.latitude, MAKKAH_COORDS.longitude, settings, selectedDate);
      }
    }
  }, [settings, calculatePrayers, selectedDate]);

  // Initial Load
  useEffect(() => {
    refreshLocation();
    NotificationService.getInstance().requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <SettingsContext.Provider value={{ 
      settings, location, prayerTimes, selectedDate, 
      updateSettings, refreshLocation, setManualLocation, togglePrayerAlert, checkNotifications, toggleTheme,
      changeDate, resetDate 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};