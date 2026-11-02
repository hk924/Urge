-- Home strength training: sessions (one per workout) and logged sets.
-- Exercises and routines live in code (src/constants/exercises.js, program.js);
-- exercise_id references the catalog id.

create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  routine text not null,              -- 'A' | 'B'
  block int not null default 0,       -- 0 | 1 (4-week variant block)
  plan jsonb,                         -- warmup/main/core exercise ids for this session
  date date not null default current_date,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  note text
);

create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id text not null,
  set_no int not null,
  reps int,
  weight_kg numeric(5,2),
  seconds int,
  effort text check (effort in ('lett', 'passe', 'tungt')),
  created_at timestamptz not null default now()
);

create index if not exists workout_sessions_user_idx on workout_sessions (user_id, started_at desc);
create index if not exists workout_sets_session_idx on workout_sets (session_id);
create index if not exists workout_sets_user_ex_idx on workout_sets (user_id, exercise_id);

alter table workout_sessions enable row level security;
alter table workout_sets enable row level security;

create policy "own sessions select" on workout_sessions for select using (auth.uid() = user_id);
create policy "own sessions insert" on workout_sessions for insert with check (auth.uid() = user_id);
create policy "own sessions update" on workout_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sessions delete" on workout_sessions for delete using (auth.uid() = user_id);

create policy "own sets select" on workout_sets for select using (auth.uid() = user_id);
create policy "own sets insert" on workout_sets for insert with check (auth.uid() = user_id);
create policy "own sets update" on workout_sets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sets delete" on workout_sets for delete using (auth.uid() = user_id);
