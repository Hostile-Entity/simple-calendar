# Simple Calendar

Simple mobile-first PWA calendar with per-day colors and notes, stored only on the device.

## What It Does

- Shows one month at a time, starts on current month.
- Monday-first calendar layout.
- Highlights:
  - today (strong highlight)
  - selected date (softer highlight)
- Swipe left/right to switch months.
- Optional month navigation buttons below calendar.
- Per-day data:
  - 10 color options (including white/reset option)
  - simple note
- Settings modal with **Delete all data** (with confirmation).
- Month header includes a themed emoji for each month.
- Works offline after first load (PWA + service worker).

## Tech Stack

- **React 18** + **TypeScript**
- **Vite**
- **vite-plugin-pwa**
- **Dexie** + **IndexedDB** for local persistence
- **gh-pages** for deployment

## Project Structure

```text
src/
  App.tsx                     # app shell and state wiring
  styles.css                  # mobile-first UI styles
  main.tsx                    # app bootstrap + service worker registration
  components/
    CalendarGrid.tsx          # month grid and day cells
    MonthPager.tsx            # swipe handling + month controls
    DayEditor.tsx             # color and note editor
    SettingsModal.tsx         # delete-all-data setting
  db/
    calendarDb.ts             # Dexie schema + CRUD helpers
  utils/
    date.ts                   # month math, labels, emoji mapping
  constants/
    colors.ts                 # fixed color options
public/icons/
  pwa-192.png
  pwa-512.png
  settings.svg
```

## Local Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Create production build:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Deployment (GitHub Pages)

This project is configured for GitHub Pages under:

- repo: `Hostile-Entity/simple-calendar`
- base path: `/simple-calendar/`

Deploy command:

```bash
npm run deploy
```

What `npm run deploy` does:

1. Runs `predeploy` -> `npm run build`
2. Publishes `dist/` to the `gh-pages` branch


## Data Storage

- All calendar entries are stored locally in browser IndexedDB.
- No backend/API is used.
- `Delete all data` in Settings clears all saved entries on that device/browser.
