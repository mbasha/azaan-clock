# Azaan Clock

A beautiful, always-on Islamic prayer times clock for your home.

**Live at:** [mbasha.github.io/azaan-clock](https://mbasha.github.io/azaan-clock)

---

## What it does

- Shows the current prayer period and a large countdown to the next prayer
- Plays the adhan automatically at each prayer time
- Plays a warning chime N minutes before the next prayer
- Displays all daily prayer times including Sunrise
- Shows Gregorian and Hijri dates
- All settings persist across page refreshes

---

## Development

```bash
make install   # install dependencies (first time only)
make local     # start dev server at localhost:3000
make deploy    # build and push to GitHub Pages
make build     # production build only
make clean     # remove node_modules and build folder
make check     # run ESLint
make logs      # tail latest GitHub Actions deployment log (requires gh CLI)
```

---

## Settings

Tap the **Settings** link in the status bar to configure:

- **Location** — manual city/country or device geolocation
- **Calculation method** — ISNA recommended for USA/Canada
- **Asr method** — Shafi'i or Hanafi
- **Adhan voice** — preset or custom URL
- **Volume** — 0–100%
- **Per-prayer toggles** — disable adhan for individual prayers
- **Warning chime** — configurable 3–15 minutes before next prayer
- **Hijri date** — toggle Islamic calendar display

---

## Recommended setup

Works best as a wall-mounted tablet saved to the home screen:

1. Open [mbasha.github.io/azaan-clock](https://mbasha.github.io/azaan-clock) in Safari on iPad
2. Tap the share button → **Add to Home Screen**
3. Open from the home screen icon (this enables audio autoplay)
4. Keep the screen always on via **Settings → Display & Brightness → Auto-Lock → Never**