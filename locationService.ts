export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const MAKKAH_COORDS: Coordinates = { latitude: 21.4225, longitude: 39.8262 };

export class LocationService {
  /**
   * Check and request GPS permissions implicitly by attempting to get the position.
   */
  static async getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("خدمة تحديد الموقع غير مدعومة في هذا المتصفح"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = "تعذر تحديد الموقع";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "تم رفض صلاحية الموقع. الرجاء تفعيل الموقع من إعدادات المتصفح.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "معلومات الموقع غير متوفرة حالياً.";
              break;
            case error.TIMEOUT:
              errorMessage = "انتهت مهلة طلب تحديد الموقع.";
              break;
          }
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }

  /**
   * Get address (city name) from coordinates using OpenStreetMap Nominatim API.
   */
  static async getAddressFromCoords(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=ar`,
        { headers: { 'User-Agent': 'NoorPrayerTimes/1.0' } }
      );
      
      if (!response.ok) {
        throw new Error("Geocoding service unavailable");
      }
      
      const data = await response.json();
      const address = data.address;

      // Prioritize city-like fields
      return address.city || 
             address.town || 
             address.village || 
             address.county || 
             address.state_district || 
             address.state || 
             "موقع غير معروف";
    } catch (error) {
      console.warn("Geocoding failed:", error);
      return "موقع غير معروف";
    }
  }
}