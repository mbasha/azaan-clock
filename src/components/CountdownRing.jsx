// src/components/CountdownRing.jsx
import styles from './CountdownRing.module.css';
import { formatCountdown } from '../utils/helpers';

const RADIUS = 54;
const CIRC = 2 * Math.PI * RADIUS;

export default function CountdownRing({ countdownMs, progress, nextPrayer, urgent }) {
  const offset = CIRC * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div className={styles.wrap} aria-label={`Time until ${nextPrayer?.en}: ${formatCountdown(countdownMs)}`}>
      <svg className={styles.svg} viewBox="0 0 130 130" width="130" height="130">
        {/* Track */}
        <circle
          className={styles.track}
          cx="65" cy="65" r={RADIUS}
        />
        {/* Progress */}
        <circle
          className={`${styles.fill} ${urgent ? styles.urgent : ''}`}
          cx="65" cy="65" r={RADIUS}
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
        />
      </svg>
      <div className={styles.center}>
        <div className={`${styles.time} ${urgent ? styles.urgentText : ''}`}>
          {countdownMs != null ? formatCountdown(countdownMs) : '—'}
        </div>
        <div className={styles.label}>
          {nextPrayer ? `until ${nextPrayer.en}` : 'next prayer'}
        </div>
      </div>
    </div>
  );
}
