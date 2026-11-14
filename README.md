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
- JSON backup export and import in Settings, including all entries and the theme.
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
- **Export JSON** in Settings downloads every saved entry (all months), including
  colors, notes and timestamps, plus your theme preference.
- **Import JSON** validates a Simple Calendar backup and asks for confirmation
  before replacing all existing entries and restoring the theme. Invalid backups
  leave existing data untouched; database restoration is atomic.
- Backup files are processed locally, never uploaded. Keep them somewhere safe:
  notes are plain text in the JSON file. Export before importing if you want to
  preserve the current data.

## Birthday surprise (local implementation)

The date is configured once in `src/birthday/calendar.ts`: `BIRTHDAY_MONTH = 10`
(November, zero-based), `BIRTHDAY_DAY = 22` for the actual birthday. The displayed date, calendar
highlight, replay window and tests follow these constants automatically.

- Every **November 22**, the white-rose birthday scene appears above the real
  calendar. Music attempts to start automatically; browsers that require a user
  gesture start it on the first tap instead.
- **November 23–29 inclusive**: the normal calendar opens, with just a purple
  “Для тебя ♡” button at the top. Nothing opens or plays until that button is
  clicked. “Back to calendar” closes the scene and stops/releases its music.
  Reloading on these dates always returns to the normal calendar.
- November 30 through November 21: no birthday UI or audio is mounted. Local
  midnight, app focus and returning from the background refresh eligibility.
- The real calendar's data, editing, navigation and settings are unchanged.
  The configured birthday gets a purple flower only while the birthday interface is open.
  The surprise temporarily uses a light palette without changing the saved theme.
- The note, steady 30-petal flow spanning the full screen width edge to edge,
  reversed size-based scroll depth, a warm paper letter,
  responsive roses and independent music pause/resume match the selected preview.
  Motion respects the device's reduced-motion setting.
- “Для тебя” opens a pale-yellow paper letter with a subtle gradient and grain,
  without animated sunlight or leaf/window shadows. The message and purple
  closing line are unchanged. A single 24-piece confetti shower plays on opening;
  it never repeats or schedules timers. Pieces are removed on finish, close,
  tab hiding, or reduced-motion changes.
- Images, fonts and the supplied MP3 live under `public/birthday/`; the PWA
  precaches them for offline use after the updated app has loaded online. This
  adds approximately 6 MB to the initial/update cache; no third-party music or
  font requests are made at runtime.

Tests (Node 24+, no extra test dependencies):

```sh
node --test tests/*.test.mjs
```

The temporary design previews remain separate from the production feature.
Building and running locally does not publish anything; do not run `npm run deploy`
unless publication is explicitly intended.
