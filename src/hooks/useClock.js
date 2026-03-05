// src/hooks/useClock.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { ADHAN_PRAYERS } from '../utils/constants';
import { playChime } from '../utils/helpers';

export function useClock(times, settings) {
  const [now, setNow] = useState(new Date());
  const [adhanPrayer, setAdhanPrayer] = useState(null); // prayer currently ringing
  const firedAdhan = useRef({});
  const firedWarn  = useRef({});
  const audioRef   = useRef(null);

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Reset fired flags on new day
  useEffect(() => {
    const today = now.toDateString();
    if (firedAdhan.current._date !== today) {
      firedAdhan.current = { _date: today };
      firedWarn.current  = { _date: today };
    }
  }, [now]);

  // Check alarms
  useEffect(() => {
    if (!Object.keys(times).length) return;

    ADHAN_PRAYERS.forEach((p, i) => {
      const t = times[p.key];
      if (!t) return;

      const diffMs = now - t; // positive = past prayer time

      // Adhan: fire within 30-second window of prayer time
      const adhanEnabled = settings[`enable${p.key}Adhan`] !== false;
      if (adhanEnabled && diffMs >= 0 && diffMs < 30000 && !firedAdhan.current[p.key]) {
        firedAdhan.current[p.key] = true;
        triggerAdhan(p);
      }

      // Warning: N minutes before next prayer
      if (settings.enableWarning && i < ADHAN_PRAYERS.length - 1) {
        const nextKey = ADHAN_PRAYERS[i + 1].key;
        const nextT = times[nextKey];
        if (nextT) {
          const minsToNext = (nextT - now) / 60000;
          const window = settings.warningMinutes || 5;
          if (minsToNext > window - 0.5 && minsToNext < window + 0.5 && !firedWarn.current[p.key]) {
            firedWarn.current[p.key] = true;
            if (settings.enableChime) playChime(settings.adhanVolume || 0.7);
          }
        }
      }
    });
  }, [now, times, settings]);

  const triggerAdhan = useCallback((prayer) => {
    setAdhanPrayer(prayer);
    const url = settings.customAdhanUrl || settings.adhanUrl;
    try {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const audio = new Audio(url);
      audio.volume = settings.adhanVolume || 0.85;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch (e) {}
  }, [settings]);

  const dismissAdhan = useCallback(() => {
    setAdhanPrayer(null);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  }, []);

  // Derive active and next prayer indices
  let activePrayerIdx = -1;
  ADHAN_PRAYERS.forEach((p, i) => {
    if (times[p.key] && times[p.key] <= now) activePrayerIdx = i;
  });
  const nextPrayerIdx = activePrayerIdx === -1
    ? 0
    : activePrayerIdx + 1 < ADHAN_PRAYERS.length
      ? activePrayerIdx + 1
      : 0;

  const activePrayer = activePrayerIdx >= 0 ? ADHAN_PRAYERS[activePrayerIdx] : null;
  const nextPrayer   = ADHAN_PRAYERS[nextPrayerIdx];

  // Countdown to next prayer
  let nextTime = times[nextPrayer?.key];
  if (nextTime && nextTime <= now) nextTime = new Date(nextTime.getTime() + 86400000);
  const countdownMs = nextTime ? nextTime - now : null;

  // Ring progress (0–1)
  let ringProgress = 0;
  if (activePrayer && times[activePrayer.key] && nextTime) {
    const periodMs = nextTime - times[activePrayer.key];
    ringProgress = Math.min(1, Math.max(0, (now - times[activePrayer.key]) / periodMs));
  }

  return {
    now,
    activePrayer,
    nextPrayer,
    countdownMs,
    ringProgress,
    adhanPrayer,
    dismissAdhan,
  };
}
