
export enum CalculationMethodType {
  MuslimWorldLeague = 'MuslimWorldLeague',
  Egyptian = 'Egyptian',
  Karachi = 'Karachi',
  UmmAlQura = 'UmmAlQura',
  Dubai = 'Dubai',
  Qatar = 'Qatar',
  Kuwait = 'Kuwait',
  MoonsightingCommittee = 'MoonsightingCommittee',
  Singapore = 'Singapore',
  Turkey = 'Turkey',
  Tehran = 'Tehran',
  NorthAmerica = 'NorthAmerica',
}

export enum MadhabType {
  Shafi = 'Shafi',
  Hanafi = 'Hanafi',
}

export interface PrayerAdjustments {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  [key: string]: number;
}

export type ThemeMode = 'light' | 'dark';

export interface PrayerSettings {
  calculationMethod: CalculationMethodType;
  madhab: MadhabType;
  adjustments: PrayerAdjustments;
  hijriOffset: number; // days (+/-)
  prayerAlerts: Record<string, boolean>;
  theme: ThemeMode;
  isAutoLocation: boolean;
  adhanSelections: Record<string, string>; // prayerId -> soundId
}

export interface PrayerTimesData {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  [key: string]: Date;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  error?: string;
  loading: boolean;
}

export interface FormattedPrayer {
  id: string;
  name: string;
  time: Date;
  isNext: boolean;
  isCurrent: boolean;
  notificationEnabled: boolean;
}

export interface AdhanSound {
  id: string;
  name: string;
  url: string; // Remote URL or 'local'
  category: 'adhan' | 'alarm';
  isLocal?: boolean;
}
