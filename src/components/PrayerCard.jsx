// src/components/PrayerCard.jsx
import { formatTime } from '../utils/helpers';
import styles from './PrayerCard.module.css';

export default function PrayerCard({ prayer, time, state }) {
  return (
    <div className={`${styles.card} ${styles[state]}`}>
      <div className={`${styles.arabic} font-arabic`}>{prayer.ar}</div>
      <div className={styles.name}>{prayer.en}</div>
      <div className={styles.time}>{formatTime(time, false)}</div>
    </div>
  );
}