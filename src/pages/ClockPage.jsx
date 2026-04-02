// src/pages/ClockPage.jsx
import { useMemo, useState, useRef, useCallback } from 'react';
import { useClock } from '../hooks/useClock';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import PrayerCard from '../components/PrayerCard';
import CountdownRing from '../components/CountdownRing';
import AdhanOverlay from '../components/AdhanOverlay';
import StatusBar from '../components/StatusBar';
import { PRAYERS, ADHAN_PRAYERS } from '../utils/constants';
import { formatHijriDate } from '../utils/helpers';
import styles from './ClockPage.module.css';

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

export default function ClockPage({ settings }) {
  const { times, status, error, refetch } = usePrayerTimes(settings);
  const {
    now, activePrayer, nextPrayer, countdownMs, ringProgress, adhanPrayer, dismissAdhan,
  } = useClock(times, settings);

  const rawH = now.getHours();
  const h = String(rawH % 12 || 12).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const ampm = rawH >= 12 ? 'PM' : 'AM';

  const dateStr  = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const dayStr   = DAYS[now.getDay()];
  const hijriStr = formatHijriDate(now);

  const urgent = countdownMs != null && countdownMs < 15 * 60 * 1000;

  // ── LONG PRESS DEDICATION ──
  const [showDedication, setShowDedication] = useState(false);
  const pressTimer = useRef(null);
  const handlePressStart = useCallback(() => {
    pressTimer.current = setTimeout(() => setShowDedication(true), 700);
  }, []);
  const handlePressEnd = useCallback(() => {
    clearTimeout(pressTimer.current);
  }, []);

  const displayPrayers = useMemo(() =>
    settings.displaySunrise ? PRAYERS : PRAYERS.filter(p => p.key !== 'Sunrise'),
  [settings.displaySunrise]);

  function getPrayerState(prayer) {
    const t = times[prayer.key];
    if (!t) return 'upcoming';
    if (activePrayer?.key === prayer.key) return 'active';
    if (nextPrayer?.key === prayer.key)   return 'next';
    if (t <= now)                          return 'passed';
    return 'upcoming';
  }

  return (
    <div className={styles.page}>
      <AdhanOverlay prayer={adhanPrayer} onDismiss={dismissAdhan} />

      <div className={styles.wrap}>

        {/* ── HEADER ── */}
        <header className={styles.header}>
          <div
            className={`${styles.bismillah} font-quran`}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            style={{ cursor: 'default', userSelect: 'none' }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
          {/* Compact time + date line */}
          <div className={styles.compactTime}>
            <span className={styles.compactClock}>
              {h}:{m} {ampm}
            </span>
            <span className={styles.compactSep}>·</span>
            <span>{dayStr}, {dateStr}</span>
            {settings.displayHijri && (
              <>
                <span className={styles.compactSep}>·</span>
                <span>{hijriStr}</span>
              </>
            )}
          </div>
          <p className={styles.location}>
            {settings.city}, {settings.country}
          </p>
        </header>

        {/* ── DEDICATION MODAL ── */}
        {showDedication && (
          <div className={styles.dedicationOverlay} onClick={() => setShowDedication(false)}>
            <div className={styles.dedicationCard} onClick={e => e.stopPropagation()}>
              <div className={styles.dedicationMoon}>☽</div>
              <p className={`${styles.dedicationArabic} font-quran`}>
                وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا
              </p>
              <p className={styles.dedicationVerse}>
                "And of His signs is that He created for you mates from among yourselves" — Ar-Rum 30:21
              </p>
              <div className={styles.dedicationDivider} />
              <p className={styles.dedicationMessage}>Built with love, for my wife</p>
              <p className={styles.dedicationName}>Aminah</p>
              <button className={styles.dedicationClose} onClick={() => setShowDedication(false)}>✕</button>
            </div>
          </div>
        )}

        {/* ── COUNTDOWN RING (hero) ── */}
        <section className={styles.ringSection} aria-label="Next prayer countdown">
          <CountdownRing
            activePrayer={activePrayer}
            countdownMs={countdownMs}
            progress={ringProgress}
            nextPrayer={nextPrayer}
            urgent={urgent}
          />
          </section>

        <div className={styles.divider} aria-hidden="true" />

        {/* ── PRAYER CARDS ── */}
        <section
          className={styles.prayerGrid}
          aria-label="Prayer times"
          style={{ gridTemplateColumns: `repeat(${displayPrayers.length}, 1fr)` }}
        >
          {displayPrayers.map(prayer => (
            <PrayerCard
              key={prayer.key}
              prayer={prayer}
              time={times[prayer.key]}
              state={getPrayerState(prayer)}
            />
          ))}
        </section>

        {/* ── STATUS BAR ── */}
        <StatusBar
          status={status}
          error={error}
          settings={settings}
          onRefetch={refetch}
        />

      </div>
    </div>
  );
}