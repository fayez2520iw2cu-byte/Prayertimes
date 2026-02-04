export interface City {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
}

export interface Country {
  name: string;
  nameEn: string;
  code: string;
  flag: string;
  cities: City[];
}

// Helper to save space
const city = (name: string, nameEn: string, lat: number, lng: number): City => ({ name, nameEn, lat, lng });

export const COUNTRIES: Country[] = [
  // --- Arab World ---
  {
    name: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', code: 'SA', flag: '🇸🇦',
    cities: [
      city('مكة المكرمة', 'Makkah', 21.4225, 39.8262), city('المدينة المنورة', 'Madinah', 24.5247, 39.5692),
      city('الرياض', 'Riyadh', 24.7136, 46.6753), city('جدة', 'Jeddah', 21.5433, 39.1728),
      city('الدمام', 'Dammam', 26.4207, 50.0888), city('الطائف', 'Taif', 21.2854, 40.4245),
      city('تبوك', 'Tabuk', 28.3835, 36.5662), city('بريدة', 'Buraydah', 26.3260, 43.9750),
      city('أبها', 'Abha', 18.2164, 42.5053), city('خميس مشيط', 'Khamis Mushait', 18.3001, 42.7213),
      city('حائل', 'Hail', 27.5219, 41.6961), city('نجران', 'Najran', 17.4917, 44.1322),
      city('ينبع', 'Yanbu', 24.0927, 38.0637), city('الجبيل', 'Al Jubail', 27.0174, 49.6225)
    ]
  },
  {
    name: 'مصر', nameEn: 'Egypt', code: 'EG', flag: '🇪🇬',
    cities: [
      city('القاهرة', 'Cairo', 30.0444, 31.2357), city('الإسكندرية', 'Alexandria', 31.2001, 29.9187),
      city('الجيزة', 'Giza', 30.0131, 31.2089), city('شرم الشيخ', 'Sharm El Sheikh', 27.9158, 34.3299),
      city('الأقصر', 'Luxor', 25.6872, 32.6396), city('أسوان', 'Aswan', 24.0889, 32.8998),
      city('بور سعيد', 'Port Said', 31.2653, 32.3019), city('السويس', 'Suez', 29.9668, 32.5498),
      city('المنصورة', 'Mansoura', 31.0409, 31.3785), city('طنطا', 'Tanta', 30.7865, 31.0004)
    ]
  },
  {
    name: 'الإمارات العربية المتحدة', nameEn: 'UAE', code: 'AE', flag: '🇦🇪',
    cities: [
      city('دبي', 'Dubai', 25.2048, 55.2708), city('أبو ظبي', 'Abu Dhabi', 24.4539, 54.3773),
      city('الشارقة', 'Sharjah', 25.3463, 55.4209), city('العين', 'Al Ain', 24.2191, 55.7606),
      city('عجمان', 'Ajman', 25.4052, 55.5136), city('رأس الخيمة', 'Ras Al Khaimah', 25.8007, 55.9762),
      city('الفجيرة', 'Fujairah', 25.1288, 56.3265)
    ]
  },
  {
    name: 'سوريا', nameEn: 'Syria', code: 'SY', flag: '🇸🇾',
    cities: [
      city('دمشق', 'Damascus', 33.5138, 36.2765), city('حلب', 'Aleppo', 36.2021, 37.1343),
      city('حمص', 'Homs', 34.7324, 36.7136), city('اللاذقية', 'Latakia', 35.5317, 35.7901),
      city('حماة', 'Hama', 35.1318, 36.7578), city('قطنا', 'Qatana', 33.4369, 36.0825),
      city('طرطوس', 'Tartus', 34.8890, 35.8866), city('دير الزور', 'Deir ez-Zor', 35.3359, 40.1309),
      city('الرقة', 'Raqqa', 35.9500, 39.0167), city('إدلب', 'Idlib', 35.9306, 36.6339)
    ]
  },
  {
    name: 'الأردن', nameEn: 'Jordan', code: 'JO', flag: '🇯🇴',
    cities: [
      city('عمان', 'Amman', 31.9454, 35.9284), city('الزرقاء', 'Zarqa', 32.0608, 36.0942),
      city('إربد', 'Irbid', 32.5568, 35.8469), city('العقبة', 'Aqaba', 29.5319, 35.0061),
      city('السلط', 'Salt', 32.0392, 35.7272), city('مادبا', 'Madaba', 31.7177, 35.7933)
    ]
  },
  {
    name: 'فلسطين', nameEn: 'Palestine', code: 'PS', flag: '🇵🇸',
    cities: [
      city('القدس', 'Jerusalem', 31.7683, 35.2137), city('غزة', 'Gaza', 31.5017, 34.4668),
      city('رام الله', 'Ramallah', 31.9038, 35.2034), city('الخليل', 'Hebron', 31.5326, 35.0998),
      city('نابلس', 'Nablus', 32.2227, 35.2621), city('بيت لحم', 'Bethlehem', 31.7054, 35.2024),
      city('جنين', 'Jenin', 32.4633, 35.2951), city('أريحا', 'Jericho', 31.8611, 35.4617)
    ]
  },
  {
    name: 'الكويت', nameEn: 'Kuwait', code: 'KW', flag: '🇰🇼',
    cities: [
      city('الكويت', 'Kuwait City', 29.3759, 47.9774), city('الجهراء', 'Al Jahra', 29.3375, 47.6581),
      city('الأحمدي', 'Al Ahmadi', 29.0769, 48.0839), city('حولي', 'Hawally', 29.3328, 48.0283)
    ]
  },
  {
    name: 'قطر', nameEn: 'Qatar', code: 'QA', flag: '🇶🇦',
    cities: [
      city('الدوحة', 'Doha', 25.2854, 51.5310), city('الريان', 'Al Rayyan', 25.2919, 51.4244),
      city('الوكرة', 'Al Wakrah', 25.1768, 51.6048), city('الخور', 'Al Khor', 25.6804, 51.5021)
    ]
  },
  {
    name: 'البحرين', nameEn: 'Bahrain', code: 'BH', flag: '🇧🇭',
    cities: [
      city('المنامة', 'Manama', 26.2285, 50.5860), city('المحرق', 'Muharraq', 26.2573, 50.6119),
      city('الرفاع', 'Riffa', 26.1156, 50.5568)
    ]
  },
  {
    name: 'عمان', nameEn: 'Oman', code: 'OM', flag: '🇴🇲',
    cities: [
      city('مسقط', 'Muscat', 23.5880, 58.3829), city('صلالة', 'Salalah', 17.0151, 54.0924),
      city('صحار', 'Sohar', 24.3444, 56.7077), city('نزوى', 'Nizwa', 22.9333, 57.5333)
    ]
  },
  {
    name: 'اليمن', nameEn: 'Yemen', code: 'YE', flag: '🇾🇪',
    cities: [
      city('صنعاء', 'Sanaa', 15.3694, 44.1910), city('عدن', 'Aden', 12.7855, 45.0187),
      city('تعز', 'Taiz', 13.5795, 44.0209), city('الحديدة', 'Al Hudaydah', 14.7978, 42.9545)
    ]
  },
  {
    name: 'العراق', nameEn: 'Iraq', code: 'IQ', flag: '🇮🇶',
    cities: [
      city('بغداد', 'Baghdad', 33.3152, 44.3661), city('البصرة', 'Basra', 30.5081, 47.7835),
      city('الموصل', 'Mosul', 36.3464, 43.1509), city('أربيل', 'Erbil', 36.1901, 43.9930),
      city('كربلاء', 'Karbala', 32.6160, 44.0249), city('النجف', 'Najaf', 32.0003, 44.3315),
      city('الأنبار', 'Anbar', 33.4342, 43.1597), city('كركوك', 'Kirkuk', 35.4786, 44.3758)
    ]
  },
  {
    name: 'المغرب', nameEn: 'Morocco', code: 'MA', flag: '🇲🇦',
    cities: [
      city('الرباط', 'Rabat', 34.0209, -6.8416), city('الدار البيضاء', 'Casablanca', 33.5731, -7.5898),
      city('مراكش', 'Marrakech', 31.6295, -7.9811), city('فاس', 'Fes', 34.0181, -5.0078),
      city('طنجة', 'Tangier', 35.7595, -5.8340), city('أكادير', 'Agadir', 30.4278, -9.5981),
      city('مكناس', 'Meknes', 33.8730, -5.5714), city('وجدة', 'Oujda', 34.6814, -1.9076)
    ]
  },
  {
    name: 'الجزائر', nameEn: 'Algeria', code: 'DZ', flag: '🇩🇿',
    cities: [
      city('الجزائر', 'Algiers', 36.7538, 3.0588), city('وهران', 'Oran', 35.6987, -0.6347),
      city('قسنطينة', 'Constantine', 36.3650, 6.6147), city('عنابة', 'Annaba', 36.9006, 7.7669)
    ]
  },
  {
    name: 'تونس', nameEn: 'Tunisia', code: 'TN', flag: '🇹🇳',
    cities: [
      city('تونس', 'Tunis', 36.8065, 10.1815), city('صفاقس', 'Sfax', 34.7398, 10.7600),
      city('سوسة', 'Sousse', 35.8245, 10.6346), city('القيروان', 'Kairouan', 35.6759, 10.0919)
    ]
  },
  {
    name: 'ليبيا', nameEn: 'Libya', code: 'LY', flag: '🇱🇾',
    cities: [
      city('طربلس', 'Tripoli', 32.8872, 13.1913), city('بنغازي', 'Benghazi', 32.1174, 20.0630),
      city('مصراتة', 'Misrata', 32.3754, 15.0925)
    ]
  },
  {
    name: 'السودان', nameEn: 'Sudan', code: 'SD', flag: '🇸🇩',
    cities: [
      city('الخرطوم', 'Khartoum', 15.5007, 32.5599), city('أم درمان', 'Omdurman', 15.6445, 32.4777),
      city('بورتسودان', 'Port Sudan', 19.6163, 37.2148)
    ]
  },
  
  // --- Europe & West ---
  {
    name: 'تركيا', nameEn: 'Turkey', code: 'TR', flag: '🇹🇷',
    cities: [
      city('إسطنبول', 'Istanbul', 41.0082, 28.9784), city('أنقرة', 'Ankara', 39.9334, 32.8597),
      city('بورصة', 'Bursa', 40.1885, 29.0610), city('ازمير', 'Izmir', 38.4192, 27.1287),
      city('أنطاليا', 'Antalya', 36.8969, 30.7133), city('قونية', 'Konya', 37.8667, 32.4833)
    ]
  },
  {
    name: 'المملكة المتحدة', nameEn: 'United Kingdom', code: 'GB', flag: '🇬🇧',
    cities: [
      city('لندن', 'London', 51.5074, -0.1278), city('مانشستر', 'Manchester', 53.4808, -2.2426),
      city('برمنغهام', 'Birmingham', 52.4862, -1.8904), city('غلاسكو', 'Glasgow', 55.8642, -4.2518)
    ]
  },
  {
    name: 'فرنسا', nameEn: 'France', code: 'FR', flag: '🇫🇷',
    cities: [
      city('باريس', 'Paris', 48.8566, 2.3522), city('مارسيليا', 'Marseille', 43.2965, 5.3698),
      city('ليون', 'Lyon', 45.7640, 4.8357), city('تولوز', 'Toulouse', 43.6047, 1.4442)
    ]
  },
  {
    name: 'ألمانيا', nameEn: 'Germany', code: 'DE', flag: '🇩🇪',
    cities: [
      city('برلين', 'Berlin', 52.5200, 13.4050), city('ميونخ', 'Munich', 48.1351, 11.5820),
      city('فرانكفورت', 'Frankfurt', 50.1109, 8.6821), city('هامبورغ', 'Hamburg', 53.5511, 9.9937)
    ]
  },
  {
    name: 'الولايات المتحدة', nameEn: 'United States', code: 'US', flag: '🇺🇸',
    cities: [
      city('نيويورك', 'New York', 40.7128, -74.0060), city('واشنطن', 'Washington', 38.9072, -77.0369),
      city('لوس أنجلوس', 'Los Angeles', 34.0522, -118.2437), city('شيكاغو', 'Chicago', 41.8781, -87.6298),
      city('هيوستن', 'Houston', 29.7604, -95.3698), city('ديربورن', 'Dearborn', 42.3223, -83.1763)
    ]
  },
  {
    name: 'كندا', nameEn: 'Canada', code: 'CA', flag: '🇨🇦',
    cities: [
      city('تورونتو', 'Toronto', 43.6532, -79.3832), city('مونتريال', 'Montreal', 45.5017, -73.5673),
      city('فانكوفر', 'Vancouver', 49.2827, -123.1207), city('أوتاوا', 'Ottawa', 45.4215, -75.6972)
    ]
  },
  {
    name: 'روسيا', nameEn: 'Russia', code: 'RU', flag: '🇷🇺',
    cities: [
      city('موسكو', 'Moscow', 55.7558, 37.6173), city('سانت بطرسبرغ', 'Saint Petersburg', 59.9343, 30.3351),
      city('كازان', 'Kazan', 55.8304, 49.0661)
    ]
  },

  // --- Asia ---
  {
    name: 'إندونيسيا', nameEn: 'Indonesia', code: 'ID', flag: '🇮🇩',
    cities: [
      city('جاكرتا', 'Jakarta', -6.2088, 106.8456), city('سورابايا', 'Surabaya', -7.2575, 112.7521),
      city('باندونغ', 'Bandung', -6.9175, 107.6191)
    ]
  },
  {
    name: 'ماليزيا', nameEn: 'Malaysia', code: 'MY', flag: '🇲🇾',
    cities: [
      city('كوالالمبور', 'Kuala Lumpur', 3.1390, 101.6869), city('بينانق', 'Penang', 5.4164, 100.3327),
      city('جوهور بهرو', 'Johor Bahru', 1.4927, 103.7414)
    ]
  },
  {
    name: 'باكستان', nameEn: 'Pakistan', code: 'PK', flag: '🇵🇰',
    cities: [
      city('إسلام آباد', 'Islamabad', 33.6844, 73.0479), city('كراتشي', 'Karachi', 24.8607, 67.0011),
      city('لاهور', 'Lahore', 31.5204, 74.3587)
    ]
  },
  {
    name: 'الهند', nameEn: 'India', code: 'IN', flag: '🇮🇳',
    cities: [
      city('نيودلهي', 'New Delhi', 28.6139, 77.2090), city('مومباي', 'Mumbai', 19.0760, 72.8777),
      city('بنغالور', 'Bangalore', 12.9716, 77.5946), city('حيدر آباد', 'Hyderabad', 17.3850, 78.4867)
    ]
  }
];

// Sort countries alphabetically by Arabic name
COUNTRIES.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
