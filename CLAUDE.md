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
  constants/exercises.js  Generated home-training exercise catalog (images in public/exercises/)
  constants/program.js Routines A/B, 4-week variant blocks, warm-up/core rotation, buildPlan
  lib/useTraining.js   Training data hook (workout_sessions, workout_sets) + mutations
  utils/progression.js Last performance, next-session suggestion, records, history
  utils/helpers.js     Date helpers (td, fd, fds, ago, agl) + gmq (motivational message generator)
  utils/streak.js      calcCurrentStreak, calcBestStreak, calcMoneySaved
  components/          Auth, Onboarding, Home, ResistFlow, SmellFlow, Stats, Log, Body, BodyChart,
                       Settings, TabBar, Chart, Confetti, FlameIcon, TriggerIcon, ErrToast,
                       Training (tab), WorkoutSession (guided workout), ExerciseVisual
  components/__tests__ Component tests
supabase/
  migrations/          SQL migrations (001_withings.sql, 002_training.sql)
  functions/           withings-auth, withings-callback, withings-sync, _shared (cors, withings)
TESTS.md               User stories / test scenarios (Norwegian)
```

## Architecture Notes
- All state lives in `App.jsx` (short, terse state names like `res`, `sml`, `chk`, `wgt`, `wko`); components are mostly presentational and receive data + callbacks via props.
- `loadData` runs the Supabase queries in parallel; `body_goals` is fetched separately so an RLS problem there can't stall the app.
- Auth is driven by `onAuthStateChange` (needed for PWA session persistence).
- Heavier components are lazy-loaded for fast startup.
- Tabs (`TabBar.jsx`): Hjem, Statistikk, Trening, Kropp. Logg opens from a button in Statistikk. Settings opens as an overlay.
- Training state comes from `useTraining` (called in App). Every set is saved immediately so a workout can be resumed.
- Dates are stored as local `YYYY-MM-DD` strings (`td()`), not UTC timestamps.

## Database Schema
- **profiles**: id, name, email, goals (jsonb), config (jsonb: triggers, milestones, cost per smell, etc.)
- **resists**: id, user_id, trigger_type, date, logged_at
- **smells**: id, user_id, trigger_text, feeling, what, cost, date, logged_at
- **checkins**: id, user_id, mood, mood_id, date
- **weights**: id, user_id, kg, fat, muscle, date, source ('manual' | 'withings'), external_id (unique when set)
- **workouts**: id, user_id, type, duration, date (legacy cardio log, no UI currently)
- **workout_sessions**: id, user_id, routine ('A'|'B'), block (0|1), plan (jsonb), date, started_at, finished_at, note
- **workout_sets**: id, user_id, session_id, exercise_id (catalog id), set_no, reps, weight_kg, seconds, effort ('lett'|'passe'|'tungt')
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
11. **Trening**: Guided ~30 min home workouts (adjustable dumbbells + bodyweight, a flat furniture bench, no pull-up bar yet).
    - Routines A (bein + skyv) and B (hofte + trekk) alternate. Main exercises fixed per 4-week block, then switch to variant; warm-up and core rotate each session.
    - Flow: warm-up timers -> main sets with "Sist" / "I dag" suggestion, set logging, 60 s rest -> effort (Lett/Passe/Tungt) -> core -> summary with progress deltas.
    - Progression: double progression (add reps to repMax, then +inc kg); "Tungt" holds or lowers load.
    - Progress view per exercise (chart, record, history) and session history.

## Training Context (important)
The user is rebuilding after open-heart surgery (past the restricted phase). Keep intensity moderate: talk test (should be able to speak during sets), breathe through lifts (no breath holding), small load jumps, no max-effort features. Long-term goals: stronger core and doing pull-ups (add a pull-up progression when they get a doorframe bar). Exercise photos come from free-exercise-db (Unlicense); do not use copyrighted poster illustrations.

## Known Issues / Current Focus
- `Body.test.jsx` (14 tests) is stale: it tests the pre-redesign Kropp tabs and fails. Rewrite against the current Body page.
- Next for Trening: pull-up progression once a bar is available.
- Withings automatic sync (webhooks) is not implemented; manual sync only. Plan is in Claude project memory. Not the current priority.

## Conventions
- Keep changes small and in the existing style (inline styles, theme constants, Norwegian copy).
- Work on the `dev` branch (Vercel preview: https://urge-git-dev-hk924s-projects.vercel.app). Merge to `main` (production) only when the user approves. Bump `CACHE_NAME` in `public/sw.js` on each release. Preview and prod share one Supabase project.
- Add or update Vitest tests for logic changes; keep `TESTS.md` user stories in sync with new features.
- New tables/columns go in a numbered SQL file in `supabase/migrations/` with RLS on `user_id`.
