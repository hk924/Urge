-- Withings OAuth token storage (service_role only - no RLS policies)
create table if not exists withings_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  withings_user_id text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  scope text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table withings_tokens enable row level security;
-- No policies: only service_role can access

-- Add source and external_id to weights
alter table weights add column if not exists source text not null default 'manual';
alter table weights add column if not exists external_id text;

-- Unique index to prevent duplicate Withings entries
create unique index if not exists weights_external_id_idx on weights (external_id) where external_id is not null;
