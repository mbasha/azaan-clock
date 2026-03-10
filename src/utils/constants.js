// src/utils/constants.js

export const PRAYERS = [
  { key: 'Fajr',    ar: 'الفجر',   en: 'Fajr',    description: 'Pre-dawn prayer' },
  { key: 'Sunrise', ar: 'الشروق',  en: 'Sunrise',  description: 'Sunrise (Ishraq)', isInfo: true },
  { key: 'Dhuhr',   ar: 'الظهر',   en: 'Dhuhr',   description: 'Midday prayer' },
  { key: 'Asr',     ar: 'العصر',   en: 'Asr',     description: 'Afternoon prayer' },
  { key: 'Maghrib', ar: 'المغرب',  en: 'Maghrib', description: 'Sunset prayer' },
  { key: 'Isha',    ar: 'العشاء',  en: "Isha'a",  description: 'Night prayer' },
];

export const ADHAN_PRAYERS = PRAYERS.filter(p => !p.isInfo);

export const CALCULATION_METHODS = [
  { value: 2,  label: 'ISNA',             description: 'Islamic Society of North America — recommended for USA & Canada' },
  { value: 3,  label: 'Muslim World League', description: 'Used in Europe, Far East, parts of Americas' },
  { value: 5,  label: 'Egyptian',          description: 'Egyptian General Authority of Survey' },
  { value: 4,  label: 'Umm Al-Qura',      description: 'Umm Al-Qura University, Mecca' },
  { value: 1,  label: 'Karachi',           description: 'University of Islamic Sciences, Karachi' },
  { value: 7,  label: 'Tehran',            description: 'Institute of Geophysics, University of Tehran' },
  { value: 9,  label: 'Singapore',         description: 'Majlis Ugama Islam Singapura' },
  { value: 10, label: 'Qatar',             description: 'Presidency of Religious Affairs, Qatar' },
  { value: 11, label: 'Kuwait',            description: 'Presidency of Religious Affairs, Kuwait' },
];

export const ADHAN_VOICES = [
  { value: 'https://ia800905.us.archive.org/9/items/MakkahAdhan/Makkah_Fajr.mp3',     label: 'Makkah — Fajr' },
  { value: 'https://ia800905.us.archive.org/9/items/MakkahAdhan/Makkah_Adhan.mp3',    label: 'Makkah — Standard' },
  { value: 'https://ia903405.us.archive.org/7/items/adhan_20220330/madinah.mp3',       label: 'Madinah — Classic' },
  { value: 'https://ia903405.us.archive.org/7/items/adhan_20220330/egypt.mp3',         label: 'Egyptian — Traditional' },
  { value: 'custom', label: 'Custom URL…' },
];

export const HIJRI_MONTHS = [
  'Muharram','Safar','Rabi al-Awwal','Rabi al-Thani',
  'Jumada al-Awwal','Jumada al-Thani','Rajab','Sha\'ban',
  'Ramadan','Shawwal','Dhu al-Qi\'dah','Dhu al-Hijjah',
];

export const HIJRI_MONTHS_AR = [
  'محرم','صفر','ربيع الأول','ربيع الثاني',
  'جمادى الأولى','جمادى الثانية','رجب','شعبان',
  'رمضان','شوال','ذو القعدة','ذو الحجة',
];

export const DEFAULT_SETTINGS = {
  // Location
  city: 'Charleston',
  country: 'US',
  latitude: null,
  longitude: null,
  useGeolocation: false,

  // Prayer calculation
  method: 2,
  school: 0, // 0 = Shafi, 1 = Hanafi (affects Asr)
  midnightMode: 0, // 0 = Standard, 1 = Jafari

  // Audio
  adhanUrl: 'https://ia800905.us.archive.org/9/items/MakkahAdhan/Makkah_Adhan.mp3',
  customAdhanUrl: '',
  adhanVolume: 0.85,
  enableFajrAdhan: true,
  enableDhuhrAdhan: true,
  enableAsrAdhan: true,
  enableMaghribAdhan: true,
  enableIshaAdhan: true,

  // Notifications
  enableWarning: true,       // 5-min before next prayer
  warningMinutes: 5,         // configurable warning window
  enableChime: true,

  // Display
  displayHijri: true,
  display24h: true,
  displaySunrise: true,
  theme: 'dark',             // 'dark' | 'light'
  accentColor: 'gold',       // 'gold' | 'teal' | 'rose'
  showSeconds: true,

  // Misc
  lastFetched: null,
  lastFetchedDate: null,
};
