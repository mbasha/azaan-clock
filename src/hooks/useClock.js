// src/hooks/useClock.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { ADHAN_PRAYERS } from '../utils/constants';
import { playChime } from '../utils/helpers';

// Shared unlocked AudioContext — only created after user gesture
let sharedCtx = null;
let audioUnlocked = false;

export function unlockAudio() {
  try {
    if (!sharedCtx) {
      sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (sharedCtx.state === 'suspended') {
      sharedCtx.resume();
    }
    audioUnlocked = true;
  } catch (e) {
    console.warn('AudioContext unlock failed:', e);
  }
}

async function playAudioUrl(url, volume = 0.85, audioRef) {
  if (audioRef.current) {
    try { audioRef.current.pause(); } catch (e) {}
    audioRef.current = null;
  }

  try {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.volume = volume;
    audio.src = url;
    await audio.play();
    audioRef.current = audio;
    return;
  } catch (e) {
    // Blocked — fall through to AudioContext decode
  }

  if (!audioUnlocked || !sharedCtx) {
    console.warn('Audio not unlocked yet — user must tap the screen first');
    return;
  }
  try {
    if (sharedCtx.state === 'suspended') await sharedCtx.resume();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await sharedCtx.decodeAudioData(arrayBuffer);
    const source = sharedCtx.createBufferSource();
    const gainNode = sharedCtx.createGain();
    gainNode.gain.value = volume;
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(sharedCtx.destination);
    source.start(0);
    audioRef.current = { pause: () => { try { source.stop(); } catch(e) {} } };
  } catch (e) {
    console.warn('Adhan audio failed:', e);
  }
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
    const url = settings.customAdhanUrl || settings.adhanUrl;
    playAudioUrl(url, settings.adhanVolume || 0.85, audioRef);
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

      if (settings.enableWarning && i < ADHAN_PRAYERS.length - 1) {
        const nextKey = ADHAN_PRAYERS[i + 1].key;
        const nextT = times[nextKey];
        if (nextT) {
          const minsToNext = (nextT - now) / 60000;
          const window = settings.warningMinutes || 5;
          if (minsToNext > window - 0.5 && minsToNext < window + 0.5 && !firedWarn.current[p.key]) {
            firedWarn.current[p.key] = true;
            if (settings.enableChime !== false) playChime(settings.adhanVolume || 0.7);
          }
        }
      }
    });
  }, [now, times, settings, triggerAdhan]);

  const dismissAdhan = useCallback(() => {
    setAdhanPrayer(null);
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch (e) {}
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