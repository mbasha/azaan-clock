// src/components/PrayerCard.jsx
import styles from './PrayerCard.module.css';
import { formatTime } from '../utils/helpers';

export default function PrayerCard({ prayer, time, state, use24h }) {
  // state: 'active' | 'next' | 'passed' | 'upcoming'
  return (
    <div
      className={`${styles.card} ${styles[state] || ''}`}
      aria-label={`${prayer.en}: ${formatTime(time, use24h)}`}
    >
      <div className={styles.topBar} aria-hidden="true" />
      <span className={`${styles.ar} font-arabic`}>{prayer.ar}</span>
      <span className={styles.en}>{prayer.en}</span>
      <span className={styles.time}>{formatTime(time, use24h)}</span>
      {state === 'active' && (
        <span className={styles.activePip} aria-label="Current prayer" />
      )}
    </div>
  );
}
