
import { PrayerSettings, CalculationMethodType, MadhabType, LocationData } from '../types';

const SETTINGS_KEY = 'noor_prayer_settings';
const LOCATION_KEY = 'noor_prayer_location';

const DEFAULT_SETTINGS: PrayerSettings = {
  calculationMethod: CalculationMethodType.MuslimWorldLeague,
  madhab: MadhabType.Shafi,
  adjustments: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
  hijriOffset: 0,
  prayerAlerts: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  theme: 'light',
  isAutoLocation: true,
  adhanSelections: {
    fajr: 'makkah',
    sunrise: 'soft_1',
    dhuhr: 'makkah',
    asr: 'makkah',
    maghrib: 'makkah',
    isha: 'makkah',
  },
};

export const saveSettings = (settings: PrayerSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
};

export const getSettings = (): PrayerSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old settings if necessary (handle iqamah removal gracefully)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { iqamahOffset, ...rest } = parsed; 
      
      return { 
        ...DEFAULT_SETTINGS, 
        ...rest, 
        adjustments: { ...DEFAULT_SETTINGS.adjustments, ...parsed.adjustments },
        prayerAlerts: { ...DEFAULT_SETTINGS.prayerAlerts, ...(parsed.prayerAlerts || {}) },
        adhanSelections: { ...DEFAULT_SETTINGS.adhanSelections, ...(parsed.adhanSelections || {}) }
      };
    }
  } catch (e) {
    console.error("Failed to load settings", e);
  }
  return DEFAULT_SETTINGS;
};

export const saveLocation = (location: LocationData) => {
  try {
    // Only save the persistent parts, excluding errors or loading states
    const { latitude, longitude, city } = location;
    const dataToSave = { latitude, longitude, city };
    localStorage.setItem(LOCATION_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error("Failed to save location", e);
  }
};

export const getSavedLocation = (): LocationData | null => {
  try {
    const stored = localStorage.getItem(LOCATION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load saved location", e);
  }
  return null;
};
