import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { PrayerSettings, PrayerTimesData, CalculationMethodType, MadhabType } from '../types';

const getCalculationMethod = (method: CalculationMethodType) => {
  switch (method) {
    case CalculationMethodType.MuslimWorldLeague: return CalculationMethod.MuslimWorldLeague();
    case CalculationMethodType.Egyptian: return CalculationMethod.Egyptian();
    case CalculationMethodType.Karachi: return CalculationMethod.Karachi();
    case CalculationMethodType.UmmAlQura: return CalculationMethod.UmmAlQura();
    case CalculationMethodType.Dubai: return CalculationMethod.Dubai();
    case CalculationMethodType.Qatar: return CalculationMethod.Qatar();
    case CalculationMethodType.Kuwait: return CalculationMethod.Kuwait();
    case CalculationMethodType.MoonsightingCommittee: return CalculationMethod.MoonsightingCommittee();
    case CalculationMethodType.Singapore: return CalculationMethod.Singapore();
    case CalculationMethodType.Turkey: return CalculationMethod.Turkey();
    case CalculationMethodType.Tehran: return CalculationMethod.Tehran();
    case CalculationMethodType.NorthAmerica: return CalculationMethod.NorthAmerica();
    default: return CalculationMethod.MuslimWorldLeague();
  }
};

const getMadhab = (madhab: MadhabType) => {
  return madhab === MadhabType.Hanafi ? Madhab.Hanafi : Madhab.Shafi;
};

export class PrayerService {
  static getTodayPrays(
    latitude: number,
    longitude: number,
    settings: PrayerSettings,
    date: Date = new Date()
  ): PrayerTimesData | null {
    try {
      const coordinates = new Coordinates(latitude, longitude);
      const params = getCalculationMethod(settings.calculationMethod);
      params.madhab = getMadhab(settings.madhab);

      if (settings.adjustments) {
        params.adjustments.fajr = settings.adjustments.fajr || 0;
        params.adjustments.sunrise = settings.adjustments.sunrise || 0;
        params.adjustments.dhuhr = settings.adjustments.dhuhr || 0;
        params.adjustments.asr = settings.adjustments.asr || 0;
        params.adjustments.maghrib = settings.adjustments.maghrib || 0;
        params.adjustments.isha = settings.adjustments.isha || 0;
      }

      const prayerTimes = new PrayerTimes(coordinates, date, params);

      return {
        fajr: prayerTimes.fajr,
        sunrise: prayerTimes.sunrise,
        dhuhr: prayerTimes.dhuhr,
        asr: prayerTimes.asr,
        maghrib: prayerTimes.maghrib,
        isha: prayerTimes.isha,
      };
    } catch (error) {
      console.error("Error calculating prayer times", error);
      return null;
    }
  }

  static getNextPrayer(
    prayerTimes: PrayerTimesData, 
    latitude: number, 
    longitude: number, 
    settings: PrayerSettings
  ): { nextPrayer: string; timeDiff: number } | null {
    const now = new Date().getTime();
    const prayers = [
      { id: 'fajr', time: prayerTimes.fajr.getTime() },
      { id: 'sunrise', time: prayerTimes.sunrise.getTime() },
      { id: 'dhuhr', time: prayerTimes.dhuhr.getTime() },
      { id: 'asr', time: prayerTimes.asr.getTime() },
      { id: 'maghrib', time: prayerTimes.maghrib.getTime() },
      { id: 'isha', time: prayerTimes.isha.getTime() },
    ];

    // Find first prayer in the future today
    for (const prayer of prayers) {
      if (prayer.time > now) {
        return { nextPrayer: prayer.id, timeDiff: prayer.time - now };
      }
    }

    // If no prayers left today, calculate next day's Fajr accurately
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowPrays = PrayerService.getTodayPrays(latitude, longitude, settings, tomorrow);
    
    if (tomorrowPrays) {
      return { 
        nextPrayer: 'fajr', 
        timeDiff: tomorrowPrays.fajr.getTime() - now 
      };
    }

    return null;
  }
}