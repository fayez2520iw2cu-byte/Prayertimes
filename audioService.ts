
import { AdhanSound } from '../types';

export const ADHAN_LIBRARY: AdhanSound[] = [
  { id: 'nasser', name: 'ناصر القطامي', url: 'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__08.athan.mp3', category: 'adhan' },
  { id: 'mishary', name: 'مشاري العفاسي', url: 'https://download.tvquran.com/download/selections/180/58b0dac02106f.mp3', category: 'adhan' },
  { id: 'mansoor', name: 'منصور الزهراني', url: 'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__01.athan.mp3', category: 'adhan' },
  { id: 'ibrahim', name: 'ابراهيم الأركاني', url: 'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__03.athan.mp3', category: 'adhan' },
  { id: 'hamad', name: 'حمد دغريري', url: 'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__06.athan.mp3', category: 'adhan' },
  { id: 'majed', name: 'ماجد الهمداني', url: 'https://download.tvquran.com/download/TvQuran.com__Athan/TvQuran.com__05.athan.mp3', category: 'adhan' },
  { id: 'nafis', name: 'أحمد النفيس', url: 'https://haii3alslah.com/audio/526/haii3alslah936584.mp3', category: 'adhan' },
  { id: 'abdulbasit', name: 'عبد الباسط عبد الصمد', url: 'https://praytimes.org/audio/sunni/Abdul-Basit.mp3', category: 'adhan' },
];

export const ALARM_LIBRARY: AdhanSound[] = [
  { id: 'soft_1', name: 'تنبيه هادئ 1', url: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg', category: 'alarm' },
  { id: 'soft_2', name: 'تنبيه هادئ 2', url: 'https://actions.google.com/sounds/v1/alarms/mechanical_clock_ring.ogg', category: 'alarm' },
];

const DB_NAME = 'NoorAudioDB';
const STORE_NAME = 'sounds';
const LOCAL_SOUNDS_META_KEY = 'noor_local_sounds_meta';

export class AudioService {
  private static instance: AudioService;
  private dbPromise: Promise<IDBDatabase>;
  private currentAudio: HTMLAudioElement | null = null;

  private constructor() {
    // Increased version to 2 to ensure object store is created if missed in v1
    this.dbPromise = this.openDB();
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      // Version 2 triggers upgrade if store was missing in version 1
      const request = indexedDB.open(DB_NAME, 2);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  // --- Local Sound Management ---

  public getLocalSounds(): AdhanSound[] {
    try {
      const stored = localStorage.getItem(LOCAL_SOUNDS_META_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public async addLocalSound(file: File): Promise<AdhanSound> {
    const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sound: AdhanSound = {
      id,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for display
      url: 'local',
      category: 'adhan',
      isLocal: true
    };

    // Save blob to IDB
    try {
        const db = await this.dbPromise;
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.put(file, id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("Failed to save to IndexedDB", e);
        throw e;
    }

    // Save meta to localStorage
    const current = this.getLocalSounds();
    const updated = [...current, sound];
    localStorage.setItem(LOCAL_SOUNDS_META_KEY, JSON.stringify(updated));

    return sound;
  }

  public async removeLocalSound(id: string): Promise<void> {
    // Remove from IDB (Best effort)
    try {
        const db = await this.dbPromise;
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.warn("Failed to remove from IDB, proceeding to clear metadata", e);
    }

    // Remove from localStorage
    const current = this.getLocalSounds();
    const updated = current.filter(s => s.id !== id);
    localStorage.setItem(LOCAL_SOUNDS_META_KEY, JSON.stringify(updated));
  }

  // --- Playback & Downloads ---

  public async isSoundDownloaded(id: string): Promise<boolean> {
    if (id.startsWith('local_')) return true; // Local sounds are always "downloaded"
    try {
      const db = await this.dbPromise;
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  public async downloadSound(sound: AdhanSound): Promise<void> {
    if (sound.isLocal) return;

    try {
      // mode: 'cors' is default but good to be explicit. 
      // If server doesn't support CORS, this will fail, which is expected for caching.
      const response = await fetch(sound.url, { mode: 'cors' });
      if (!response.ok) throw new Error(`Network error: ${response.status}`);
      const blob = await response.blob();
      
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(blob, sound.id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      // Log as warning since this is just a caching mechanism. Playback will fall back to streaming.
      console.warn(`Could not cache sound '${sound.name}'. It will be streamed instead. Error:`, error);
    }
  }

  public async playSound(id: string): Promise<void> {
    this.stopSound();

    try {
      let src: string;
      const db = await this.dbPromise;
      
      // 1. Try fetching from DB
      const blob: Blob | undefined = await new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(undefined);
      });

      if (blob) {
        src = URL.createObjectURL(blob);
      } else {
        // 2. Fallback to URL if not in DB
        const allSounds = [...ADHAN_LIBRARY, ...ALARM_LIBRARY];
        const sound = allSounds.find(s => s.id === id);
        
        if (sound && !sound.isLocal) {
            src = sound.url;
            // Attempt to cache in background (fire and forget)
            this.downloadSound(sound).catch(() => {});
        } else {
            // Check if it's a local sound that wasn't found in DB
            if (id.startsWith('local_')) {
                console.error("Local sound not found in DB");
                this.playFallback();
                return;
            }
            this.playFallback();
            return;
        }
      }

      const audio = new Audio(src);
      this.currentAudio = audio;
      
      // Error handling for playback
      audio.onerror = (e) => {
        // Only error if this is still the active audio
        if (this.currentAudio === audio) {
             console.error("Error playing audio source", e);
             this.playFallback();
        }
      };

      audio.onended = () => {
        if (src.startsWith('blob:')) URL.revokeObjectURL(src);
        if (this.currentAudio === audio) {
            this.currentAudio = null;
        }
      };

      await audio.play();

    } catch (e: any) {
      // Ignore AbortError (happens when pausing while loading) or interruption errors
      if (e.name === 'AbortError' || (e.message && e.message.includes('interrupted'))) {
        return;
      }
      console.error("Playback failed", e);
      this.playFallback();
    }
  }

  public stopSound() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  private playFallback() {
      // Simple Beep using Web Audio API
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
        osc.start();
        osc.stop(ctx.currentTime + 1);
      } catch (e) { console.error(e); }
  }
}
