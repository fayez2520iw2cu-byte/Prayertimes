import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Compass, AlertCircle, Navigation, CheckCircle2 } from 'lucide-react';

interface QiblaModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
}

const QiblaModal: React.FC<QiblaModalProps> = ({ isOpen, onClose, latitude, longitude }) => {
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 1. Calculate Qibla Direction relative to North
  useEffect(() => {
    if (latitude && longitude) {
      const KAABA_LAT = 21.422487;
      const KAABA_LNG = 39.826206;

      const toRad = (deg: number) => deg * (Math.PI / 180);
      const toDeg = (rad: number) => rad * (180 / Math.PI);

      const lat1 = toRad(latitude);
      const lon1 = toRad(longitude);
      const lat2 = toRad(KAABA_LAT);
      const lon2 = toRad(KAABA_LNG);

      const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
      
      let bearing = toDeg(Math.atan2(y, x));
      bearing = (bearing + 360) % 360; // Normalize to 0-360

      setQiblaBearing(bearing);
    }
  }, [latitude, longitude]);

  // 2. Handle Compass Logic
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading = 0;

    // iOS Webkit
    if ((event as any).webkitCompassHeading) {
      heading = (event as any).webkitCompassHeading;
    } 
    // Android / Standard (Try to use absolute if available)
    else if (event.alpha !== null) {
      heading = 360 - event.alpha;
    }

    // Smooth out small jitters if needed, but for now raw is most responsive
    setDeviceHeading(heading);
  }, []);

  // 3. Check Alignment & Trigger Haptics
  useEffect(() => {
    // Calculate shortest difference accounting for 360 wrap
    const diff = Math.abs(deviceHeading - qiblaBearing);
    const shortestDiff = diff > 180 ? 360 - diff : diff;
    
    const aligned = shortestDiff < 3; // 3 degree tolerance

    if (aligned && !isAligned) {
      // Trigger Haptic Feedback on rising edge
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    
    setIsAligned(aligned);
  }, [deviceHeading, qiblaBearing, isAligned]);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setError('تم رفض إذن الوصول للبوصلة');
        }
      } catch (e) {
        console.error(e);
        setError('حدث خطأ في تشغيل البوصلة');
      }
    } else {
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const isIOSCheck = typeof (DeviceOrientationEvent as any).requestPermission === 'function';
      setIsIOS(isIOSCheck);

      if (!isIOSCheck) {
        window.addEventListener('deviceorientation', handleOrientation);
        setPermissionGranted(true);
      }
    } else {
      window.removeEventListener('deviceorientation', handleOrientation);
      setPermissionGranted(false);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isOpen, handleOrientation]);

  if (!isOpen) return null;

  // Visual Rotation Logic
  const dialRotation = -deviceHeading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 relative flex flex-col items-center border border-slate-100 dark:border-slate-800">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className={`text-xl font-bold mb-1 flex items-center gap-2 transition-colors duration-500 ${isAligned ? 'text-amber-500 scale-105' : 'text-[#2D6A4F] dark:text-emerald-400'}`}>
          {isAligned ? <CheckCircle2 className="w-6 h-6" /> : <Navigation className="w-6 h-6" />}
          {isAligned ? 'أنت باتجاه القبلة' : 'اتجاه القبلة'}
        </h2>
        
        <p className="text-slate-400 text-xs text-center mb-6 h-4">
          {permissionGranted && (
             isAligned ? "ثبت الهاتف في هذا الاتجاه" : `انحراف: ${Math.round(Math.abs(deviceHeading - qiblaBearing) > 180 ? 360 - Math.abs(deviceHeading - qiblaBearing) : Math.abs(deviceHeading - qiblaBearing))}°`
          )}
        </p>

        {isIOS && !permissionGranted ? (
          <button 
            onClick={requestPermission}
            className="px-6 py-3 bg-[#2D6A4F] text-white rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none animate-bounce"
          >
            تفعيل البوصلة
          </button>
        ) : (
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* 1. The Rotating Compass Dial */}
            <div 
              className={`absolute w-full h-full rounded-full border-[6px] shadow-inner flex items-center justify-center transition-all duration-300 ease-out will-change-transform ${
                isAligned 
                ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]' 
                : 'border-slate-100 dark:border-slate-700'
              }`}
              style={{ transform: `rotate(${dialRotation}deg)` }}
            >
              {/* Cardinal Points on Dial */}
              <div className="absolute top-2 w-1.5 h-4 bg-red-500 rounded-full z-10"></div>
              <span className="absolute top-6 font-bold text-red-500 text-xs tracking-widest">N</span>
              <div className="absolute bottom-2 w-1.5 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
              <div className="absolute left-2 w-1.5 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
              <div className="absolute right-2 w-1.5 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>

              {/* The Qibla Arrow (Fixed to the Bearing on the Dial) */}
              <div 
                 className="absolute w-full h-full flex justify-center transition-opacity duration-500"
                 style={{ transform: `rotate(${qiblaBearing}deg)` }}
              >
                  <div className="h-1/2 w-1.5 origin-bottom relative flex flex-col items-center justify-start pt-3">
                      {/* Arrow Head */}
                      <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[28px] filter drop-shadow-sm transition-colors duration-300 ${isAligned ? 'border-b-amber-500' : 'border-b-[#2D6A4F] dark:border-b-emerald-400'}`}></div>
                      
                      {/* Arrow Body */}
                      <div className={`w-1.5 h-full rounded-full -mt-1 transition-colors duration-300 ${isAligned ? 'bg-amber-400/80' : 'bg-[#2D6A4F] dark:bg-emerald-400/50'}`}></div>
                      
                      {/* Kaaba Icon Hint */}
                      <div className={`absolute top-14 w-8 h-8 rounded-lg border-2 shadow-md flex items-center justify-center transition-colors duration-300 ${isAligned ? 'bg-amber-500 border-amber-200' : 'bg-black border-amber-400'}`}>
                         <div className="w-4 h-4 border border-white/30 rounded-sm"></div>
                      </div>
                  </div>
              </div>
            </div>

            {/* 2. Static Center Reference (The Phone) */}
            <div className={`absolute w-14 h-14 rounded-full shadow-lg z-20 flex items-center justify-center border-2 transition-colors duration-300 ${isAligned ? 'bg-amber-50 border-amber-400' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
               <Compass className={`w-7 h-7 transition-colors duration-300 ${isAligned ? 'text-amber-500' : 'text-slate-300'}`} />
            </div>

            {/* Degree Indicator */}
             <div className={`absolute -bottom-10 px-4 py-1.5 rounded-full text-sm font-mono font-bold border transition-colors duration-300 ${
                 isAligned 
                 ? 'bg-amber-100 text-amber-700 border-amber-300' 
                 : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
             }`}>
                {Math.round(deviceHeading)}°
             </div>
          </div>
        )}

        {/* Instructions Footer */}
        <div className="mt-14 w-full text-center space-y-2">
            {!error ? (
                 <>
                   <div className="text-[10px] text-slate-400 dark:text-slate-500 px-4 leading-relaxed">
                     يرجى تحريك الهاتف بشكل رقم <span className="font-bold">8</span> لمعايرة البوصلة في حال عدم الدقة
                   </div>
                   <div className={`text-xs font-medium transition-colors duration-300 ${isAligned ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                     سيتحول المؤشر للون {isAligned ? 'الذهبي' : 'الذهبي'} عند الوصول للاتجاه الصحيح
                   </div>
                 </>
            ) : (
                <div className="flex items-center justify-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-xs">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default QiblaModal;