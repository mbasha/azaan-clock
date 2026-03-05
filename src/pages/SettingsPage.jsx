// src/pages/SettingsPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CALCULATION_METHODS, ADHAN_VOICES } from '../utils/constants';
import styles from './SettingsPage.module.css';

function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <label className={styles.fieldLabel}>{label}</label>
        {hint && <span className={styles.fieldHint}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

function Row({ label, hint, children }) {
  return (
    <div className={styles.row}>
      <div>
        <div className={styles.rowLabel}>{label}</div>
        {hint && <div className={styles.rowHint}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage({ settings, updateSettings, resetSettings }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [testingAudio, setTestingAudio] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  const set = (key, val) => setDraft(d => ({ ...d, [key]: val }));

  function handleSave() {
    updateSettings(draft);
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/'); }, 1200);
  }

  function handleReset() {
    if (window.confirm('Reset all settings to defaults?')) {
      resetSettings();
      navigate('/');
    }
  }

  function handleTestAudio() {
    if (testingAudio) return;
    setTestingAudio(true);
    const url = draft.customAdhanUrl || draft.adhanUrl;
    try {
      const audio = new Audio(url);
      audio.volume = draft.adhanVolume || 0.85;
      audio.play().catch(() => {});
      setTimeout(() => { audio.pause(); setTestingAudio(false); }, 6000);
    } catch {
      setTestingAudio(false);
    }
  }

  function handleGeolocation() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by this browser.');
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode using a free API
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const country = data.address?.country_code?.toUpperCase() || '';
          setDraft(d => ({ ...d, latitude, longitude, useGeolocation: true, city, country }));
        } catch {
          setDraft(d => ({ ...d, latitude, longitude, useGeolocation: true }));
        }
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(err.message);
        setLocationLoading(false);
      }
    );
  }

  const isCustomAudio = draft.adhanUrl === 'custom';

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>

        {/* ── TOP NAV ── */}
        <header className={styles.header}>
          <Link to="/" className={styles.backLink} aria-label="Back to clock">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Clock
          </Link>
          <h1 className={styles.pageTitle}>Settings</h1>
          <div className={styles.headerActions}>
            <button className={styles.resetBtn} onClick={handleReset} type="button">
              Reset Defaults
            </button>
            <button
              className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`}
              onClick={handleSave}
              type="button"
            >
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </header>

        {/* ── LOCATION ── */}
        <Section title="📍 Location">
          <Row
            label="Use device location"
            hint="Automatically detect your city for accurate prayer times"
          >
            <Toggle
              checked={draft.useGeolocation}
              onChange={v => set('useGeolocation', v)}
              label="Use device geolocation"
            />
          </Row>

          {locationError && (
            <div className={styles.errorBanner}>{locationError}</div>
          )}

          {!draft.useGeolocation ? (
            <div className={styles.twoCol}>
              <Field label="City">
                <input
                  className={styles.input}
                  type="text"
                  value={draft.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="e.g. Charleston"
                />
              </Field>
              <Field label="Country Code">
                <input
                  className={styles.input}
                  type="text"
                  value={draft.country}
                  onChange={e => set('country', e.target.value.toUpperCase())}
                  placeholder="e.g. US"
                  maxLength={3}
                />
              </Field>
            </div>
          ) : (
            <div className={styles.geoRow}>
              <button
                className={styles.geoBtn}
                onClick={handleGeolocation}
                disabled={locationLoading}
                type="button"
              >
                {locationLoading ? (
                  <span className={styles.spinner} />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 1v2M7 11v2M1 7h2M11 7h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
                {locationLoading ? 'Detecting…' : 'Detect My Location'}
              </button>
              {draft.latitude && (
                <span className={styles.geoResult}>
                  {draft.city} · {draft.latitude.toFixed(4)}, {draft.longitude.toFixed(4)}
                </span>
              )}
            </div>
          )}
        </Section>

        {/* ── CALCULATION ── */}
        <Section title="🕌 Prayer Calculation">
          <Field
            label="Calculation Method"
            hint="ISNA is recommended for the United States and Canada"
          >
            <div className={styles.methodList}>
              {CALCULATION_METHODS.map(m => (
                <label
                  key={m.value}
                  className={`${styles.methodOption} ${draft.method === m.value ? styles.methodSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.value}
                    checked={draft.method === m.value}
                    onChange={() => set('method', m.value)}
                    className={styles.radioInput}
                  />
                  <div className={styles.methodContent}>
                    <span className={styles.methodLabel}>{m.label}</span>
                    <span className={styles.methodDesc}>{m.description}</span>
                  </div>
                  {draft.method === m.value && (
                    <span className={styles.checkmark} aria-hidden="true">✓</span>
                  )}
                </label>
              ))}
            </div>
          </Field>

          <div className={styles.twoCol}>
            <Field label="Asr Juristic Method" hint="Affects Asr calculation">
              <select
                className={styles.select}
                value={draft.school}
                onChange={e => set('school', Number(e.target.value))}
              >
                <option value={0}>Shafi'i / Maliki / Hanbali (Standard)</option>
                <option value={1}>Hanafi (Later time)</option>
              </select>
            </Field>
            <Field label="Midnight Mode" hint="Affects Isha end time">
              <select
                className={styles.select}
                value={draft.midnightMode}
                onChange={e => set('midnightMode', Number(e.target.value))}
              >
                <option value={0}>Standard (mid-sunset to sunrise)</option>
                <option value={1}>Jafari (mid-sunset to Fajr)</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* ── ADHAN AUDIO ── */}
        <Section title="🔊 Adhan & Audio">
          <Field label="Adhan Voice">
            <div className={styles.voiceList}>
              {ADHAN_VOICES.map(v => (
                <label
                  key={v.value}
                  className={`${styles.voiceOption} ${draft.adhanUrl === v.value ? styles.voiceSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="voice"
                    value={v.value}
                    checked={draft.adhanUrl === v.value}
                    onChange={() => set('adhanUrl', v.value)}
                    className={styles.radioInput}
                  />
                  <span>{v.label}</span>
                  {draft.adhanUrl === v.value && (
                    <span className={styles.checkmark} aria-hidden="true">✓</span>
                  )}
                </label>
              ))}
            </div>
          </Field>

          {draft.adhanUrl === 'custom' && (
            <Field label="Custom Adhan URL" hint="Direct link to an MP3 file">
              <input
                className={styles.input}
                type="url"
                value={draft.customAdhanUrl}
                onChange={e => set('customAdhanUrl', e.target.value)}
                placeholder="https://example.com/adhan.mp3"
              />
            </Field>
          )}

          <Field label={`Volume: ${Math.round((draft.adhanVolume || 0.85) * 100)}%`}>
            <input
              className={styles.range}
              type="range"
              min="0" max="1" step="0.05"
              value={draft.adhanVolume || 0.85}
              onChange={e => set('adhanVolume', parseFloat(e.target.value))}
              aria-label="Adhan volume"
            />
          </Field>

          <button
            className={styles.testBtn}
            onClick={handleTestAudio}
            disabled={testingAudio}
            type="button"
          >
            {testingAudio ? (
              <><span className={styles.spinner} /> Playing…</>
            ) : (
              <>▶ Test Adhan Audio</>
            )}
          </button>

          <div className={styles.divider} />

          <h3 className={styles.subTitle}>Enable Adhan by Prayer</h3>
          {['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(key => (
            <Row key={key} label={key}>
              <Toggle
                checked={draft[`enable${key}Adhan`] !== false}
                onChange={v => set(`enable${key}Adhan`, v)}
                label={`Enable adhan for ${key}`}
              />
            </Row>
          ))}

          <div className={styles.divider} />

          <h3 className={styles.subTitle}>Warning Chime</h3>
          <Row
            label="Enable warning chime"
            hint="Plays a soft bell chime before the next prayer begins"
          >
            <Toggle
              checked={draft.enableWarning !== false}
              onChange={v => set('enableWarning', v)}
              label="Enable warning chime"
            />
          </Row>
          {draft.enableWarning && (
            <Field
              label={`Warning time: ${draft.warningMinutes || 5} minutes before next prayer`}
            >
              <input
                className={styles.range}
                type="range"
                min="3" max="15" step="1"
                value={draft.warningMinutes || 5}
                onChange={e => set('warningMinutes', Number(e.target.value))}
                aria-label="Warning minutes"
              />
              <div className={styles.rangeLabels}>
                <span>3 min</span><span>15 min</span>
              </div>
            </Field>
          )}
        </Section>

        {/* ── DISPLAY ── */}
        <Section title="🖥 Display">
          <Row label="Show Hijri date" hint="Islamic calendar date below the Gregorian date">
            <Toggle checked={draft.displayHijri !== false} onChange={v => set('displayHijri', v)} label="Show Hijri date" />
          </Row>
          <Row label="24-hour time" hint="Use 24h format instead of 12h AM/PM">
            <Toggle checked={draft.display24h !== false} onChange={v => set('display24h', v)} label="24-hour time" />
          </Row>
          <Row label="Show seconds">
            <Toggle checked={draft.showSeconds !== false} onChange={v => set('showSeconds', v)} label="Show seconds" />
          </Row>
          <Row label="Show Sunrise" hint="Display Sunrise (Ishraq) in the prayer grid">
            <Toggle checked={draft.displaySunrise !== false} onChange={v => set('displaySunrise', v)} label="Show sunrise" />
          </Row>
        </Section>

        {/* ── SAVE FOOTER ── */}
        <div className={styles.footer}>
          <button className={styles.resetBtn} onClick={handleReset} type="button">
            Reset to Defaults
          </button>
          <button
            className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`}
            onClick={handleSave}
            type="button"
          >
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
