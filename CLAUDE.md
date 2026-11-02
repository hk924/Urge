# Urge App

## What This Is
Urge is a personal habit-tracking PWA for resisting temptations (snacking, impulse purchases, etc). Users log "resists" (successfully resisted a temptation) and "smells" (gave in), track streaks, money saved, weight and body composition, and daily mood check-ins. The app delivers personalized motivational messages based on the user's goals and "why".

## Language
The app UI is in Norwegian (Bokmål). Keep all user-facing text in Norwegian.

## Tech Stack
- **Frontend:** Vite 5 + React 18 (plain JSX, no TypeScript, no router, no state library)
- **Backend:** Supabase (email OTP auth, Postgres with RLS on `user_id`, Edge Functions in Deno/TS)
- **Styling:** Inline styles from `src/constants/theme.js`, dark glassmorphism theme
- **Fonts:** DM Mono + Source Serif 4 (Google Fonts, loaded non-blocking)
- **PWA:** `public/manifest.json` + `public/sw.js` (cache-first; bump the cache version when shipping changes)
- **Tests:** Vitest + Testing Library (jsdom)
- **Hosting:** GitHub `hk924/Urge` → Vercel

## Running
Node lives at `~/.local/node-v20.11.1-darwin-x64/bin` and is not on PATH by default:
```
export PATH="$HOME/.local/node-v20.11.1-darwin-x64/bin:$PATH"
npm run dev      # local dev server
npm test         # vitest run
npm run build    # production build to dist/
```
Env vars in `.env` (gitignored): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Project Structure
```
src/
  App.jsx              All app state + Supabase data loading/mutations; passes props down
  main.jsx
  lib/supabase.js      Supabase client (autoRefreshToken, persisted session)
  lib/withings.js      Client calls to Withings edge functions
  constants/theme.js   Colors, fonts, shared style objects (glass, bp, bsm, bgg, stt, ip, ba)
  constants/data.js    Goals, whys, triggers, milestones, quotes, moods, workout types (WTS), STREAK_LEVELS
  utils/helpers.js     Date helpers (td, fd, fds, ago, agl) + gmq (motivational message generator)
  utils/streak.js      calcCurrentStreak, calcBestStreak, calcMoneySaved
  components/          Auth, Onboarding, Home, ResistFlow, SmellFlow, Stats, Log, Body, BodyChart,
                       Settings, TabBar, Chart, Confetti, FlameIcon, TriggerIcon, ErrToast
  components/__tests__ Component tests
supabase/
  migrations/          SQL migrations (001_withings.sql)
  functions/           withings-auth, withings-callback, withings-sync, _shared (cors, withings)
TESTS.md               User stories / test scenarios (Norwegian)
```

## Architecture Notes
- All state lives in `App.jsx` (short, terse state names like `res`, `sml`, `chk`, `wgt`, `wko`); components are mostly presentational and receive data + callbacks via props.
- `loadData` runs the Supabase queries in parallel; `body_goals` is fetched separately so an RLS problem there can't stall the app.
- Auth is driven by `onAuthStateChange` (needed for PWA session persistence).
- Heavier components are lazy-loaded for fast startup.
- Tabs (`TabBar.jsx`): Hjem, Statistikk, Logg, Kropp. Settings opens as an overlay.
- Dates are stored as local `YYYY-MM-DD` strings (`td()`), not UTC timestamps.

## Database Schema
- **profiles**: id, name, email, goals (jsonb), config (jsonb: triggers, milestones, cost per smell, etc.)
- **resists**: id, user_id, trigger_type, date, logged_at
- **smells**: id, user_id, trigger_text, feeling, what, cost, date, logged_at
- **checkins**: id, user_id, mood, mood_id, date
- **weights**: id, user_id, kg, fat, muscle, date, source ('manual' | 'withings'), external_id (unique when set)
- **workouts**: id, user_id, type, duration, date
- **body_goals**: per-user body targets used by the Kropp tab
- **withings_tokens**: OAuth tokens, service_role only (no RLS policies)

## Design System
- Primary: #7c5cfc (purple)
- Accent: #4ade80 (green, used for "saved money" and success)
- Smell color: #b07cc3 (muted purple/pink)
- Background: #0a0a0f (near black)
- Surface: #111118, #18181f
- Border: #222230
- Text: #e8e6e1 (primary), #8888a0 (muted), #555568 (light)
- Glass effect: rgba(20,20,30,0.7) with backdrop-blur(20px)
- Border radius: 20px (cards), 14px (buttons), 12px (inputs)
- Fonts: Source Serif 4 for body, DM Mono for labels/stats

## Features
1. **Auth**: Email OTP via Supabase
2. **Onboarding**: Goal selection + "why" selection (2 steps)
3. **Home**: Streak, money saved, motivational quote, daily mood check-in, resist/smell buttons
4. **Resist flow**: Select trigger → confirmation with confetti, motivational message and stats
5. **Smell flow**: Supportive message → optional memo (trigger, feeling, what, cost)
6. **Statistics**: Streak, best streak, resists vs smells, money saved with milestones, trigger breakdown
7. **Log**: Unified history with details, date pickers and delete
8. **Kropp (Body)**: Single scrollable page with range picker, stat cards, metric toggle, weight/body-composition chart, per-goal milestone progress bars, body goals settings
9. **Withings**: OAuth connection + manual "Synkroniser" (pulls 365 days of weight into `weights`)
10. **Settings**: Goals, triggers, milestones, cost per smell, profile, Withings connection

## Known Issues / Current Focus
- **Streak logic** (`src/utils/streak.js`) needs fixing; see tests in `streak.test.js`.
- **Workouts have no UI.** `wko` is loaded and `addWorkout` / delete exist in `App.jsx`, but the Kropp redesign removed the workout log. A new workout feature is planned.
- Withings automatic sync (webhooks) is not implemented; manual sync only. Plan is in Claude project memory. Not the current priority.

## Conventions
- Keep changes small and in the existing style (inline styles, theme constants, Norwegian copy).
- Add or update Vitest tests for logic changes; keep `TESTS.md` user stories in sync with new features.
- New tables/columns go in a numbered SQL file in `supabase/migrations/` with RLS on `user_id`.
