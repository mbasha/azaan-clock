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
  const h = settings.display24h
    ? String(rawH).padStart(2, '0')
    : String(rawH % 12 || 12).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const ampm = !settings.display24h ? (rawH >= 12 ? 'PM' : 'AM') : null;

  const dateStr   = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const dayStr    = DAYS[now.getDay()];
  const hijriStr  = formatHijriDate(now);

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

  // Determine display prayers (optionally hide Sunrise)
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
          <p className={styles.location}>
            Prayer Times &nbsp;·&nbsp; {settings.city}, {settings.country}
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
              <p className={styles.dedicationMessage}>
                Built with love, for my wife
              </p>
              <p className={styles.dedicationName}>Aminah</p>
              <button className={styles.dedicationClose} onClick={() => setShowDedication(false)}>
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── CLOCK ── */}
        <section className={styles.clockSection} aria-label="Current time">
          <div className={styles.timeDisplay} aria-live="polite" aria-atomic="true">
            <span>{h}</span>
            <span className={styles.colon} aria-hidden="true">:</span>
            <span>{m}</span>
            {settings.showSeconds && (
              <>
                <span className={`${styles.colon} ${styles.colonSec}`} aria-hidden="true">:</span>
                <span className={styles.seconds}>{s}</span>
              </>
            )}
            {ampm && <span className={styles.ampm}>{ampm}</span>}
          </div>
          <div className={styles.dateRow}>
            <span>{dayStr}</span>
            <span className={styles.dateSep} aria-hidden="true">·</span>
            <span>{dateStr}</span>
          </div>
          {settings.displayHijri && (
            <div className={styles.hijri} aria-label="Hijri date">
              {hijriStr}
            </div>
          )}
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
              use24h={settings.display24h}
            />
          ))}
        </section>

        {/* ── INFO BAR ── */}
        <section className={styles.infoBar} aria-label="Current and next prayer">
          <div className={styles.infoBlock}>
            <span className={styles.infoLabel}>Current Prayer</span>
            {activePrayer ? (
              <>
                <span className={`${styles.infoValueAr} font-arabic`}>{activePrayer.ar}</span>
                <span className={styles.infoValueEn}>{activePrayer.en}</span>
              </>
            ) : (
              <span className={styles.infoValueEn}>Before Fajr</span>
            )}
          </div>

          <CountdownRing
            countdownMs={countdownMs}
            progress={ringProgress}
            nextPrayer={nextPrayer}
            urgent={urgent}
          />

          <div className={`${styles.infoBlock} ${styles.infoRight}`}>
            <span className={styles.infoLabel}>Next Prayer</span>
            {nextPrayer ? (
              <>
                <span className={`${styles.infoValueAr} font-arabic`}>{nextPrayer.ar}</span>
                <span className={styles.infoValueEn}>{nextPrayer.en}</span>
              </>
            ) : (
              <span className={styles.infoValueEn}>—</span>
            )}
          </div>
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
