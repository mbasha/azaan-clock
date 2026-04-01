// src/components/CountdownRing.jsx
import styles from './CountdownRing.module.css';
import { formatCountdown } from '../utils/helpers';

const RADIUS = 90;
const CIRC = 2 * Math.PI * RADIUS;

export default function CountdownRing({ countdownMs, progress, nextPrayer, urgent }) {
  const offset = CIRC * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div className={styles.wrap} aria-label={`Time until ${nextPrayer?.en}: ${formatCountdown(countdownMs)}`}>
      <svg className={styles.svg} viewBox="0 0 210 210" width="210" height="210">
        <circle className={styles.track} cx="105" cy="105" r={RADIUS} />
        <circle
          className={`${styles.fill} ${urgent ? styles.urgent : ''}`}
          cx="105" cy="105" r={RADIUS}
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
        />
      </svg>
      <div className={styles.center}>
        {nextPrayer && (
          <>
            <div className={`${styles.prayerAr} font-arabic`}>{nextPrayer.ar}</div>
            <div className={styles.prayerEn}>{nextPrayer.en}</div>
          </>
        )}
        <div className={`${styles.time} ${urgent ? styles.urgentText : ''}`}>
          {countdownMs != null ? formatCountdown(countdownMs) : '—'}
        </div>
        <div className={styles.label}>until next prayer</div>
      </div>
    </div>
  );
}