// src/hooks/useClock.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { ADHAN_PRAYERS } from '../utils/constants';
import { playChime } from '../utils/helpers';

// Shared AudioContext — created once on first user gesture
let sharedCtx = null;

function getAudioContext() {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return sharedCtx;
}

// Unlock AudioContext on the first user interaction anywhere on the page
function unlockAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
  } catch (e) {}
}
if (typeof window !== 'undefined') {
  ['click', 'touchstart', 'keydown'].forEach(evt =>
    window.addEventListener(evt, unlockAudio, { once: true, passive: true })
  );
}

/**
 * Play an audio file via AudioContext so it works even after autoplay policy kicks in.
 * Falls back to HTML Audio element if fetch fails (e.g. CORS).
 */
async function playAudioUrl(url, volume = 0.85, audioRef) {
  // Stop any currently playing audio
  if (audioRef.current) {
    try { audioRef.current.pause(); } catch (e) {}
    audioRef.current = null;
  }

  // First try HTML Audio — simplest, works for same-origin and CORS-permissive sources
  try {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.volume = volume;
    audio.src = url;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      await playPromise;
    }
    audioRef.current = audio;
    return;
  } catch (e) {
    // Autoplay blocked or CORS issue — fall through to AudioContext approach
  }

  // Fallback: fetch + AudioContext decode (bypasses autoplay policy after unlock)
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
    // Store a stop handle
    audioRef.current = { pause: () => { try { source.stop(); } catch(e) {} } };
  } catch (e) {
    console.warn('Adhan audio failed to play:', e);
  }
}

export function useClock(times, settings) {
  const [now, setNow] = useState(new Date());
  const [adhanPrayer, setAdhanPrayer] = useState(null);
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

  const triggerAdhan = useCallback((prayer) => {
    setAdhanPrayer(prayer);
    const url = settings.customAdhanUrl || settings.adhanUrl;
    playAudioUrl(url, settings.adhanVolume || 0.85, audioRef);
  }, [settings]);

  // Check alarms
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

  let nextTime = times[nextPrayer?.key];
  if (nextTime && nextTime <= now) nextTime = new Date(nextTime.getTime() + 86400000);
  const countdownMs = nextTime ? nextTime - now : null;

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
