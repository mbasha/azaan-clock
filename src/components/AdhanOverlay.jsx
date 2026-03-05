// src/components/AdhanOverlay.jsx
import styles from './AdhanOverlay.module.css';

export default function AdhanOverlay({ prayer, onDismiss }) {
  if (!prayer) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Adhan notification">
      <div className={styles.inner}>
        <div className={styles.moonIcon} aria-hidden="true">☽</div>
        <h1 className={`${styles.prayerAr} font-quran`}>{prayer.ar}</h1>
        <p className={styles.prayerEn}>Time for {prayer.en} Prayer</p>
        <div className={styles.takbeer}>
          <span className="font-arabic">اللَّهُ أَكْبَرُ</span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span className="font-arabic">اللَّهُ أَكْبَرُ</span>
        </div>
        <div className={`${styles.shahada} font-arabic`}>
          أَشْهَدُ أَن لَّا إِلَهَ إِلَّا اللَّه
        </div>
        <button className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss adhan">
          Dismiss
        </button>
      </div>
    </div>
  );
}
