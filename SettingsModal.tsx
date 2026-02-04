import React, { useState } from 'react';
import { X, Save, RotateCcw, Plus, Minus, ChevronDown, Check } from 'lucide-react';
import { PrayerSettings, CalculationMethodType, MadhabType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: PrayerSettings;
  onSave: (settings: PrayerSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [settings, setSettings] = useState<PrayerSettings>(currentSettings);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSettings(currentSettings);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleAdjustmentChange = (prayer: string, delta: number) => {
    setSettings(prev => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [prayer]: (prev.adjustments[prayer] || 0) + delta,
      }
    }));
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, calculationMethod: e.target.value as CalculationMethodType }));
  };

  const handleMadhabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, madhab: e.target.value as MadhabType }));
  };
  
  const handleIqamahChange = (val: string) => {
    setSettings(prev => ({ ...prev, iqamahOffset: parseInt(val) || 10 }));
  }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col transform transition-all scale-100 max-h-[85dvh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">إعدادات الصلاة</h2>
            <p className="text-sm text-slate-400 mt-1">تخصيص طرق الحساب والتوقيت</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-5 overflow-y-auto space-y-6 custom-scrollbar dark:text-slate-200">
          
          {/* Calculation Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
              <h3 className="text-md font-bold text-slate-700 dark:text-slate-200">طريقة الحساب والمذهب</h3>
            </div>
            
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">الجهة المحسوبة</label>
                <div className="relative">
                  <select 
                    value={settings.calculationMethod} 
                    onChange={handleMethodChange}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl appearance-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    {Object.values(CalculationMethodType).map(method => (
                      <option key={method} value={method}>
                        {methodNames[method] || method}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">المذهب الفقهي (للعصر)</label>
                <div className="relative">
                  <select 
                    value={settings.madhab} 
                    onChange={handleMadhabChange}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl appearance-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <option value={MadhabType.Shafi}>جمهور العلماء (شافعي، مالكي، حنبلي)</option>
                    <option value={MadhabType.Hanafi}>المذهب الحنفي</option>
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

               <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">وقت الإقامة (دقائق بعد الأذان)</label>
                <input 
                  type="range"
                  min="5"
                  max="45"
                  step="5"
                  value={settings.iqamahOffset}
                  onChange={(e) => handleIqamahChange(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="text-center text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm mt-1">
                  {settings.iqamahOffset} دقيقة
                </div>
              </div>
            </div>
          </section>

          {/* Adjustments Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
              <h3 className="text-md font-bold text-slate-700 dark:text-slate-200">التعديل اليدوي (دقائق)</h3>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
              <div className="grid grid-cols-1 gap-2">
                {prayers.map(prayer => (
                  <div key={prayer} className="flex items-center justify-between bg-white dark:bg-slate-700 p-2.5 rounded-lg border border-slate-100 dark:border-slate-600 shadow-sm">
                    <span className="font-medium text-sm text-slate-700 dark:text-slate-200 w-20">{prayerNameMap[prayer]}</span>
                    
                    <div className="flex items-center gap-2" dir="ltr">
                      <button 
                        onClick={() => handleAdjustmentChange(prayer, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      
                      <span className={`w-6 text-center font-mono font-medium text-sm ${settings.adjustments[prayer] !== 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {settings.adjustments[prayer] > 0 ? `+${settings.adjustments[prayer]}` : settings.adjustments[prayer]}
                      </span>
                      
                      <button 
                        onClick={() => handleAdjustmentChange(prayer, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 sticky bottom-0 z-10 shrink-0 rounded-b-3xl">
          <button 
            onClick={() => setSettings(currentSettings)} 
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" /> 
            <span className="text-sm">إلغاء</span>
          </button>
          <button 
            onClick={() => { onSave(settings); onClose(); }}
            className="flex-[2] py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Check className="w-4 h-4" /> 
            <span className="text-sm">حفظ</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;