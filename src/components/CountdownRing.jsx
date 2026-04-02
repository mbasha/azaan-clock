// src/components/CountdownRing.jsx
import styles from './CountdownRing.module.css';
import { formatCountdown } from '../utils/helpers';

const W  = 600;
const H  = 320;
const CX = W / 2;
const CY = H - 20;
const R  = 270;

// Semicircle dome: left to right across the top
const TRACK_PATH = `M ${CX - R} ${CY} A ${R} ${R} 0 1 1 ${CX + R} ${CY}`;
const ARC_LEN = Math.PI * R;

export default function CountdownRing({ countdownMs, progress, nextPrayer, urgent, activePrayer }) {
  const p = Math.min(1, Math.max(0, progress));
  const offset = ARC_LEN * (1 - p);

  const color     = urgent ? 'var(--warn)'         : 'var(--gold)';
  const glowColor = urgent ? 'rgba(220,80,80,0.4)' : 'rgba(200,164,90,0.4)';

  // Moving dot tip position
  const tipAngleRad = ((180 - p * 180) * Math.PI) / 180;
  const tipX = CX + R * Math.cos(tipAngleRad);
  const tipY = CY + R * Math.sin(tipAngleRad);

  const untilLabel = nextPrayer ? `until ${nextPrayer.en}` : 'until next prayer';

  return (
    <div className={styles.wrap} aria-label={`${formatCountdown(countdownMs)} ${untilLabel}`}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {/* Track */}
        <path d={TRACK_PATH} fill="none" stroke="#182030" strokeWidth="10" strokeLinecap="round" />
        {/* Fill */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={ARC_LEN}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s', filter: `drop-shadow(0 0 10px ${glowColor})` }}
        />
        {/* Tip dot */}
        {p > 0.01 && p < 0.99 && (
          <circle cx={tipX} cy={tipY} r="8" fill={color} style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }} />
        )}
      </svg>

      {/* Content inside dome — pushed high */}
      <div className={styles.content}>
        {/* Active prayer — what we're currently in */}
        {activePrayer && (
          <>
            <div className={`${styles.activeAr} font-arabic`}>{activePrayer.ar}</div>
            <div className={styles.activeEn}>{activePrayer.en}</div>
          </>
        )}
        {/* Countdown */}
        <div className={`${styles.countdown} ${urgent ? styles.urgentText : ''}`}>
          {countdownMs != null ? formatCountdown(countdownMs) : '—'}
        </div>
        {/* "until Asr" */}
        <div className={styles.untilLabel}>{untilLabel}</div>
      </div>
    </div>
  );
}