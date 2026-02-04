
import { PrayerSettings, PrayerTimesData } from '../types';

export class NotificationService {
  private static instance: NotificationService;
  private lastNotified: Record<string, { adhan: boolean }> = {};
  private lastDate: string = '';

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return;
    }
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      await Notification.requestPermission();
    }
  }

  private playSound() {
    // Simple chime using AudioContext to avoid external asset dependencies
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);

      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  private sendNotification(title: string, body: string) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico', // Assumes a favicon exists, otherwise browser default
        dir: 'rtl',
        lang: 'ar',
      });
      this.playSound();
    }
  }

  public checkNotifications(prayerTimes: PrayerTimesData, settings: PrayerSettings) {
    const today = new Date().toDateString();
    
    // Reset state if it's a new day
    if (today !== this.lastDate) {
      this.lastNotified = {};
      this.lastDate = today;
    }

    const now = new Date();
    const prayerNames: Record<string, string> = {
      fajr: 'الفجر',
      sunrise: 'الشروق',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء'
    };

    const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

    prayers.forEach(prayerId => {
      // Skip if alerts disabled for this prayer
      if (!settings.prayerAlerts[prayerId]) return;

      const prayerTime = prayerTimes[prayerId];
      if (!prayerTime) return;

      // Initialize state for this prayer
      if (!this.lastNotified[prayerId]) {
        this.lastNotified[prayerId] = { adhan: false };
      }

      // Check Adhan (Time window: within the same minute)
      const diffAdhan = now.getTime() - prayerTime.getTime();
      if (diffAdhan >= 0 && diffAdhan < 60000 && !this.lastNotified[prayerId].adhan) {
        this.sendNotification(
          `حان وقت صلاة ${prayerNames[prayerId]}`,
          'الله أكبر، الله أكبر'
        );
        this.lastNotified[prayerId].adhan = true;
      }
    });
  }
}
