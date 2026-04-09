// src/hooks/useClock.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { ADHAN_PRAYERS } from '../utils/constants';

export function useClock(times, settings) {
  const [now, setNow] = useState(new Date());
  const [adhanPrayer, setAdhanPrayer] = useState(null);
  const firedAdhan     = useRef({});
  const firedWarn      = useRef({});
  const adhanAudioRef  = useRef(null);
  const chimeAudioRef  = useRef(null);
  const autoDismissRef = useRef(null);

  // Preload adhan
  useEffect(() => {
    const url = settings.customAdhanUrl || settings.adhanUrl;
    if (!url) return;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = url;
    audio.load();
    adhanAudioRef.current = audio;
    return () => { audio.pause(); };
  }, [settings.adhanUrl, settings.customAdhanUrl]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = '/azaan-clock/chime.mp3';
    audio.load();
    chimeAudioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const locationKey = `${settings.city}-${settings.country}-${settings.latitude}-${settings.longitude}`;
  useEffect(() => {
    const key = `${now.toDateString()}|${locationKey}`;
    if (firedAdhan.current._key !== key) {
      firedAdhan.current = { _key: key };
      firedWarn.current  = { _key: key };
    }
  }, [now, locationKey]);

  const dismissAdhan = useCallback(() => {
    setAdhanPrayer(null);
    if (adhanAudioRef.current) {
      adhanAudioRef.current.pause();
      adhanAudioRef.current.currentTime = 0;
    }
    if (autoDismissRef.current) {
      clearTimeout(autoDismissRef.current);
      autoDismissRef.current = null;
    }
  }, []);

  const triggerAdhan = useCallback((prayer) => {
    setAdhanPrayer(prayer);
    try {
      const audio = adhanAudioRef.current;
      if (!audio) return;
      audio.volume = settings.adhanVolume || 0.85;
      audio.currentTime = 0;
      audio.play().catch(e => console.warn('Adhan failed:', e));
    } catch (e) {}
    if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    autoDismissRef.current = setTimeout(() => dismissAdhan(), 5 * 60 * 1000);
  }, [settings.adhanVolume, dismissAdhan]);

  const playChime = useCallback((volume = 0.7) => {
    const audio = chimeAudioRef.current;
    if (!audio) return;
    let count = 0;
    const playOnce = () => {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(e => console.warn('Chime failed:', e));
      count++;
      if (count < 3) {
        // Wait for end + small gap before replaying
        audio.onended = () => {
          setTimeout(playOnce, 500);
        };
      } else {
        audio.onended = null;
      }
    };
    playOnce();
  }, []);

  useEffect(() => {
    if (!Object.keys(times).length) return;

    ADHAN_PRAYERS.forEach((p, i) => {
      const t = times[p.key];
      if (!t) return;

      const diffMs = now - t;
      
      const adhanEnabled = p.key !== 'Sunrise' && settings[`enable${p.key}Adhan`] !== false;
      if (adhanEnabled && diffMs >= 0 && diffMs < 30000 && !firedAdhan.current[p.key]) {
        firedAdhan.current[p.key] = true;
        triggerAdhan(p);
      }

      if (settings.enableWarning !== false && i < ADHAN_PRAYERS.length - 1) {
        const nextKey = ADHAN_PRAYERS[i + 1].key;
        const nextT   = times[nextKey];
        if (nextT) {
          const minsToNext = (nextT - now) / 60000;
          const threshold  = settings.warningMinutes || 5;
          if (minsToNext <= threshold && minsToNext > threshold - (1 / 60) && !firedWarn.current[p.key]) {
            firedWarn.current[p.key] = true;
            if (settings.enableChime !== false) playChime(settings.adhanVolume || 0.7);
          }
        }
      }
    });
  }, [now, times, settings, triggerAdhan, playChime]);

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