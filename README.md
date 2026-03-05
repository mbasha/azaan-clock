# 🕌 Azaan Clock

A beautiful, always-on prayer times clock for your home — built with React.

## Features

- **Live digital clock** with Gregorian & Hijri dates
- **Daily prayer times** fetched from [aladhan.com](https://aladhan.com) (free API, no key needed)
- **Adhan plays automatically** at each prayer time with a full-screen overlay
- **5-minute warning chime** (soft bell tones) before next prayer
- **Per-prayer adhan toggle** — enable/disable each prayer individually
- **Multiple adhan voices** to choose from
- **Device geolocation** or manual city/country
- **8 calculation methods** (ISNA default — best for USA/Canada)
- **Hanafi/Shafi Asr** option
- **24h / 12h** time display
- **Hijri date** display
- **Fully responsive** — works on tablet, desktop, wall mount
- All settings **persist in localStorage** — survives page refresh

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for GitHub Pages / production
npm run build
```

---

## Deploy to GitHub Pages

1. Install the deploy helper:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/azaan-clock",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

4. In your GitHub repo → Settings → Pages → Source: `gh-pages` branch

Your clock will be live at `https://YOUR_USERNAME.github.io/azaan-clock`

---

## Settings

Navigate to `/settings` or click the **Settings** link in the status bar.

| Setting | Description |
|---|---|
| City / Country | Manual location for prayer time calculation |
| Device Geolocation | Auto-detect location (uses browser GPS + OpenStreetMap) |
| Calculation Method | ISNA recommended for USA. 8 methods available. |
| Asr Method | Shafi'i (standard) or Hanafi |
| Adhan Voice | 4 preset voices + custom URL |
| Volume | 0–100% slider |
| Per-prayer toggles | Disable adhan for specific prayers (e.g. Dhuhr at work) |
| Warning chime | Configurable 3–15 minute bell before next prayer |
| Hijri date | Toggle Islamic calendar display |
| 24h / 12h | Clock format |
| Show seconds | Toggle seconds display |
| Show Sunrise | Toggle Ishraq/Sunrise in prayer grid |

---

## Project Structure

```
src/
├── components/
│   ├── AdhanOverlay.jsx      # Full-screen adhan notification
│   ├── Background.jsx        # Animated starfield + Islamic geometry
│   ├── CountdownRing.jsx     # SVG ring countdown to next prayer
│   ├── PrayerCard.jsx        # Individual prayer time card
│   └── StatusBar.jsx         # Connection status + settings link
├── hooks/
│   ├── useClock.js           # Tick, active prayer, alarm firing
│   ├── usePrayerTimes.js     # API fetch with caching
│   └── useSettings.js        # LocalStorage persistence
├── pages/
│   ├── ClockPage.jsx         # Main clock display
│   └── SettingsPage.jsx      # Full settings UI
└── utils/
    ├── constants.js           # Prayer list, methods, defaults
    └── helpers.js             # Time formatting, Hijri, audio
```

---

## API

Prayer times are fetched from the free [Aladhan API](https://aladhan.com/prayer-times-api):

```
GET https://api.aladhan.com/v1/timingsByCity/{date}?city=Charleston&country=US&method=2
```

Times are cached in `localStorage` keyed by date + city — only one API call per day.

---

## For Wall Mount (Tablet)

1. Open the deployed URL in Chrome/Silk browser
2. Tap "Add to Home Screen" for app-like experience  
3. Open the app → tap fullscreen (F11 or browser menu)
4. Keep screen awake: Settings → Display → Screen timeout → Never

Tested on Amazon Fire HD 8 and 10.
