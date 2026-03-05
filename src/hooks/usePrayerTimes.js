// src/hooks/usePrayerTimes.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPrayerTimes, parseTimeToDate, todayKey } from '../utils/helpers';
import { PRAYERS } from '../utils/constants';

const CACHE_KEY = 'azaan_clock_times';

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
}

/**
 * Returns parsed prayer times as Date objects keyed by prayer name.
 * Automatically re-fetches when date changes or settings change.
 */
export function usePrayerTimes(settings) {
  const [times, setTimes] = useState({});       // { Fajr: Date, ... }
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [fetchedDate, setFetchedDate] = useState(null);
  const fetchingRef = useRef(false);

  const fetch = useCallback(async (force = false) => {
    if (fetchingRef.current) return;
    const key = todayKey();

    // Try cache first (same day, same city, not forced)
    if (!force) {
      const cache = loadCache();
      if (cache && cache.dateKey === key && cache.city === settings.city && cache.country === settings.country && cache.method === settings.method) {
        const parsed = {};
        PRAYERS.forEach(p => {
          if (cache.timings[p.key]) parsed[p.key] = parseTimeToDate(cache.timings[p.key]);
        });
        setTimes(parsed);
        setFetchedDate(key);
        setStatus('success');
        return;
      }
    }

    fetchingRef.current = true;
    setStatus('loading');
    setError(null);

    try {
      const timings = await fetchPrayerTimes(settings);
      const parsed = {};
      PRAYERS.forEach(p => {
        if (timings[p.key]) parsed[p.key] = parseTimeToDate(timings[p.key]);
      });
      setTimes(parsed);
      setFetchedDate(key);
      setStatus('success');
      saveCache({ dateKey: key, city: settings.city, country: settings.country, method: settings.method, timings });
    } catch (e) {
      setError(e.message);
      setStatus('error');
      // Fall back to cache if available
      const cache = loadCache();
      if (cache?.timings) {
        const parsed = {};
        PRAYERS.forEach(p => {
          if (cache.timings[p.key]) parsed[p.key] = parseTimeToDate(cache.timings[p.key]);
        });
        setTimes(parsed);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, [settings.city, settings.country, settings.method, settings.latitude, settings.longitude, settings.useGeolocation]);

  // Fetch on mount and when settings change
  useEffect(() => { fetch(false); }, [fetch]);

  // Auto-refresh at midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const key = todayKey();
      if (fetchedDate && key !== fetchedDate) fetch(true);
    }, 60000); // check every minute
    return () => clearInterval(interval);
  }, [fetchedDate, fetch]);

  return { times, status, error, refetch: () => fetch(true) };
}
