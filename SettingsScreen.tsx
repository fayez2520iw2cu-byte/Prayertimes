import React, { useState, useMemo, useEffect } from 'react';
import { ArrowRight, ChevronDown, Check, Globe, Sliders, MapPin, Search, ChevronLeft, Plus, Minus, RotateCcw, Music, Play, Square, Download, CalendarDays } from 'lucide-react';
import { PrayerSettings, CalculationMethodType, MadhabType, PrayerTimesData, AdhanSound } from '../types';
import { COUNTRIES, Country, City } from '../data/cities';
import { useSettings } from '../contexts/SettingsContext';
import { PrayerService } from '../services/prayerService';
import { ADHAN_LIBRARY, ALARM_LIBRARY, AudioService } from '../services/audioService';

interface SettingsScreenProps {
  currentSettings: PrayerSettings;
  onSave: (settings: PrayerSettings) => void;
  onBack: () => void;
  onRefreshLocation: () => void;
}

type SettingsView = 'main' | 'country_select' | 'city_select' | 'adhan_list' | 'sound_select' | 'manual_adjustments';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ currentSettings, onSave, onBack, onRefreshLocation }) => {
  const { setManualLocation, location, selectedDate } = useSettings();
  
  // Use currentSettings directly (controlled component by Parent/Context)
  
  const [view, setView] = useState<SettingsView>('main');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sound Selection State
  const [selectedPrayerForSound, setSelectedPrayerForSound] = useState<string | null>(null);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [downloadedSounds, setDownloadedSounds] = useState<Record<string, boolean>>({});
  const [localSounds, setLocalSounds] = useState<AdhanSound[]>([]);

  // Helper to trigger save silently
  const updateAndSave = (newSettings: PrayerSettings) => {
    // Apply Mishary restriction logic before saving
    const finalSettings = { ...newSettings };
    const restrictedPrayers = ['dhuhr', 'asr', 'maghrib', 'isha'];
    restrictedPrayers.forEach(p => {
        if (finalSettings.adhanSelections[p] === 'mishary') {
            finalSettings.adhanSelections[p] = 'nasser';
        }
    });

    onSave(finalSettings);
  };

  // Initialize data
  useEffect(() => {
    const initAudioData = async () => {
      // 1. Fetch Local Sounds
      const locals = AudioService.getInstance().getLocalSounds();
      setLocalSounds(locals);

      // 2. Check Download Status
      const status: Record<string, boolean> = {};
      const allSounds = [...ADHAN_LIBRARY, ...ALARM_LIBRARY, ...locals];
      for (const sound of allSounds) {
        status[sound.id] = await AudioService.getInstance().isSoundDownloaded(sound.id);
      }
      setDownloadedSounds(status);
    };
    initAudioData();
  }, [view]);

  // Initial Validation Effect (Runs once to clean up if needed)
  useEffect(() => {
     let modified = false;
     const newSelections = { ...currentSettings.adhanSelections };
     const restrictedPrayers = ['dhuhr', 'asr', 'maghrib', 'isha'];
     
     restrictedPrayers.forEach(p => {
         if (newSelections[p] === 'mishary') {
             newSelections[p] = 'nasser'; 
             modified = true;
         }
     });
     
     if (modified) {
         onSave({ ...currentSettings, adhanSelections: newSelections });
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const basePrayerTimes = useMemo(() => {
    if (!location.latitude || !location.longitude) return null;
    const tempSettings = {
        ...currentSettings,
        adjustments: { fajr:0, sunrise:0, dhuhr:0, asr:0, maghrib:0, isha:0 }
    };
    return PrayerService.getTodayPrays(location.latitude, location.longitude, tempSettings, selectedDate);
  }, [location, selectedDate, currentSettings]);

  const getPreviewTime = (prayer: string, offset: number) => {
    if (!basePrayerTimes) return '---';
    const baseDate = basePrayerTimes[prayer as keyof PrayerTimesData];
    if (!baseDate || !(baseDate instanceof Date)) return '---';
    const adjustedDate = new Date(baseDate.getTime() + offset * 60000);
    return adjustedDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleAdjustmentChange = (prayer: string, delta: number) => {
    updateAndSave({
      ...currentSettings,
      adjustments: {
        ...currentSettings.adjustments,
        [prayer]: (currentSettings.adjustments[prayer] || 0) + delta,
      }
    });
  };

  const handleResetAdjustments = () => {
    updateAndSave({
        ...currentSettings,
        adjustments: { fajr:0, sunrise:0, dhuhr:0, asr:0, maghrib:0, isha:0 }
    });
  };

  const handleHijriChange = (delta: number) => {
    updateAndSave({
        ...currentSettings,
        hijriOffset: currentSettings.hijriOffset + delta
    });
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateAndSave({ ...currentSettings, calculationMethod: e.target.value as CalculationMethodType });
  };

  const handleMadhabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateAndSave({ ...currentSettings, madhab: e.target.value as MadhabType });
  };
  
  const toggleAutoLocation = () => {
    updateAndSave({ ...currentSettings, isAutoLocation: !currentSettings.isAutoLocation });
  };

  const handleManualLocationSelect = (city: City) => {
    setManualLocation(city.lat, city.lng, city.name);
    updateAndSave({ ...currentSettings, isAutoLocation: false });
    setView('main');
  };

  // --- Sound Logic ---
  const handlePlaySound = async (sound: AdhanSound) => {
    if (playingSoundId === sound.id) {
      AudioService.getInstance().stopSound();
      setPlayingSoundId(null);
    } else {
      setPlayingSoundId(sound.id);
      await AudioService.getInstance().playSound(sound.id);
      const isDown = await AudioService.getInstance().isSoundDownloaded(sound.id);
      setDownloadedSounds(prev => ({...prev, [sound.id]: isDown}));
    }
  };

  const handleSelectSound = (soundId: string) => {
    if (selectedPrayerForSound) {
      updateAndSave({
        ...currentSettings,
        adhanSelections: {
          ...currentSettings.adhanSelections,
          [selectedPrayerForSound]: soundId
        }
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        try {
          const newSound = await AudioService.getInstance().addLocalSound(file);
          setLocalSounds(prev => [...prev, newSound]);
          if(selectedPrayerForSound) {
            handleSelectSound(newSound.id);
          }
        } catch (error) {
          console.error("Failed to add local sound", error);
          alert("فشل في إضافة الملف الصوتي");
        }
    }
  };

  // Navigation Logic
  const handleBackNavigation = () => {
    if (view === 'sound_select') setView('adhan_list');
    else if (view === 'adhan_list') setView('main');
    else if (view === 'manual_adjustments') setView('main');
    else if (view === 'city_select') setView('country_select');
    else if (view === 'country_select') setView('main');
    else onBack();
  };

  const prayerNameMap: Record<string, string> = {
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
  };

  const methodNames: Record<string, string> = {
    [CalculationMethodType.UmmAlQura]: 'تقويم أم القرى',
    [CalculationMethodType.MuslimWorldLeague]: 'رابطة العالم الإسلامي',
    [CalculationMethodType.Egyptian]: 'الهيئة المصرية العامة للمساحة',
    [CalculationMethodType.Karachi]: 'جامعة العلوم الإسلامية، كراتشي',
    [CalculationMethodType.Dubai]: 'دائرة الشؤون الإسلامية والعمل الخيري، دبي',
    [CalculationMethodType.Qatar]: 'وزارة الأوقاف والشؤون الإسلامية، قطر',
    [CalculationMethodType.Kuwait]: 'وزارة الأوقاف والشؤون الإسلامية، الكويت',
    [CalculationMethodType.MoonsightingCommittee]: 'لجنة رؤية الهلال',
    [CalculationMethodType.Singapore]: 'المجلس الإسلامي السنغافوري',
    [CalculationMethodType.Turkey]: 'رئاسة الشؤون الدينية، تركيا',
    [CalculationMethodType.Tehran]: 'معهد الجيوفيزياء، جامعة طهران',
    [CalculationMethodType.NorthAmerica]: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)',
  };

  const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  // --- Sub-Component: Adhan List ---
  if (view === 'adhan_list') {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F5F5] dark:bg-slate-950 flex flex-col h-full" dir="rtl">
        <div className="bg-[#2D6A4F] dark:bg-emerald-800 px-5 pt-10 pb-4 shadow-md shrink-0 flex items-center gap-3 text-white">
          <button onClick={handleBackNavigation} className="p-2 -mr-2 rounded-full hover:bg-emerald-500/50 transition-colors">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">أصوات الأذان</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
            {prayers.map(prayer => {
                const soundId = currentSettings.adhanSelections[prayer] || (prayer === 'sunrise' ? 'soft_1' : 'nasser');
                const library = prayer === 'sunrise' ? ALARM_LIBRARY : ADHAN_LIBRARY;
                const allSounds = [...library, ...localSounds];
                const soundName = allSounds.find(s => s.id === soundId)?.name || 'غير محدد';

                return (
                    <button 
                        key={prayer}
                        onClick={() => { setSelectedPrayerForSound(prayer); setView('sound_select'); }}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-[#2D6A4F] transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-700 dark:text-slate-200">{prayerNameMap[prayer]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{soundName}</span>
                            <ChevronLeft className="w-4 h-4 text-slate-300" />
                        </div>
                    </button>
                );
            })}
        </div>
      </div>
    );
  }

  // --- Sub-Component: Manual Adjustments List ---
  if (view === 'manual_adjustments') {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F5F5] dark:bg-slate-950 flex flex-col h-full" dir="rtl">
        <div className="bg-[#2D6A4F] dark:bg-emerald-800 px-5 pt-10 pb-4 shadow-md shrink-0 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
             <button onClick={handleBackNavigation} className="p-2 -mr-2 rounded-full hover:bg-emerald-500/50 transition-colors">
                <ArrowRight className="w-6 h-6" />
             </button>
             <h2 className="text-xl font-bold">التعديل اليدوي</h2>
          </div>
           <button onClick={handleResetAdjustments} className="text-xs text-white/80 hover:text-white flex items-center gap-1 transition-colors bg-white/10 px-3 py-1.5 rounded-lg">
                <RotateCcw className="w-3 h-3" />
                إعادة ضبط
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
            <div className="bg-emerald-50 dark:bg-slate-900/50 p-4 rounded-xl text-xs text-slate-500 dark:text-slate-400 mb-2">
                يمكنك تقديم أو تأخير وقت الأذان يدوياً بالدقائق. (مثال: +2 يعني إضافة دقيقتين)
            </div>
            
            {prayers.map((prayer) => {
               const offset = currentSettings.adjustments[prayer] || 0;
               return (
                <div key={prayer} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 block text-base">{prayerNameMap[prayer]}</span>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>سيصبح الأذان:</span>
                      <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400" dir="ltr">{getPreviewTime(prayer, offset)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4" dir="ltr">
                    <button 
                      onClick={() => handleAdjustmentChange(prayer, -1)}
                      className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all shadow-sm"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    
                    <span className={`w-8 text-center font-mono font-bold text-lg ${offset !== 0 ? 'text-[#2D6A4F] dark:text-emerald-400' : 'text-slate-300'}`}>
                      {offset > 0 ? `+${offset}` : offset}
                    </span>
                    
                    <button 
                      onClick={() => handleAdjustmentChange(prayer, 1)}
                      className="w-10 h-10 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center hover:bg-[#24553e] active:scale-90 transition-all shadow-md shadow-emerald-200 dark:shadow-none"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // --- Sub-Component: Sound Selection ---
  if (view === 'sound_select' && selectedPrayerForSound) {
    const isSunrise = selectedPrayerForSound === 'sunrise';
    let librarySounds = isSunrise ? ALARM_LIBRARY : ADHAN_LIBRARY;
    
    // Filter Mishary Al-Afasy if not Fajr
    if (selectedPrayerForSound !== 'fajr') {
        librarySounds = librarySounds.filter(s => s.id !== 'mishary');
    }

    const currentSelection = currentSettings.adhanSelections[selectedPrayerForSound] || (isSunrise ? 'soft_1' : 'nasser');

    const renderSoundItem = (sound: AdhanSound) => {
        const isSelected = currentSelection === sound.id;
        const isDownloaded = downloadedSounds[sound.id];
        const isPlaying = playingSoundId === sound.id;
        const isLocal = sound.isLocal;

        return (
            <div 
                key={sound.id}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isSelected 
                    ? 'bg-white dark:bg-slate-900 border-[#2D6A4F] shadow-md ring-1 ring-[#2D6A4F]' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
            >
                <button 
                    onClick={(e) => { e.stopPropagation(); handlePlaySound(sound); }}
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                        isPlaying 
                        ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                        : 'bg-emerald-50 dark:bg-slate-800 text-[#2D6A4F] hover:bg-emerald-100'
                    }`}
                >
                    {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <div className="flex-1 mx-3 text-right cursor-pointer" onClick={() => handleSelectSound(sound.id)}>
                    <div className={`font-bold ${isSelected ? 'text-[#2D6A4F]' : 'text-slate-700 dark:text-slate-200'}`}>
                        {sound.name}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                        {isLocal ? (
                             <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">ملف محلي</span>
                        ) : isDownloaded ? (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> جاهز
                            </span>
                        ) : (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <Download className="w-3 h-3" /> اضغط للتحميل
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleSelectSound(sound.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#2D6A4F] bg-[#2D6A4F]' : 'border-slate-300'}`}
                    >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                </div>
            </div>
        );
    };

    return (
      <div className="fixed inset-0 z-50 bg-[#F5F5F5] dark:bg-slate-950 flex flex-col h-full" dir="rtl">
         <div className="bg-[#2D6A4F] dark:bg-emerald-800 px-5 pt-10 pb-4 shadow-md shrink-0 flex items-center gap-3 text-white">
          <button 
            onClick={() => {
                AudioService.getInstance().stopSound();
                setPlayingSoundId(null);
                handleBackNavigation();
            }} 
            className="p-2 -mr-2 rounded-full hover:bg-emerald-500/50 transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold">صوت {prayerNameMap[selectedPrayerForSound]}</h2>
            <p className="text-xs text-white/80">{isSunrise ? 'اختر صوت التنبيه' : 'اختر المؤذن'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar pb-5">
            <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                    {isSunrise ? 'نغمات التنبيه' : 'المؤذنون المتاحون'}
                </h3>
                <div className="space-y-3">
                    {librarySounds.map(renderSoundItem)}
                </div>
            </section>
            <section>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">مكتبة أصواتي</h3>
                    <label className="text-xs flex items-center gap-1 text-[#2D6A4F] font-bold cursor-pointer hover:underline">
                        <Plus className="w-3 h-3" /> إضافة ملف
                        <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
                <div className="space-y-3">
                    {localSounds.length > 0 ? (
                        localSounds.map(renderSoundItem)
                    ) : (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                             <Music className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                             <p className="text-xs text-slate-400">لا توجد ملفات مضافة</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
      </div>
    );
  }

  // --- Sub-Components (Country/City) omitted for brevity as they are unchanged logic, just need to use updateAndSave ---
  // Re-injecting them for full file integrity
  if (view === 'country_select') {
    const filteredCountries = COUNTRIES.filter(c => c.name.includes(searchQuery) || c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F5F5] dark:bg-slate-950 flex flex-col h-full" dir="rtl">
        <div className="bg-[#2D6A4F] dark:bg-emerald-800 px-5 pt-10 pb-4 shadow-md shrink-0 flex items-center gap-3 text-white">
          <button onClick={handleBackNavigation} className="p-2 -mr-2 rounded-full hover:bg-emerald-500/50 transition-colors">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">اختر الدولة</h2>
        </div>
        <div className="px-4 py-3 bg-[#2D6A4F] dark:bg-emerald-800 shadow-sm shrink-0 rounded-b-2xl mb-1 z-10">
            <div className="bg-white/20 dark:bg-black/20 rounded-xl flex items-center px-3 py-2.5 backdrop-blur-sm">
                <Search className="w-5 h-5 text-white/70 ml-2" />
                <input 
                    type="text" 
                    placeholder="ابحث عن دولة..." 
                    className="bg-transparent w-full text-white placeholder-white/60 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
            {filteredCountries.map(country => (
                <button 
                    key={country.code}
                    onClick={() => { setSelectedCountry(country); setSearchQuery(''); setView('city_select'); }}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-[#2D6A4F] hover:bg-emerald-50/30 transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <span className="text-3xl shadow-sm rounded-full bg-slate-50 w-10 h-10 flex items-center justify-center">{country.flag}</span>
                        <div className="text-right">
                            <div className="font-bold text-slate-800 dark:text-slate-100">{country.name}</div>
                            <div className="text-xs text-slate-400 font-medium">{country.nameEn}</div>
                        </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>
            ))}
        </div>
      </div>
    );
  }

  if (view === 'city_select' && selectedCountry) {
    const filteredCities = selectedCountry.cities.filter(c => c.name.includes(searchQuery) || c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F5F5] dark:bg-slate-950 flex flex-col h-full" dir="rtl">
        <div className="bg-[#2D6A4F] dark:bg-emerald-800 px-5 pt-10 pb-4 shadow-md shrink-0 flex items-center gap-3 text-white">
          <button onClick={handleBackNavigation} className="p-2 -mr-2 rounded-full hover:bg-emerald-500/50 transition-colors">
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold">{selectedCountry.name}</h2>
            <p className="text-xs text-white/80">اختر المدينة</p>
          </div>
        </div>
        <div className="px-4 py-3 bg-[#2D6A4F] dark:bg-emerald-800 shadow-sm shrink-0 rounded-b-2xl mb-1 z-10">
            <div className="bg-white/20 dark:bg-black/20 rounded-xl flex items-center px-3 py-2.5 backdrop-blur-sm">
                <Search className="w-5 h-5 text-white/70 ml-2" />
                <input 
                    type="text" 
                    placeholder="ابحث عن مدينة..." 
                    className="bg-transparent w-full text-white placeholder-white/60 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
            {filteredCities.map(city => (
                <button 
                    key={city.nameEn}
                    onClick={() => handleManualLocationSelect(city)}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-[#2D6A4F] hover:bg-emerald-50/30 transition-all active:scale-[0.98]"
                >
                    <div className="text-right">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{city.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5" dir="ltr">{city.lat.toFixed(2)}, {city.lng.toFixed(2)}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-[#2D6A4F] dark:text-emerald-400">
                        <MapPin className="w-4 h-4" />
                    </div>
                </button>
            ))}
        </div>
      </div>
    );
  }

  // --- Main Settings View ---
  return (
    <div className="fixed inset-0 z-50 bg-[#F5F5F5] dark:bg-slate-950 flex flex-col h-full animate-in slide-in-from-left-10 duration-300" dir="rtl">
      
      {/* Header (No Save Button) */}
      <div className="bg-[#2D6A4F] dark:bg-emerald-800 px-5 pt-10 pb-4 shadow-lg shrink-0 flex items-center justify-between z-10 text-white rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 -mr-2 text-white hover:bg-emerald-500/30 transition-colors rounded-full"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">الإعدادات</h2>
        </div>
      </div>

      {/* Body - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-6 custom-scrollbar pb-5">
        
        {/* Section 0: Location */}
        <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#2D6A4F] dark:text-emerald-400 mb-1 px-1">
                <MapPin className="w-5 h-5" />
                <h3 className="font-bold text-lg">الموقع الجغرافي</h3>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">تحديد الموقع تلقائياً (GPS)</span>
                        <span className="text-[10px] text-slate-400">سيتم استخدام موقع هاتفك الحالي</span>
                    </div>
                    <button 
                        onClick={toggleAutoLocation}
                        className={`w-12 h-7 rounded-full transition-colors duration-300 flex items-center px-0.5 ${currentSettings.isAutoLocation ? 'bg-[#2D6A4F]' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${currentSettings.isAutoLocation ? '-translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={() => { setView('country_select'); setSearchQuery(''); }}
                        className={`w-full py-3.5 font-bold rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                          !currentSettings.isAutoLocation 
                            ? 'bg-emerald-50 dark:bg-slate-800 text-[#2D6A4F] dark:text-emerald-400 border-[#2D6A4F] dark:border-emerald-500' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-white hover:text-[#2D6A4F] hover:border-[#2D6A4F]'
                        }`}
                    >
                        <MapPin className="w-4 h-4" />
                        تحديد الموقع يدوياً
                    </button>
                    
                    {currentSettings.isAutoLocation && (
                        <div className="text-center">
                             <button 
                                onClick={onRefreshLocation}
                                className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-[#2D6A4F] transition-colors p-2"
                            >
                                <Globe className="w-3 h-3" />
                                تحديث إحداثيات GPS
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* Section: Collapsible Adhan & Adjustments */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#2D6A4F] dark:text-emerald-400 mb-1 px-1">
            <Sliders className="w-5 h-5" />
            <h3 className="font-bold text-lg">الصلوات والأصوات</h3>
          </div>
          
          <div className="space-y-3">
              {/* Adhan Sounds Row */}
              <button 
                onClick={() => setView('adhan_list')}
                className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-[#2D6A4F] dark:text-emerald-400">
                          <Music className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                          <span className="font-bold text-slate-700 dark:text-slate-200 block text-sm">أصوات الأذان</span>
                          <span className="text-[10px] text-slate-400">تخصيص صوت المؤذن لكل صلاة</span>
                      </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>

              {/* Manual Adjustments Row */}
              <button 
                onClick={() => setView('manual_adjustments')}
                className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Sliders className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                          <span className="font-bold text-slate-700 dark:text-slate-200 block text-sm">التعديل اليدوي للمواقيت</span>
                          <span className="text-[10px] text-slate-400">تقديم أو تأخير أوقات الصلاة يدوياً</span>
                      </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>
          </div>
        </section>

        {/* Section 1: Method & Date */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[#2D6A4F] dark:text-emerald-400 mb-1 px-1">
            <Globe className="w-5 h-5" />
            <h3 className="font-bold text-lg">الحساب والتاريخ</h3>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
             {/* Method */}
             <div className="p-4 border-b border-slate-50 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">طريقة الحساب</label>
                <div className="relative">
                  <select 
                    value={currentSettings.calculationMethod} 
                    onChange={handleMethodChange}
                    className="w-full bg-transparent text-slate-700 dark:text-slate-200 font-bold text-sm outline-none appearance-none z-10 relative cursor-pointer"
                  >
                    {Object.values(CalculationMethodType).map(method => (
                      <option key={method} value={method}>
                        {methodNames[method] || method}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
             </div>

             {/* Madhab */}
             <div className="p-4 border-b border-slate-50 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">المذهب الفقهي</label>
                <div className="relative">
                  <select 
                    value={currentSettings.madhab} 
                    onChange={handleMadhabChange}
                    className="w-full bg-transparent text-slate-700 dark:text-slate-200 font-bold text-sm outline-none appearance-none z-10 relative cursor-pointer"
                  >
                    <option value={MadhabType.Shafi}>جمهور العلماء (شافعي، مالكي، حنبلي)</option>
                    <option value={MadhabType.Hanafi}>المذهب الحنفي</option>
                  </select>
                  <ChevronDown className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
             </div>

             {/* Hijri Adjustment */}
             <div className="p-4 flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">تعديل التاريخ الهجري</label>
                  <span className="text-[10px] text-slate-400">تقديم أو تأخير الأيام</span>
                </div>
                <div className="flex items-center gap-3" dir="ltr">
                    <button 
                      onClick={() => handleHijriChange(-1)}
                      className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className={`w-6 text-center font-mono font-bold text-sm ${currentSettings.hijriOffset !== 0 ? 'text-[#2D6A4F] dark:text-emerald-400' : 'text-slate-300'}`}>
                      {currentSettings.hijriOffset > 0 ? `+${currentSettings.hijriOffset}` : currentSettings.hijriOffset}
                    </span>
                    
                    <button 
                      onClick={() => handleHijriChange(1)}
                      className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center hover:bg-[#24553e] active:scale-90 transition-all shadow-md shadow-emerald-200 dark:shadow-none"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                </div>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsScreen;