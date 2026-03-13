# Urge App

## What This Is
Urge is a personal habit-tracking PWA for resisting temptations (snacking, impulse purchases, etc). Users log "resists" (successfully resisted a temptation) and "smells" (gave in), track streaks, money saved, weight, workouts, and daily mood check-ins. The app delivers personalized motivational messages based on the user's goals and "why".

## Current State
The entire app lives in a single HTML file (`index.html`) with inline React (via Babel), inline CSS, and a Supabase backend. It works but is hard to maintain and debug. This needs to be converted to a proper project structure.

## Tech Stack
- **Frontend:** React 18 (currently loaded via CDN with Babel transform in browser)
- **Backend:** Supabase (auth with OTP, database for all data)
- **Styling:** Inline styles with a dark glassmorphism theme
- **Fonts:** DM Mono + Source Serif 4 (Google Fonts)

## Supabase Setup
- URL: `https://jchowzpazakxxqhpmzgx.supabase.co`
- The anon key is in the source code (this is fine for client-side, it's designed for this)
- Auth: Email OTP (magic link)
- Tables: `profiles`, `resists`, `smells`, `checkins`, `weights`, `workouts`
- All tables use `user_id` for row-level security

## Database Schema (current tables)
- **profiles**: id, name, email, goals (jsonb), config (jsonb)
- **resists**: id, user_id, trigger_type, date, logged_at
- **smells**: id, user_id, trigger_text, feeling, what, cost, date, logged_at
- **checkins**: id, user_id, mood, mood_id, date
- **weights**: id, user_id, kg, fat, muscle, date
- **workouts**: id, user_id, type, duration, date

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

## Key Features
1. **Auth**: Email OTP login via Supabase
2. **Onboarding**: Goal selection + "why" selection (2 steps)
3. **Home**: Streak counter, money saved, motivational quote, daily mood check-in, resist/smell buttons
4. **Resist flow**: Select trigger type → confirmation with confetti + motivational message + stats
5. **Smell flow**: Supportive message → optional memo (trigger, feeling, what, cost)
6. **Statistics**: Streak, best streak, resists vs smells, money saved with milestones, trigger breakdown
7. **Log**: Smell history with details, total spent
8. **Body**: Weight tracking with chart, body composition, workout log
9. **Settings**: Edit goals, triggers, milestones, cost per smell, profile

## Language
The app UI is in Norwegian (Bokmål). Keep all user-facing text in Norwegian.

## First Task
Convert this single-file app into a proper Vite + React project:
1. Initialize with `npm create vite@latest . -- --template react`
2. Move Supabase config to `.env` file (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
3. Create `.gitignore` with node_modules, .env, dist
4. Split into components: Auth, Onboarding, Home, ResistFlow, SmellFlow, Stats, Log, Body, Settings, TabBar
5. Extract shared styles/theme to a constants file
6. Keep Supabase client setup in its own file (src/lib/supabase.js)
7. Keep all functionality exactly the same — this is a refactor, not a redesign
8. Test that it runs with `npm run dev`
