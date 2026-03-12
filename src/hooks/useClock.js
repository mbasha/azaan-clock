// src/hooks/useClock.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { ADHAN_PRAYERS } from '../utils/constants';

function playChimeFile(volume = 0.7) {
  [0, 2000, 4000].forEach(delay => {
    setTimeout(() => {
      try {
        const audio = new Audio('/azaan-clock/chime.mp3');
        audio.volume = volume;
        audio.play().catch(e => console.warn('Chime failed:', e));
      } catch (e) {}
    }, delay);
  });
}

export function useClock(times, settings) {
  const [now, setNow] = useState(new Date());
  const [adhanPrayer, setAdhanPrayer] = useState(null);
  const firedAdhan = useRef({});
  const firedWarn  = useRef({});
  const audioRef   = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const today = now.toDateString();
    if (firedAdhan.current._date !== today) {
      firedAdhan.current = { _date: today };
      firedWarn.current  = { _date: today };
    }
  }, [now]);

  const triggerAdhan = useCallback((prayer) => {
    setAdhanPrayer(prayer);
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const url = settings.customAdhanUrl || settings.adhanUrl;
      const audio = new Audio(url);
      audio.volume = settings.adhanVolume || 0.85;
      audio.play().catch(e => console.warn('Adhan failed:', e));
      audioRef.current = audio;
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    if (!Object.keys(times).length) return;

    ADHAN_PRAYERS.forEach((p, i) => {
      const t = times[p.key];
      if (!t) return;

      const diffMs = now - t;

      const adhanEnabled = settings[`enable${p.key}Adhan`] !== false;
      if (adhanEnabled && diffMs >= 0 && diffMs < 30000 && !firedAdhan.current[p.key]) {
        firedAdhan.current[p.key] = true;
        triggerAdhan(p);
      }

      if (settings.enableWarning !== false && i < ADHAN_PRAYERS.length - 1) {
        const nextKey = ADHAN_PRAYERS[i + 1].key;
        const nextT = times[nextKey];
        if (nextT) {
          const minsToNext = (nextT - now) / 60000;
          const window = settings.warningMinutes || 5;
          if (minsToNext > window - 0.5 && minsToNext < window + 0.5 && !firedWarn.current[p.key]) {
            firedWarn.current[p.key] = true;
            if (settings.enableChime !== false) {
              playChimeFile(settings.adhanVolume || 0.7);
            }
          }
        }
      }
    });
  }, [now, times, settings, triggerAdhan]);

  const dismissAdhan = useCallback(() => {
    setAdhanPrayer(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

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

  let nextTime = times[nextPrayer?.key];
  if (nextTime && nextTime <= now) nextTime = new Date(nextTime.getTime() + 86400000);
  const countdownMs = nextTime ? nextTime - now : null;

  let ringProgress = 0;
  if (activePrayer && times[activePrayer.key] && nextTime) {
    const periodMs = nextTime - times[activePrayer.key];
    ringProgress = Math.min(1, Math.max(0, (now - times[activePrayer.key]) / periodMs));
  }

  return {
    now, activePrayer, nextPrayer, countdownMs, ringProgress, adhanPrayer, dismissAdhan,
  };
}