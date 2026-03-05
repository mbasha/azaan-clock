// src/components/StatusBar.jsx
import { Link } from 'react-router-dom';
import styles from './StatusBar.module.css';

export default function StatusBar({ status, error, settings, onRefetch }) {
  const isLoading = status === 'loading';
  const isError   = status === 'error';
  const isOk      = status === 'success';

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span
          className={`${styles.dot} ${isLoading ? styles.loading : isError ? styles.error : styles.ok}`}
          aria-hidden="true"
        />
        <span className={styles.text}>
          {isLoading ? `Fetching times…` :
           isError   ? `Error${error ? ': ' + error : ''}` :
           `${settings.city}, ${settings.country}`}
        </span>
        {isOk && (
          <button
            className={styles.refetch}
            onClick={onRefetch}
            title="Refresh prayer times"
            aria-label="Refresh prayer times"
          >
            ↻
          </button>
        )}
      </div>
      <div className={styles.right}>
        <span className={styles.method}>
          {settings.method === 2 ? 'ISNA' :
           settings.method === 3 ? 'MWL' :
           settings.method === 4 ? 'Umm Al-Qura' :
           settings.method === 5 ? 'Egyptian' :
           `Method ${settings.method}`}
        </span>
        <Link to="/settings" className={styles.settingsLink} aria-label="Open settings">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Settings
        </Link>
      </div>
    </div>
  );
}
