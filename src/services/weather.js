// Service to fetch real-time weather data from Open-Meteo (Free, No API Key needed)

const weatherCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const WMO_CODES = {
  0: { text: 'পরিষ্কার আকাশ', icon: 'sun' },
  1: { text: 'প্রধানত পরিষ্কার', icon: 'cloud-sun' },
  2: { text: 'আংশিক মেঘলা', icon: 'cloud-sun' },
  3: { text: 'মেঘলা আকাশ', icon: 'cloud' },
  45: { text: 'ঘন কুয়াশা', icon: 'cloud-fog' },
  48: { text: 'কুয়াশাচ্ছন্ন', icon: 'cloud-fog' },
  51: { text: 'হালকা গুড়ি গুড়ি বৃষ্টি', icon: 'cloud-drizzle' },
  53: { text: 'মাঝারি গুড়ি গুড়ি বৃষ্টি', icon: 'cloud-drizzle' },
  55: { text: 'ভারী গুড়ি গুড়ি বৃষ্টি', icon: 'cloud-drizzle' },
  61: { text: 'হালকা বৃষ্টিপাত', icon: 'cloud-rain' },
  63: { text: 'মাঝারি বৃষ্টিপাত', icon: 'cloud-rain' },
  65: { text: 'ভারী বর্ষণ', icon: 'cloud-rain' },
  80: { text: 'বিক্ষিপ্ত বৃষ্টিপাত', icon: 'cloud-rain' },
  81: { text: 'বজ্রবৃষ্টির সম্ভাবনা', icon: 'cloud-lightning' },
  82: { text: 'ভারী ঝড়বৃষ্টি', icon: 'cloud-lightning' },
  95: { text: 'বজ্রপাত ও বিদ্যুৎ চমক', icon: 'cloud-lightning' },
  96: { text: 'শিলাবৃষ্টিসহ বজ্রঝড়', icon: 'cloud-lightning' },
  99: { text: 'প্রবল কালবৈশাখী ঝড়', icon: 'cloud-lightning' }
};

export async function fetchDistrictWeather(lat, lng) {
  if (!lat || !lng) return null;

  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const now = Date.now();

  if (weatherCache.has(cacheKey)) {
    const cached = weatherCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');

    const data = await res.json();
    const current = data.current || {};
    const code = current.weather_code ?? 0;
    const wmo = WMO_CODES[code] || { text: 'স্বাভাবিক আবহাওয়া', icon: 'sun' };

    const result = {
      temp: Math.round(current.temperature_2m ?? 28),
      humidity: Math.round(current.relative_humidity_2m ?? 65),
      windSpeed: Math.round(current.wind_speed_10m ?? 8),
      condition: wmo.text,
      icon: wmo.icon,
      code
    };

    weatherCache.set(cacheKey, { timestamp: now, data: result });
    return result;
  } catch (err) {
    console.warn('Weather fetch failed, using fallback estimate:', err);
    return {
      temp: 29,
      humidity: 70,
      windSpeed: 10,
      condition: 'উষ্ণ ও আর্দ্র আবহাওয়া',
      icon: 'sun',
      code: 0
    };
  }
}
