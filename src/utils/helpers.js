// src/utils/helpers.js

import { HIJRI_MONTHS } from './constants';

export const pad = (n) => String(n).padStart(2, '0');

/**
 * Format a Date object as HH:MM or H:MM AM/PM
 */
export function formatTime(date, use24h = true) {
  if (!date) return '--:--';
  const h = date.getHours();
  const m = date.getMinutes();
  if (use24h) return `${pad(h)}:${pad(m)}`;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${pad(m)} ${period}`;
}

/**
 * Format seconds as HH:MM:SS or MM:SS
 */
export function formatCountdown(ms) {
  const totalMins = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}`;
  return `${pad(m)}m`;
}

/**
 * Convert Gregorian date to Hijri (Kuwaiti algorithm, ±1 day)
 */
export function toHijri(date) {
  const jd = Math.floor(date.getTime() / 86400000) + 2440588;
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l -= 10631 * n - 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l -=
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) +
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) - 29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { day, month, year };
}

export function formatHijriDate(date) {
  const { day, month, year } = toHijri(date);
  return `${day} ${HIJRI_MONTHS[month - 1]} ${year} AH`;
}

/**
 * Parse "HH:MM" prayer time string into a Date for today
 */
export function parseTimeToDate(timeStr, referenceDate = new Date()) {
  const [h, m] = timeStr.split(':').map(Number);
  return new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    h, m, 0, 0
  );
}

/**
 * Get today's date key as "YYYY-MM-DD"
 */
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Fetch prayer times from aladhan.com
 */
export async function fetchPrayerTimes({ city, country, method, latitude, longitude, useGeolocation }) {
  const today = new Date();
  const dateStr = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`;

  let url;
  if (useGeolocation && latitude && longitude) {
    url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
  } else {
    url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.status || 'API error');

  return json.data.timings;
}